# Docker 2: Writing Great Dockerfiles

> **In one sentence:** a Dockerfile is a step-by-step recipe; each step creates a cached layer, so ordering the steps well makes builds fast and images small and secure.

**Level:** Beginner → Intermediate · **You'll learn:** every common instruction, layer caching, multi-stage builds, security best practices.

## See it in action: layer caching

<div class="sim" data-sim="docker-layers"><em>Interactive animation available on the website.</em></div>

Change your app code and only the last layers rebuild. Change the dependency list and the slow `pip install` reruns. Switch to the **bad order** to see why `COPY . .` before installing dependencies makes every build slow.

## A first Dockerfile

```dockerfile
FROM python:3.12-slim          # 1. start from a base image
WORKDIR /app                   # 2. set the working directory (creates it)
COPY requirements.txt .        # 3. copy the dependency list first
RUN pip install --no-cache-dir -r requirements.txt   # 4. install deps (cached layer)
COPY . .                       # 5. copy the rest of the source code
EXPOSE 8080                    # 6. document the port
CMD ["python", "app.py"]       # 7. default command when the container starts
```

Build and run:
```bash
docker build -t myapp:1.0 .    # "." is the build context sent to Docker
docker run -p 8080:8080 myapp:1.0
```

## Instruction reference

| Instruction | What it does | Tip |
|-------------|--------------|-----|
| `FROM image:tag` | Base image | Pin versions; prefer `-slim` / `-alpine` / distroless |
| `WORKDIR /path` | Set working directory | Use instead of `RUN cd` |
| `COPY src dest` | Copy files from build context | Prefer over `ADD` (which also extracts archives/downloads URLs) |
| `RUN cmd` | Execute at build time, creates a layer | Chain related commands with `&&` and clean up in the same layer |
| `ENV KEY=value` | Environment variable (build + runtime) | Never put secrets here — they're baked into the image |
| `ARG NAME=default` | Build-time variable (`--build-arg`) | Not available at runtime unless copied into `ENV` |
| `EXPOSE 8080` | Documents the port | Doesn't publish it — `-p` does |
| `USER 10001` | Run subsequent steps/container as this user | Always run as non-root |
| `CMD [...]` | Default command (overridable) | Use exec form (JSON array) so signals reach your app |
| `ENTRYPOINT [...]` | Fixed executable; `CMD` becomes its default args | Use for "this image *is* a tool" |
| `HEALTHCHECK` | Command Docker runs to check health | Kubernetes uses probes instead |
| `LABEL k=v` | Metadata | e.g., `org.opencontainers.image.source` |

### CMD vs ENTRYPOINT

```dockerfile
ENTRYPOINT ["python", "manage.py"]
CMD ["runserver"]
# docker run img            → python manage.py runserver
# docker run img migrate    → python manage.py migrate
```

## How layer caching works

Each instruction produces a layer identified by its inputs. When you rebuild, Docker reuses a cached layer **until the first instruction whose inputs changed** — then everything after it reruns.

**Rule:** order instructions from *least* to *most* frequently changing:
1. Base image and system packages
2. Dependency manifests (`requirements.txt`, `package.json` + lockfile) → install
3. Application source code

## Multi-stage builds: small, secure images

Build tools (compilers, dev headers) are needed to *build* but not to *run*. Multi-stage builds compile in one stage and copy only the results into a clean final stage.

This is the real Dockerfile used by the tutorial app ([`examples/app/Dockerfile`](examples/app/Dockerfile)):

```dockerfile
# syntax=docker/dockerfile:1

# ---- Stage 1: build dependencies into a virtualenv ----
FROM python:3.12-slim AS builder
WORKDIR /app
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ---- Stage 2: small runtime image ----
FROM python:3.12-slim AS runtime
RUN useradd --create-home --uid 10001 appuser
WORKDIR /app
COPY --from=builder /opt/venv /opt/venv
COPY app.py .
ENV PATH="/opt/venv/bin:$PATH" PYTHONUNBUFFERED=1 PORT=8080
ARG APP_VERSION=dev
ENV APP_VERSION=${APP_VERSION}
USER 10001
EXPOSE 8080
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "--workers", "2", "app:app"]
```

For compiled languages the savings are dramatic — a Go service:

```dockerfile
FROM golang:1.23 AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /out/server ./cmd/server

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /out/server /server
ENTRYPOINT ["/server"]          # final image ≈ 10–20 MB, no shell, no package manager
```

## .dockerignore

The build context is everything in the directory you pass to `docker build`. Exclude what the image doesn't need — faster builds and no accidental secrets:

```
.git/
node_modules/
__pycache__/
.env
*.log
tests/
```

## Security best practices

1. **Pin base images** (`python:3.12-slim`, or by digest `@sha256:...`) and rebuild regularly for patches.
2. **Run as non-root** (`USER 10001`).
3. **Minimal images** — slim/distroless: fewer packages = fewer vulnerabilities.
4. **No secrets in images** — not in `ENV`, `ARG`, or copied files. Use runtime env vars/secret managers, or BuildKit secret mounts for build-time secrets:
   ```dockerfile
   RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm ci
   ```
   `docker build --secret id=npmrc,src=$HOME/.npmrc .`
5. **Scan images** in CI (Trivy, Grype, Docker Scout).
6. **One process per container** — let the orchestrator manage restarts and scaling.

## Useful build commands

```bash
docker build -t app:1.0 --build-arg APP_VERSION=1.0 .
docker build --target builder -t app:builder .      # stop at a stage
docker buildx build --platform linux/amd64,linux/arm64 -t ghcr.io/me/app:1.0 --push .   # multi-arch
docker history app:1.0                              # see layers and sizes
docker image inspect app:1.0
```

## Quick check

**Q: Why copy `requirements.txt` and install dependencies before `COPY . .`?**

A: So the slow dependency-install layer stays cached when only source code changes. If you copy everything first, any code edit invalidates the cache and reinstalls all dependencies.

**Q: What's the main benefit of a multi-stage build?**

A: The final image contains only what's needed to run — no compilers or build tools — so it's smaller, faster to pull, and has a smaller attack surface.

**Next:** [Networking, volumes & Docker Compose](03-docker-networking-volumes-compose.md)
