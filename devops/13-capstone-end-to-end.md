# Capstone: From Code to Production, End to End

> **In one sentence:** put every lesson together — containerize the app, run it with Compose, deploy it to a local Kubernetes cluster with Kustomize or Helm, and wire up a CI/CD pipeline that ships every commit.

**Level:** All levels · **Time:** 1–2 hours · **You need:** Docker, `kubectl`, `kind`, optionally `helm`, and a GitHub account.

## The journey

<div class="sim" data-sim="pipeline" data-title="Capstone milestones" data-steps="Run tests|Build image|Compose stack|Create cluster|Deploy with Kustomize|Scale & self-heal|Rolling update|Helm release|CI/CD pipeline" data-labels="pytest on the app|Multi-stage, non-root, ~200 MB|api + redis with a named volume|kind create cluster|kubectl apply -k overlays/staging|kubectl scale, delete a pod|New image tag, zero downtime|helm upgrade --install|GitHub Actions: test → build → deploy"><em>Interactive animation available on the website.</em></div>

All files live in [`devops/examples`](examples/app/app.py):

```
devops/examples/
├── app/                    Flask "notes-api" + tests + Dockerfile + docker-compose.yml
├── k8s/base/               Deployment, Service, Ingress, HPA, PDB, NetworkPolicy, Redis StatefulSet
├── k8s/overlays/           staging / production patches (Kustomize)
├── helm/notes-api/         the same app as a Helm chart
└── github-actions/ci-cd.yml  full pipeline
```

These files are tested: unit tests pass, the image builds and runs, both overlays and the rendered Helm chart validate against the Kubernetes 1.30 schemas with `kubeconform`, and the workflow passes `actionlint`.

## Milestone 1 — run the tests

```bash
cd devops/examples/app
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt pytest
pytest -q          # 4 passed
```

## Milestone 2 — build and run the container

```bash
docker build -t notes-api:dev --build-arg APP_VERSION=dev .
docker run --rm -p 8080:8080 notes-api:dev
curl localhost:8080/healthz     # {"status":"ok"}
curl localhost:8080/readyz      # 503 — no Redis yet (that's the readiness probe working!)
```

Check what you built: `docker history notes-api:dev`, `docker run --rm notes-api:dev id` → `uid=10001(appuser)`.

## Milestone 3 — full stack with Docker Compose

```bash
docker compose up --build -d
curl localhost:8080/                                  # visits counter increments
curl -X POST localhost:8080/notes -H 'content-type: application/json' -d '{"text":"learn k8s"}'
curl localhost:8080/notes
docker compose down && docker compose up -d && curl localhost:8080/notes   # still there: named volume
docker compose down -v                                # remove everything including data
```

## Milestone 4 — a local Kubernetes cluster

```bash
kind create cluster --name notes
kind load docker-image notes-api:dev --name notes     # make the local image available to the cluster
kubectl get nodes
```

## Milestone 5 — deploy with Kustomize

Point the staging overlay at your local image, then apply:

```bash
cd devops/examples/k8s/overlays/staging
kustomize edit set image notes-api=notes-api:dev      # or: edit newName/newTag in kustomization.yaml
kubectl apply -k .
kubectl -n notes-staging get pods -w                  # wait for Running and READY 1/1
kubectl -n notes-staging port-forward svc/notes-api 8080:80
curl localhost:8080/                                  # "Hello from staging", pod name changes between calls
```

> Without an Ingress controller the Ingress object does nothing — that's fine locally; use port-forward. To try Ingress, install ingress-nginx for kind and add `127.0.0.1 staging.notes.example.com` to `/etc/hosts`.

## Milestone 6 — scale and self-heal

```bash
kubectl -n notes-staging scale deployment notes-api --replicas=4   # note: the HPA may scale it back to its minimum
kubectl -n notes-staging delete pod -l app=notes-api --wait=false
kubectl -n notes-staging get pods -w                               # replacements appear
kubectl -n notes-staging get events --sort-by=.lastTimestamp | tail
```

## Milestone 7 — a zero-downtime rolling update

```bash
cd devops/examples/app
docker build -t notes-api:v2 --build-arg APP_VERSION=v2 . && kind load docker-image notes-api:v2 --name notes
# in one terminal, keep calling the app:
while true; do curl -s localhost:8080/ | grep -o '"version":"[^"]*"'; sleep 0.5; done
# in another:
kubectl -n notes-staging set image deployment/notes-api api=notes-api:v2
kubectl -n notes-staging rollout status deployment/notes-api
# versions switch from dev to v2 with no failed requests
kubectl -n notes-staging rollout undo deployment/notes-api            # and back
```

Break it on purpose: `kubectl -n notes-staging set image deployment/notes-api api=notes-api:does-not-exist` → pods show `ErrImagePull`, old pods keep serving, `rollout undo` fixes it.

## Milestone 8 — the same app with Helm

```bash
kubectl delete -k devops/examples/k8s/overlays/staging    # clean up the Kustomize version (keeps nothing)
kubectl create namespace notes-helm
kubectl -n notes-helm apply -f - <<'EOF'
apiVersion: v1
kind: Service
metadata: { name: redis }
spec: { selector: { app: redis }, ports: [{ port: 6379 }] }
---
apiVersion: apps/v1
kind: Deployment
metadata: { name: redis }
spec:
  selector: { matchLabels: { app: redis } }
  template:
    metadata: { labels: { app: redis } }
    spec: { containers: [{ name: redis, image: "redis:7.2-alpine" }] }
EOF
helm upgrade --install notes devops/examples/helm/notes-api -n notes-helm \
  --set image.repository=notes-api --set image.tag=dev --atomic --wait
helm -n notes-helm list
kubectl -n notes-helm port-forward svc/notes-notes-api 8080:80
```

## Milestone 9 — CI/CD

1. Push this repo (or just `devops/examples`) to your GitHub account.
2. Copy `devops/examples/github-actions/ci-cd.yml` to `.github/workflows/ci-cd.yml`.
3. Open a pull request → the **test**, **build** (without pushing), and **validate-manifests** jobs run.
4. Merge to `main` → the image is pushed to `ghcr.io/<you>/notes-api:sha-xxxxxxx`.
5. To enable deploys, create `staging` and `production` environments with kubeconfig secrets for a real cluster (a cloud cluster — CI runners can't reach your laptop's kind cluster), and add required reviewers to `production`.
6. Stretch goal: switch to GitOps — install Argo CD in your cluster and point an `Application` at `devops/examples/k8s/overlays/staging`.

## Clean up

```bash
kind delete cluster --name notes
docker compose -f devops/examples/app/docker-compose.yml down -v
```

## What you've built

- A secure, small, multi-stage container image
- A local multi-service environment
- Kubernetes manifests with probes, resources, autoscaling, disruption budgets, network policy, and persistent storage
- Environment overlays and a Helm chart
- A CI/CD pipeline with tests, image scanning, manifest validation, staged deploys, approvals, and automatic rollback

Keep [the troubleshooting cheat sheet](14-troubleshooting-cheatsheet.md) open while you work.
