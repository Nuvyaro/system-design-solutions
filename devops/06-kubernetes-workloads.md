# Kubernetes 2: Workloads — Pods, Deployments, StatefulSets, DaemonSets, Jobs

> **In one sentence:** you rarely create pods directly; you pick a workload controller that matches how your app behaves — stateless, stateful, per-node, or run-to-completion — and it manages the pods for you.

**Level:** Beginner → Intermediate · **You'll learn:** the YAML for each workload type, rolling updates and rollbacks, init containers and sidecars.

## See it in action: rolling update

<div class="sim" data-sim="rolling-update"><em>Interactive animation available on the website.</em></div>

Deploy v2 and watch Kubernetes replace pods one at a time, sending traffic only to pods that pass their readiness probe. Try a **broken v2**: the rollout stalls, v1 keeps serving, and you can roll back.

## Choosing a workload

| Your app… | Use | Example |
|-----------|-----|---------|
| Is stateless, many identical copies | **Deployment** | Web APIs, frontends |
| Needs stable identity and its own disk per replica | **StatefulSet** | Databases, Kafka, Redis |
| Must run one copy on every node | **DaemonSet** | Log collectors, monitoring agents, CNI |
| Runs once to completion | **Job** | Database migration, batch processing |
| Runs on a schedule | **CronJob** | Nightly reports, cleanups |

## Pod

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: debug
  labels:
    app: debug
spec:
  containers:
    - name: shell
      image: busybox:1.36
      command: ["sh", "-c", "echo hello; sleep 3600"]
  restartPolicy: Always
```

Pods are **ephemeral** — if the node dies, a bare pod is gone forever. That's why you use controllers.

### Multi-container patterns
- **Init containers** run to completion *before* app containers start (wait for a DB, run migrations, fetch config).
- **Sidecars** run alongside the app (log shipper, proxy). Since Kubernetes 1.29, native sidecars are init containers with `restartPolicy: Always`.

```yaml
spec:
  initContainers:
    - name: wait-for-redis
      image: busybox:1.36
      command: ["sh", "-c", "until nc -z redis 6379; do echo waiting; sleep 2; done"]
  containers:
    - name: api
      image: ghcr.io/nuvyaro/notes-api:1.0.0
```

## Deployment (the workhorse)

This is the tutorial app's Deployment ([full file](examples/k8s/base/deployment.yaml)), trimmed:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: notes-api
spec:
  replicas: 2
  selector:
    matchLabels:
      app: notes-api          # which pods this Deployment owns
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1             # up to 1 extra pod during the update
      maxUnavailable: 0       # never go below 2 ready pods
  template:                   # the pod blueprint
    metadata:
      labels:
        app: notes-api        # MUST match the selector
    spec:
      containers:
        - name: api
          image: ghcr.io/nuvyaro/notes-api:1.0.0
          ports:
            - name: http
              containerPort: 8080
          readinessProbe:
            httpGet: { path: /readyz, port: http }
          livenessProbe:
            httpGet: { path: /healthz, port: http }
```

How it works: **Deployment → ReplicaSet → Pods**. Each new pod template (e.g., a new image) creates a new ReplicaSet; the Deployment scales the new one up and the old one down.

### Rolling updates and rollbacks

```bash
kubectl set image deployment/notes-api api=ghcr.io/nuvyaro/notes-api:1.1.0   # or edit YAML and apply
kubectl rollout status deployment/notes-api
kubectl rollout history deployment/notes-api
kubectl rollout undo deployment/notes-api                 # back to previous revision
kubectl rollout undo deployment/notes-api --to-revision=3
kubectl rollout restart deployment/notes-api              # restart pods (e.g., to pick up a new Secret)
```

Strategies: `RollingUpdate` (default, zero downtime with readiness probes) or `Recreate` (stop all, then start — for apps that can't run two versions at once). Blue/green and canary are covered in [GitOps & deployment strategies](12-gitops-and-deployment-strategies.md).

## StatefulSet

Gives each replica a **stable name** (`redis-0`, `redis-1`), **stable network identity** (via a headless Service), and **its own PersistentVolume** that follows it when rescheduled. Pods start and stop in order.

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: redis
spec:
  serviceName: redis
  replicas: 1
  selector:
    matchLabels: { app: redis }
  template:
    metadata:
      labels: { app: redis }
    spec:
      containers:
        - name: redis
          image: redis:7.2-alpine
          volumeMounts:
            - name: data
              mountPath: /data
  volumeClaimTemplates:       # creates PVC "data-redis-0", "data-redis-1", …
    - metadata:
        name: data
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 1Gi
```

> Running databases on Kubernetes is possible (often with an **Operator**), but many teams use managed databases and keep Kubernetes for stateless services.

## DaemonSet

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: node-logger
spec:
  selector:
    matchLabels: { app: node-logger }
  template:
    metadata:
      labels: { app: node-logger }
    spec:
      tolerations:
        - operator: Exists          # also run on tainted nodes (e.g., control plane)
      containers:
        - name: agent
          image: fluent/fluent-bit:3.1
          volumeMounts:
            - name: varlog
              mountPath: /var/log
              readOnly: true
      volumes:
        - name: varlog
          hostPath:
            path: /var/log
```

## Job and CronJob

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migrate
spec:
  backoffLimit: 3             # retries before marking failed
  activeDeadlineSeconds: 600
  ttlSecondsAfterFinished: 3600
  template:
    spec:
      restartPolicy: Never    # Jobs require Never or OnFailure
      containers:
        - name: migrate
          image: ghcr.io/nuvyaro/notes-api:1.1.0
          command: ["python", "-c", "print('running migrations')"]
---
apiVersion: batch/v1
kind: CronJob
metadata:
  name: nightly-report
spec:
  schedule: "0 2 * * *"       # 02:00 every day (cluster time zone, or set spec.timeZone)
  timeZone: "Etc/UTC"
  concurrencyPolicy: Forbid   # skip if the previous run is still going
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: OnFailure
          containers:
            - name: report
              image: busybox:1.36
              command: ["sh", "-c", "date; echo report done"]
```

Parallel batch: set `completions` and `parallelism` on a Job (e.g., process 100 shards, 10 at a time).

## Quick check

**Q: Your new image crashes on start. With `maxUnavailable: 0` and readiness probes, do users see errors?**

A: No. New pods never become ready, so the rollout stalls and old pods keep serving traffic. Run `kubectl rollout undo` (or fix forward).

**Q: Why use a StatefulSet instead of a Deployment for a database?**

A: Each replica needs a stable identity and its own persistent volume that reattaches after rescheduling; Deployment pods are interchangeable and share one template without per-pod storage.

**Next:** [Networking: Services, Ingress, DNS](07-kubernetes-networking.md)
