# Kubernetes 6: Packaging with Helm & Kustomize

> **In one sentence:** instead of copy-pasting YAML for every environment, use **Kustomize** to patch a shared base or **Helm** to template and package your manifests as a versioned chart.

**Level:** Intermediate → Advanced · **You'll learn:** Kustomize bases and overlays, Helm charts, values, templates, releases, and when to use which.

## See it in action

<div class="sim" data-sim="pipeline" data-title="One base, many environments" data-steps="Base manifests|Staging overlay|Production overlay|kustomize build|kubectl apply" data-labels="Deployment, Service, Ingress, HPA… shared by all|namespace notes-staging, 2 replicas, staging host|namespace notes-prod, 3 replicas, real host|Merge base + patches into final YAML|Cluster converges to the result"><em>Interactive animation available on the website.</em></div>

## The problem

Staging and production are 95% identical: different namespace, replica count, hostname, image tag. Duplicating YAML means they drift apart. Two popular solutions:

| | Kustomize | Helm |
|---|---|---|
| Approach | Plain YAML + patches (no templating) | Go templates + values files |
| Built in | Yes (`kubectl apply -k`) | Separate CLI |
| Packaging/versioning | No (just directories) | Yes — charts with versions, repositories, dependencies |
| Install third-party software | Awkward | Excellent (most vendors publish charts) |
| Learning curve | Low | Medium (templating syntax) |
| Best for | Your own apps, environment differences | Distributing reusable apps, complex parameterization |

Many teams use **both**: Helm for third-party software (ingress-nginx, Prometheus), Kustomize for their own services.

## Kustomize

The tutorial app's layout ([`examples/k8s`](examples/k8s/base/kustomization.yaml)):

```
k8s/
├── base/
│   ├── kustomization.yaml
│   ├── configmap.yaml  deployment.yaml  service.yaml  ingress.yaml
│   ├── hpa.yaml  pdb.yaml  networkpolicy.yaml  redis.yaml
└── overlays/
    ├── staging/      kustomization.yaml  namespace.yaml
    └── production/   kustomization.yaml  namespace.yaml
```

**base/kustomization.yaml**
```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - configmap.yaml
  - deployment.yaml
  - service.yaml
  - ingress.yaml
  - hpa.yaml
  - pdb.yaml
  - networkpolicy.yaml
  - redis.yaml
images:
  - name: notes-api                    # placeholder used in deployment.yaml
    newName: ghcr.io/nuvyaro/notes-api
    newTag: latest
```

**overlays/production/kustomization.yaml**
```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: notes-prod                  # applied to every resource
resources:
  - namespace.yaml
  - ../../base
images:
  - name: notes-api
    newName: ghcr.io/nuvyaro/notes-api
    newTag: latest                     # CI sets the commit SHA here
patches:
  - target:
      kind: Deployment
      name: notes-api
    patch: |-
      - op: replace
        path: /spec/replicas
        value: 3
  - target:
      kind: Ingress
      name: notes-api
    patch: |-
      - op: replace
        path: /spec/rules/0/host
        value: notes.example.com
```

```bash
kubectl kustomize devops/examples/k8s/overlays/production     # preview the final YAML
kubectl apply -k devops/examples/k8s/overlays/production       # apply it
cd devops/examples/k8s/overlays/production
kustomize edit set image notes-api=ghcr.io/nuvyaro/notes-api:sha-a1b2c3d   # what CI runs
```

Other useful features: `configMapGenerator` / `secretGenerator` (adds a content hash to the name so pods roll on change), `components` (optional features), strategic-merge patches (partial YAML instead of JSON patches), `labels` / `commonAnnotations`.

## Helm

A **chart** is a package of templates + default values. Installing a chart creates a **release**.

```
helm/notes-api/
├── Chart.yaml          # name, chart version, appVersion
├── values.yaml         # default configuration
└── templates/
    ├── _helpers.tpl    # reusable template snippets
    ├── configmap.yaml  deployment.yaml  service.yaml  hpa.yaml  ingress.yaml
    └── NOTES.txt       # message printed after install
```

**values.yaml** ([full file](examples/helm/notes-api/values.yaml))
```yaml
replicaCount: 2
image:
  repository: ghcr.io/nuvyaro/notes-api
  tag: ""               # defaults to .Chart.AppVersion
config:
  greeting: "Hello from Helm"
ingress:
  enabled: false
  host: notes.example.com
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
```

**templates/deployment.yaml** (excerpt — [full file](examples/helm/notes-api/templates/deployment.yaml))
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "notes-api.fullname" . }}
  labels:
    {{- include "notes-api.labels" . | nindent 4 }}
spec:
  {{- if not .Values.autoscaling.enabled }}
  replicas: {{ .Values.replicaCount }}
  {{- end }}
  template:
    metadata:
      annotations:
        checksum/config: {{ include (print $.Template.BasePath "/configmap.yaml") . | sha256sum }}
    spec:
      containers:
        - name: api
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
```

Template essentials:
- `{{ .Values.x }}` values, `{{ .Release.Name }}`, `{{ .Chart.Version }}`
- `{{- ... }}` trims whitespace; `nindent N` re-indents a block (YAML indentation matters!)
- `if` / `range` / `default` / `quote` / `toYaml` / `include`

### Helm commands

```bash
helm lint devops/examples/helm/notes-api
helm template notes devops/examples/helm/notes-api --set ingress.enabled=true   # render locally
helm upgrade --install notes devops/examples/helm/notes-api \
  --namespace notes-staging --create-namespace \
  -f values-staging.yaml --set image.tag=sha-a1b2c3d \
  --atomic --wait                       # roll back automatically if it fails
helm list -n notes-staging
helm history notes -n notes-staging
helm rollback notes 3 -n notes-staging
helm uninstall notes -n notes-staging

# Third-party charts
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx -n ingress-nginx --create-namespace
```

Charts can be published to OCI registries: `helm push notes-api-0.1.0.tgz oci://ghcr.io/nuvyaro/charts`.

## Quick check

**Q: When would you choose Kustomize over Helm for your own service?**

A: When environments differ by a few values (namespace, replicas, image tag, host) — plain YAML plus small patches is simpler to read and review than templates.

**Q: What does `--atomic` do in `helm upgrade`?**

A: If the upgrade fails (e.g., pods never become ready within the timeout), Helm automatically rolls back to the previous release.

**Next:** [CI/CD with GitHub Actions](11-ci-cd-with-github-actions.md)
