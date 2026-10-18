# Troubleshooting & Cheat Sheet: Docker, Kubernetes, CI/CD

> **In one sentence:** most problems are diagnosed with four commands — `get`, `describe`, `logs`, and `events` — plus knowing what each error status means.

**Level:** Reference · Bookmark this page.

## The debugging flow

<div class="sim" data-sim="pipeline" data-title="Pod not working? Follow the arrows" data-steps="kubectl get pods|STATUS?|kubectl describe pod|kubectl logs|kubectl logs --previous|Check Service endpoints|kubectl exec / debug" data-labels="Find the broken pod and its status|Pending, ImagePullBackOff, CrashLoopBackOff, Running but not READY|Read the Events section at the bottom|What did the app print?|Logs from the crashed container instance|Empty? labels/selector or readiness problem|Test from inside the cluster"><em>Interactive animation available on the website.</em></div>

## Pod status → cause → fix

| Status / symptom | Likely cause | Fix |
|------------------|--------------|-----|
| `Pending` | No node has enough CPU/memory for the requests; PVC not bound; taints/affinity don't match | `kubectl describe pod` → Events; lower requests, add nodes, fix StorageClass/affinity |
| `ImagePullBackOff` / `ErrImagePull` | Wrong image name/tag; private registry without credentials | Check spelling and tag exists; add `imagePullSecrets`; for kind use `kind load docker-image` |
| `CrashLoopBackOff` | App exits on start (bad config, missing env var, can't reach dependency) | `kubectl logs <pod> --previous`; check env/ConfigMap/Secret names |
| `OOMKilled` (in `describe`, last state) | Exceeded memory limit | Raise limit or fix the leak; check actual usage with `kubectl top pod` |
| `Running` but `READY 0/1` | Readiness probe failing | Check probe path/port; `kubectl describe` shows probe errors; is the dependency up? |
| Restarts keep increasing | Liveness probe failing or app crashing | Probe too aggressive (`initialDelaySeconds`, use a startupProbe), or app bug |
| `CreateContainerConfigError` | Referenced ConfigMap/Secret or key doesn't exist | Create it or fix the name/key |
| `Terminating` forever | Finalizers or a stuck node | Check `metadata.finalizers`; last resort `--grace-period=0 --force` |
| Service unreachable | Selector doesn't match labels; wrong `targetPort`; NetworkPolicy blocking | `kubectl get endpointslices`; compare labels; test with a debug pod |

## kubectl cheat sheet

```bash
# Context & namespace
kubectl config get-contexts
kubectl config use-context kind-notes
kubectl config set-context --current --namespace=notes-staging

# Inspect
kubectl get pods -o wide                    # node and IP
kubectl get all -n notes-staging
kubectl get deploy notes-api -o yaml
kubectl describe pod <pod>
kubectl get events --sort-by=.lastTimestamp
kubectl top pods                            # needs metrics-server
kubectl explain deployment.spec.strategy

# Logs & shells
kubectl logs <pod> -c <container> -f --since=10m
kubectl logs deploy/notes-api --all-containers
kubectl logs <pod> --previous
kubectl exec -it <pod> -- sh
kubectl debug -it <pod> --image=busybox:1.36 --target=api   # ephemeral debug container (for distroless images)
kubectl run tmp --rm -it --image=nicolaka/netshoot -- bash  # network toolbox

# Change
kubectl apply -f file.yaml | -k dir/
kubectl diff -f file.yaml
kubectl rollout status|history|undo|restart deployment/notes-api
kubectl scale deployment notes-api --replicas=3
kubectl set image deployment/notes-api api=repo/img:tag
kubectl port-forward svc/notes-api 8080:80
kubectl delete pod <pod>                   # controller recreates it

# Nodes
kubectl cordon <node>                      # no new pods
kubectl drain <node> --ignore-daemonsets --delete-emptydir-data
kubectl uncordon <node>
```

## Docker cheat sheet

```bash
docker build -t app:1.0 .                 docker images / docker rmi app:1.0
docker run -d -p 8080:80 --name web img   docker ps -a / docker stop web / docker rm web
docker logs -f web                        docker exec -it web sh
docker inspect web                        docker stats
docker network ls / create / inspect      docker volume ls / create / rm
docker compose up -d --build              docker compose logs -f / down -v
docker system df / docker system prune    docker history app:1.0
```

Common Docker issues:

| Problem | Fix |
|---------|-----|
| `port is already allocated` | Another container/process uses the host port: change `-p 9090:80` or stop it |
| Container exits immediately | The main process ended — check `docker logs`; the CMD must stay in the foreground |
| Can't reach another container via `localhost` | Use the container/service name on a shared network |
| Builds are slow | Reorder Dockerfile for caching; add `.dockerignore`; use BuildKit cache |
| Image is huge | Multi-stage build, slim/distroless base, clean caches in the same `RUN` |
| `permission denied` writing files | Running as non-root: write to a volume or `/tmp`, or `chown` in the Dockerfile |

## CI/CD troubleshooting

| Symptom | Check |
|---------|-------|
| Workflow doesn't start | File in `.github/workflows/`? YAML valid (`actionlint`)? Trigger branch matches? |
| `denied: permission_denied` pushing to GHCR | Job needs `permissions: packages: write`; image name must be lowercase |
| Works locally, fails in CI | Different versions — pin tool/runtime versions; missing env vars/secrets |
| Secrets empty in PRs from forks | By design: secrets aren't passed to fork PRs |
| Deploy succeeded but app is broken | Add `rollout status`, smoke tests, and automatic `rollout undo` |
| Slow pipelines | Cache dependencies (`setup-*` cache), Docker layer cache (`type=gha`), run jobs in parallel, use `concurrency` to cancel stale runs |

## YAML quick reference

```yaml
key: value                 # map entry
list:
  - item                   # list item
nested:
  child: 1
multiline: |               # keep newlines
  line 1
  line 2
quoted: "1.20"             # keep as string
---                        # next document
```

## Where to go next

- **Certifications:** CKAD (developer), CKA (administrator), CKS (security).
- **Practice:** Killercoda / Play with Kubernetes scenarios; break things in a kind cluster on purpose.
- **Go deeper:** service meshes, Operators and CRDs, cluster autoscaling with Karpenter, policy-as-code (Kyverno), supply-chain security (cosign, SBOMs, SLSA).
