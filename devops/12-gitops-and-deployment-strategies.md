# CI/CD 2: GitOps & Deployment Strategies

> **In one sentence:** with GitOps, git is the single source of truth for what runs in the cluster and an agent inside the cluster continuously syncs to it; deployment strategies like canary and blue/green reduce the blast radius of each release.

**Level:** Advanced · **You'll learn:** push vs pull deployments, Argo CD, promoting releases between environments, rolling / blue-green / canary / feature flags, progressive delivery.

## See it in action: GitOps loop

<div class="sim" data-sim="pipeline" data-title="GitOps with Argo CD" data-steps="Merge app PR|CI builds image|CI bumps tag in config repo|Argo CD detects change|Sync to cluster|Health checks|Drift? Re-sync" data-labels="Code reviewed and merged|ghcr.io/…/notes-api:sha-a1b2c3d|kustomize edit set image → commit|Polls git or receives a webhook|Applies manifests from git|Waits for rollout to be healthy|Manual kubectl changes are reverted to match git"><em>Interactive animation available on the website.</em></div>

## Push vs pull (GitOps)

| | Push (CI deploys) | Pull / GitOps (agent syncs) |
|---|---|---|
| Who applies changes | The CI pipeline runs `kubectl apply` | An in-cluster agent (Argo CD, Flux) |
| Cluster credentials | Stored in CI | Stay inside the cluster |
| Source of truth | Whatever was last applied | Git — always |
| Drift (manual changes) | Undetected | Detected and auto-corrected |
| Rollback | Re-run an old pipeline | `git revert` |
| Audit trail | CI logs | Git history (who, what, when, why) |

The previous lesson used push. GitOps is the common next step for teams running many services.

## Repository layout

Keep application code and deployment config separate (or at least separate folders):

```
app-repo/                     config-repo/ (GitOps repo)
├── src/                      ├── apps/notes-api/
├── Dockerfile                │   ├── base/
└── .github/workflows/ci.yml  │   └── overlays/{staging,production}/
                              └── argocd/  (Application definitions)
```

CI in the app repo builds and pushes the image, then opens a PR (or commits) in the config repo bumping the tag:

```yaml
      - name: Bump staging image tag in the GitOps repo
        run: |
          git clone https://x-access-token:${{ secrets.GITOPS_TOKEN }}@github.com/my-org/config-repo.git
          cd config-repo/apps/notes-api/overlays/staging
          kustomize edit set image notes-api=ghcr.io/my-org/notes-api:${{ needs.build.outputs.tag }}
          git config user.name "ci-bot" && git config user.email "ci-bot@users.noreply.github.com"
          git commit -am "notes-api staging → ${{ needs.build.outputs.tag }}" && git push
```

Tools like **Argo CD Image Updater** or **Flux image automation** can do this bump automatically.

## Argo CD Application

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: notes-api-staging
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/my-org/config-repo.git
    targetRevision: main
    path: apps/notes-api/overlays/staging    # Kustomize dir (Helm charts work too)
  destination:
    server: https://kubernetes.default.svc
    namespace: notes-staging
  syncPolicy:
    automated:
      prune: true        # delete resources removed from git
      selfHeal: true     # revert manual drift
    syncOptions:
      - CreateNamespace=true
```

**Promotion to production** = a PR that copies the tested tag into `overlays/production`, reviewed and merged by a human — the approval gate is a code review.

## Deployment strategies

| Strategy | How | Pros | Cons |
|----------|-----|------|------|
| **Recreate** | Stop all old, start all new | Simple; no version overlap | Downtime |
| **Rolling update** (K8s default) | Replace pods gradually | Zero downtime, no extra infra | Both versions live at once; rollback is another rollout |
| **Blue/green** | Run full new stack (green) beside old (blue); switch traffic at once | Instant switch and instant rollback | 2× resources during deploy; DB migrations must be compatible |
| **Canary** | Send 1% → 10% → 50% → 100% of traffic to the new version, checking metrics at each step | Small blast radius; real-traffic validation | Needs traffic splitting + good metrics |
| **Feature flags** | Ship code dark; enable per user/percentage at runtime | Decouple deploy from release; instant kill switch | Flag debt; needs a flag service |

### Blue/green with plain Kubernetes
Two Deployments (`notes-api-blue`, `notes-api-green`) with a `version` label; the Service selector decides who gets traffic:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: notes-api
spec:
  selector:
    app: notes-api
    version: green      # flip between blue and green to switch (and to roll back)
  ports:
    - port: 80
      targetPort: 8080
```

### Canary with Argo Rollouts (progressive delivery)

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: notes-api
spec:
  replicas: 5
  selector:
    matchLabels:
      app: notes-api
  template:
    metadata:
      labels:
        app: notes-api
    spec:
      containers:
        - name: api
          image: ghcr.io/nuvyaro/notes-api:sha-a1b2c3d
  strategy:
    canary:
      steps:
        - setWeight: 10
        - pause: { duration: 5m }
        - analysis:                   # query Prometheus; abort automatically if error rate is high
            templates:
              - templateName: error-rate-below-1pct
        - setWeight: 50
        - pause: { duration: 10m }
        - setWeight: 100
```

Flagger offers the same with Flux/service meshes.

## Database migrations: the hidden trap

Rolling, blue/green, and canary all run **old and new code at the same time**, so schema changes must be backward compatible. Use **expand → migrate → contract**:
1. **Expand:** add the new column/table (old code ignores it). Deploy.
2. **Migrate:** new code writes both, backfill data. Deploy.
3. **Contract:** remove the old column once no code uses it. Deploy.

Run migrations as a Kubernetes Job (or Helm hook / Argo CD sync hook) before the app rollout.

## Quick check

**Q: Someone runs `kubectl scale deployment notes-api --replicas=10` in production. What does Argo CD with `selfHeal: true` do?**

A: It detects the drift from git (which says 3) and scales back to 3. To change replicas permanently, change git.

**Q: Why are backward-compatible database migrations required for rolling and canary deployments?**

A: Both versions of the app run simultaneously against the same database during the rollout; a breaking schema change would crash the old (or new) pods.

**Next:** [Capstone: end-to-end project](13-capstone-end-to-end.md)
