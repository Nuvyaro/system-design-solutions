# YAML for DevOps: Writing Config Files Without Fear

> **In one sentence:** YAML is a human-friendly way to write structured data (maps, lists, values) using indentation — and it's the language of Docker Compose, Kubernetes, Helm, and CI/CD pipelines.

**Level:** Beginner → Intermediate · **You'll learn:** the full syntax you'll actually use, multi-line strings, anchors, multiple documents, and the classic gotchas.

## Try it: YAML playground

<div class="sim" data-sim="yaml-playground"><em>Interactive YAML playground available on the website.</em></div>

Edit the YAML on the left; the right side shows how a program sees it (as JSON). Break the indentation on purpose and read the error.

## The three building blocks

Everything in YAML is one of these:

```yaml
# 1. Scalars (single values)
name: notes-api          # string (quotes optional)
replicas: 3              # integer
enabled: true            # boolean
ratio: 0.75              # float
nothing: null            # null (also ~)

# 2. Maps (key: value pairs) — nest with indentation
metadata:
  name: notes-api
  labels:
    app: notes-api
    tier: backend

# 3. Lists (sequences) — each item starts with "- "
ports:
  - 80
  - 443
containers:
  - name: api            # a list of maps
    image: notes-api:1.0
  - name: sidecar
    image: envoy:1.31
```

Equivalent JSON for the last part — YAML is a superset of JSON:
```json
{"containers": [{"name": "api", "image": "notes-api:1.0"}, {"name": "sidecar", "image": "envoy:1.31"}]}
```

## Indentation rules

- Use **spaces, never tabs**. Two spaces per level is the convention.
- Items at the same level must line up exactly.
- List items can be indented under their key or flush with it — both are valid; be consistent:

```yaml
args:            # style A
  - --port=8080
args:            # style B (also valid)
- --port=8080
```

## Strings and quoting

Most strings need no quotes. Quote when the value:
- looks like another type: `version: "1.10"` (otherwise the float `1.1`!), `zip: "01234"`, `answer: "yes"`
- contains `: ` or starts with special characters (`{`, `[`, `*`, `&`, `!`, `%`, `@`, `` ` ``)
- is a port mapping in Compose: `"8080:80"` (unquoted `22:22` can be parsed as base-60 in YAML 1.1 parsers)

```yaml
single: 'no escapes here, it''s literal'
double: "supports escapes like \n and \t"
```

## Multi-line strings

```yaml
# Literal block "|" keeps newlines — perfect for scripts and config files
script: |
  echo "building"
  make test
  make build

# Folded block ">" joins lines with spaces — good for long descriptions
description: >
  This is one long sentence
  written across several lines.

# Chomping: "|-" removes the final newline, "|+" keeps all trailing newlines
key: |-
  no trailing newline
```

## Multiple documents in one file

`---` separates documents. Kubernetes manifests often bundle several objects:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: redis
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: redis
```

## Anchors and aliases (DRY)

```yaml
x-defaults: &defaults        # "&" defines an anchor
  restart: unless-stopped
  logging:
    driver: json-file

services:
  api:
    <<: *defaults            # "<<: *name" merges the anchored map
    image: notes-api
  worker:
    <<: *defaults
    image: notes-worker
```

Docker Compose supports this pattern (keys starting with `x-` are extension fields Compose ignores). For Kubernetes, **Helm or Kustomize** are the usual reuse tools instead of anchors.

## Comments

`#` starts a comment anywhere outside a string. Comment *why*, not *what*.

## The 6 classic gotchas

| Gotcha | Example | Fix |
|--------|---------|-----|
| Tabs | A tab before `image:` | Configure your editor to insert spaces |
| The "Norway problem" | `country: NO` → `false` in YAML 1.1 parsers | Quote: `"NO"` |
| Version numbers | `python: 3.10` → `3.1` | Quote: `"3.10"` |
| Wrong nesting | `labels` at the wrong indentation level silently becomes a sibling | Validate with a schema/linter |
| Duplicate keys | Second `env:` silently overrides the first | Linters (yamllint) catch it |
| `on:` in GitHub Actions | Old parsers read `on` as `true` | GitHub handles it; just know why it looks odd |

## Reading a Kubernetes manifest

Every Kubernetes object has the same four top-level fields:

```yaml
apiVersion: apps/v1        # which API group/version defines this kind
kind: Deployment           # what type of object
metadata:                  # identity: name, namespace, labels, annotations
  name: notes-api
  labels:
    app: notes-api
spec:                      # desired state — what you want Kubernetes to make true
  replicas: 2
  selector:
    matchLabels:
      app: notes-api
  template:                # pod template (a nested object with its own metadata/spec)
    metadata:
      labels:
        app: notes-api
    spec:
      containers:
        - name: api
          image: ghcr.io/nuvyaro/notes-api:1.0.0
          ports:
            - containerPort: 8080
```

Look up any field with `kubectl explain deployment.spec.template.spec.containers`.

## Tooling

- **Editor:** VS Code + the Red Hat YAML extension (schema validation and autocomplete for Kubernetes, Compose, GitHub Actions).
- **Linters:** `yamllint`, `actionlint` (GitHub Actions), `kubeconform` (Kubernetes schemas), `docker compose config`.
- **Query/edit:** `yq` — e.g. `yq '.spec.replicas = 5' -i deployment.yaml`.

## Quick check

**Q: What does `version: 1.20` parse as?**

A: The float `1.2` — the trailing zero is lost. Quote it: `version: "1.20"`.

**Q: What's the difference between `|` and `>`?**

A: `|` keeps line breaks (use for scripts); `>` folds lines into one line separated by spaces (use for long prose).

**Next:** [Kubernetes architecture](05-kubernetes-architecture.md)
