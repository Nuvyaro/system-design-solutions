# Kubernetes 3: Networking — Services, Ingress, DNS & Network Policies

> **In one sentence:** pods come and go with changing IPs, so Kubernetes gives each app a stable **Service** name and IP, routes outside HTTP traffic through **Ingress**, and lets you restrict who talks to whom with **NetworkPolicies**.

**Level:** Intermediate · **You'll learn:** Service types, how DNS works in the cluster, Ingress routing and TLS, Gateway API, NetworkPolicies.

## See it in action: a request from the internet to a pod

<div class="sim" data-sim="pipeline" data-title="Life of a request in Kubernetes" data-steps="User|DNS|Cloud load balancer|Ingress controller|Service|Endpoints|Pod" data-labels="https://notes.example.com|Resolves to the load balancer IP|Created by a LoadBalancer Service|NGINX/Traefik reads Ingress rules|Stable virtual IP: notes-api|Only READY pods matching the selector|Container on port 8080"><em>Interactive animation available on the website.</em></div>

## The networking model

- Every pod gets its own IP; all pods can reach all other pods (unless a NetworkPolicy blocks it).
- Containers in the same pod share an IP and talk over `localhost`.
- A **CNI plugin** (Calico, Cilium, Flannel, cloud VPC CNIs) implements this.

## Services

A Service selects pods by label and load-balances to the **ready** ones. The list of matching pod IPs lives in EndpointSlices.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: notes-api
spec:
  type: ClusterIP
  selector:
    app: notes-api        # pods with this label
  ports:
    - name: http
      port: 80            # Service port
      targetPort: http    # container port (name or number)
```

| Type | Reachable from | Use |
|------|----------------|-----|
| **ClusterIP** (default) | Inside the cluster only | Service-to-service |
| **NodePort** | `<any-node-IP>:30000-32767` | Simple external access, on-prem |
| **LoadBalancer** | A cloud load balancer's public IP | Expose one service directly |
| **ExternalName** | DNS alias to an outside name | Point to a managed database |
| **Headless** (`clusterIP: None`) | DNS returns pod IPs directly | StatefulSets (`redis-0.redis`) |

### DNS
CoreDNS gives every Service a name:
- Same namespace: `http://notes-api`
- Other namespace: `http://notes-api.notes-staging`
- Fully qualified: `notes-api.notes-staging.svc.cluster.local`

### Debugging connectivity
```bash
kubectl get endpointslices -l kubernetes.io/service-name=notes-api   # empty = selector/labels or readiness problem
kubectl run tmp --rm -it --image=busybox:1.36 -- sh
/ # wget -qO- http://notes-api/healthz
/ # nslookup notes-api
kubectl port-forward svc/notes-api 8080:80
```

## Ingress: HTTP routing into the cluster

An **Ingress** holds routing rules (host/path → Service); an **Ingress controller** (ingress-nginx, Traefik, a cloud controller) implements them. One load balancer can serve many apps.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: notes-api
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt    # automatic TLS via cert-manager
spec:
  ingressClassName: nginx
  tls:
    - hosts: [notes.example.com]
      secretName: notes-tls
  rules:
    - host: notes.example.com
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: notes-api
                port:
                  name: http
          - path: /
            pathType: Prefix
            backend:
              service:
                name: notes-web
                port:
                  number: 80
```

### Gateway API (the successor)
The newer **Gateway API** splits responsibilities: platform teams own `Gateway` objects (listeners, TLS), app teams own `HTTPRoute`s. It supports traffic splitting (canaries) natively:

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: notes-api
spec:
  parentRefs:
    - name: public-gateway
  hostnames: ["notes.example.com"]
  rules:
    - backendRefs:
        - name: notes-api-v1
          port: 80
          weight: 90
        - name: notes-api-v2
          port: 80
          weight: 10      # 10% canary
```

## NetworkPolicies: a firewall for pods

By default, all pods can talk to all pods. NetworkPolicies restrict that (requires a CNI that enforces them, e.g., Calico or Cilium). From the tutorial app ([file](examples/k8s/base/networkpolicy.yaml)):

```yaml
# Only notes-api pods may connect to Redis on 6379
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: redis-allow-api-only
spec:
  podSelector:
    matchLabels:
      app: redis           # policy applies to Redis pods
  policyTypes: ["Ingress"]
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: notes-api
      ports:
        - port: 6379
```

A good baseline: a **default-deny** policy per namespace, then explicit allows.

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-ingress
spec:
  podSelector: {}          # all pods in the namespace
  policyTypes: ["Ingress"]
```

## Service mesh (advanced, briefly)

Istio, Linkerd, and Cilium service mesh add mutual TLS between services, retries/timeouts, traffic splitting, and rich telemetry — without app code changes. Powerful, but adds operational complexity; adopt when you need those features across many services.

## Quick check

**Q: A Service exists but requests time out. `kubectl get endpointslices` shows no endpoints. Two likely causes?**

A: The Service selector doesn't match the pod labels, or the pods aren't passing their readiness probe (only ready pods become endpoints).

**Q: Why use one Ingress instead of a LoadBalancer Service per app?**

A: One cloud load balancer and one TLS setup can route many hosts/paths to many Services — cheaper and centrally managed.

**Next:** [Configuration & storage](08-kubernetes-config-and-storage.md)
