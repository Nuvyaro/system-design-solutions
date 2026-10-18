# Kubernetes 5: Production Readiness — Resources, Probes, Autoscaling, Security

> **In one sentence:** a production workload declares how much CPU and memory it needs, tells Kubernetes how to check its health, scales automatically, survives node maintenance, and runs with the least privilege possible.

**Level:** Advanced · **You'll learn:** requests/limits and QoS, liveness/readiness/startup probes, HPA/VPA/cluster autoscaling, PodDisruptionBudgets, scheduling controls, RBAC and pod security, observability.

## See it in action: autoscaling

<div class="sim" data-sim="k8s-self-heal" data-mode="hpa"><em>Interactive animation available on the website.</em></div>

Raise the traffic: the Horizontal Pod Autoscaler adds pods when average CPU rises above the 70% target, and removes them when load drops.

## 1. Resource requests and limits

```yaml
resources:
  requests:          # reserved; used by the scheduler to place the pod
    cpu: 100m        # 0.1 CPU core
    memory: 128Mi
  limits:            # hard ceiling
    memory: 256Mi    # exceeding memory → container is OOMKilled
    # cpu limit omitted on purpose: CPU limits cause throttling; many teams set only requests
```

| Situation | Result |
|-----------|--------|
| No requests | Scheduler packs blindly → noisy neighbors, evictions |
| Over CPU limit | Throttled (slower), not killed |
| Over memory limit | **OOMKilled** and restarted |
| Node under memory pressure | Pods evicted, lowest QoS first |

**QoS classes:** `Guaranteed` (requests = limits for all resources), `Burstable` (some requests), `BestEffort` (none — first to be evicted).

**How to choose values:** start from observed usage (metrics/VPA recommendations), set requests near typical usage (p50–p90) and memory limits with headroom above the peak.

## 2. Health probes

```yaml
startupProbe:          # for slow starters: other probes wait until this succeeds
  httpGet: { path: /healthz, port: http }
  failureThreshold: 30
  periodSeconds: 2     # up to 60 s to start
readinessProbe:        # "can I receive traffic?" — failing removes the pod from Service endpoints
  httpGet: { path: /readyz, port: http }
  periodSeconds: 5
livenessProbe:         # "am I stuck?" — failing restarts the container
  httpGet: { path: /healthz, port: http }
  periodSeconds: 10
  failureThreshold: 3
```

| Probe | Failure means | Should check |
|-------|---------------|--------------|
| Readiness | Stop sending traffic | Dependencies needed to serve (DB reachable, cache warm) |
| Liveness | Restart the container | Only the process itself (deadlock). **Never** check external dependencies — a DB outage would restart every pod |
| Startup | Keep waiting / restart if never ready | Initialization finished |

Also handle **graceful shutdown**: on SIGTERM, stop accepting new requests, finish in-flight ones, then exit within `terminationGracePeriodSeconds` (default 30 s). A small `preStop: sleep 5` hook helps load balancers drain.

## 3. Autoscaling

| Autoscaler | Scales | Based on |
|------------|--------|----------|
| **HorizontalPodAutoscaler (HPA)** | Number of pods | CPU/memory utilization, custom or external metrics |
| **VerticalPodAutoscaler (VPA)** | Pod requests/limits | Historical usage (often in "recommend only" mode) |
| **Cluster Autoscaler / Karpenter** | Number of nodes | Pending pods that don't fit |
| **KEDA** | Pods, including to zero | Event sources: queue length, Kafka lag, cron |

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: notes-api
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: notes-api
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70     # % of the CPU request — requests are required!
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300  # avoid flapping
```

HPA needs **metrics-server** installed. When HPA manages replicas, don't also hard-code `replicas` in the Deployment you re-apply (it would fight the autoscaler).

## 4. Availability during disruptions

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: notes-api
spec:
  minAvailable: 1        # or maxUnavailable: 1
  selector:
    matchLabels:
      app: notes-api
```

PDBs protect against *voluntary* disruptions (node drains, cluster upgrades). Spread replicas so one failure doesn't take them all:

```yaml
spec:
  topologySpreadConstraints:
    - maxSkew: 1
      topologyKey: topology.kubernetes.io/zone   # spread across availability zones
      whenUnsatisfiable: ScheduleAnyway
      labelSelector:
        matchLabels:
          app: notes-api
```

## 5. Scheduling controls

| Tool | Purpose | Example |
|------|---------|---------|
| `nodeSelector` | Run only on matching nodes | `disktype: ssd` |
| Node affinity | Richer required/preferred node rules | Prefer GPU nodes |
| Pod (anti-)affinity | Co-locate or separate pods | Don't put two replicas on one node |
| Taints & tolerations | Nodes repel pods unless tolerated | Dedicated GPU or system nodes |
| PriorityClass | Who gets evicted first | Critical services above batch jobs |

## 6. Security

**Pod security context** (the tutorial app uses all of these):

```yaml
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 10001
    seccompProfile:
      type: RuntimeDefault
  containers:
    - name: api
      securityContext:
        allowPrivilegeEscalation: false
        readOnlyRootFilesystem: true
        capabilities:
          drop: ["ALL"]
```

Enforce cluster-wide with **Pod Security Admission** labels on namespaces:
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: notes-prod
  labels:
    pod-security.kubernetes.io/enforce: restricted
```

**RBAC** — grant the minimum needed:

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: deployer
  namespace: notes-staging
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: deploy-notes
  namespace: notes-staging
rules:
  - apiGroups: ["apps"]
    resources: ["deployments"]
    verbs: ["get", "list", "patch", "update"]
  - apiGroups: [""]
    resources: ["services", "configmaps"]
    verbs: ["get", "list", "create", "update", "patch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: deployer-can-deploy
  namespace: notes-staging
subjects:
  - kind: ServiceAccount
    name: deployer
    namespace: notes-staging
roleRef:
  kind: Role
  name: deploy-notes
  apiGroup: rbac.authorization.k8s.io
```

More: NetworkPolicies (default deny), image signing and admission policies (Kyverno / OPA Gatekeeper), scanning images in CI, `automountServiceAccountToken: false` for pods that don't call the API, and **ResourceQuotas / LimitRanges** per namespace.

## 7. Observability

- **Metrics:** Prometheus + Grafana (kube-state-metrics, node-exporter, app metrics); alert on SLOs.
- **Logs:** apps log to stdout/stderr; a DaemonSet (Fluent Bit, Vector) ships them to Loki/Elasticsearch/cloud logging.
- **Traces:** OpenTelemetry SDKs + collector → Jaeger/Tempo.
- **Events:** `kubectl get events --sort-by=.lastTimestamp` — the first place to look.

## Production checklist

- [ ] Image pinned to an immutable tag or digest; non-root; scanned
- [ ] Requests set (CPU + memory), memory limit set
- [ ] Readiness, liveness (and startup if slow) probes; graceful shutdown
- [ ] ≥ 2 replicas, PDB, spread across zones
- [ ] HPA (and cluster autoscaling) configured
- [ ] ConfigMaps/Secrets externalized; secrets not in git
- [ ] securityContext hardened; namespace Pod Security `restricted`
- [ ] NetworkPolicies; RBAC least privilege
- [ ] Dashboards, alerts, logs, traces; runbooks
- [ ] Backups for stateful data tested by restoring

## Quick check

**Q: Should a liveness probe check the database connection?**

A: No. If the database goes down, every pod would fail liveness and restart in a loop, making the outage worse. Put dependency checks in the readiness probe; liveness checks only that the process is responsive.

**Q: The HPA shows `<unknown>/70%`. What's missing?**

A: Usually metrics-server isn't installed, or the pods have no CPU **requests** (utilization is a percentage of the request).

**Next:** [Helm & Kustomize](10-helm-and-kustomize.md)
