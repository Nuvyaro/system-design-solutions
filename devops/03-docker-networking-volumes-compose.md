# Docker 3: Networking, Volumes & Docker Compose

> **In one sentence:** containers talk to each other over Docker networks, keep data in volumes, and Docker Compose describes a whole multi-container app in one YAML file.

**Level:** Intermediate · **You'll learn:** port mapping, user-defined networks and DNS, volumes vs bind mounts, writing `docker-compose.yml`.

## See it in action

<div class="sim" data-sim="pipeline" data-title="docker compose up" data-steps="Read compose file|Create network|Create volumes|Build images|Start redis|Healthcheck passes|Start api|Ready" data-labels="docker-compose.yml describes services|Services find each other by name|redis-data persists across restarts|api built from ./Dockerfile|Dependency starts first|depends_on: service_healthy|REDIS_URL=redis://redis:6379|http://localhost:8080"><em>Interactive animation available on the website.</em></div>

## Networking

### Port publishing
`-p HOST:CONTAINER` exposes a container port on the host: `-p 8080:80` → `http://localhost:8080` reaches port 80 in the container. Without `-p`, the port is only reachable from other containers.

### User-defined networks and DNS
Containers on the same **user-defined network** can reach each other **by container name**:

```bash
docker network create appnet
docker run -d --name redis --network appnet redis:7.2-alpine
docker run -d --name api --network appnet -p 8080:8080 \
  -e REDIS_URL=redis://redis:6379/0 notes-api:dev
# inside "api", the hostname "redis" resolves to the redis container
```

| Network driver | Use |
|----------------|-----|
| `bridge` (default/user-defined) | Containers on one host |
| `host` | Container shares the host's network stack (Linux) |
| `none` | No networking |
| `overlay` | Multi-host (Swarm) |

> Never use `localhost` to reach another container — inside a container, `localhost` is the container itself.

## Storage: volumes vs bind mounts

| | Named volume | Bind mount | tmpfs |
|---|---|---|---|
| Syntax | `-v pgdata:/var/lib/postgresql/data` | `-v $(pwd)/src:/app/src` | `--tmpfs /tmp` |
| Managed by | Docker | You (a host path) | Memory only |
| Use for | Databases, persistent data | Live code reload in development | Scratch data |

```bash
docker volume create pgdata
docker run -d --name db -e POSTGRES_PASSWORD=dev -v pgdata:/var/lib/postgresql/data postgres:16
docker rm -f db          # container gone…
docker run -d --name db -e POSTGRES_PASSWORD=dev -v pgdata:/var/lib/postgresql/data postgres:16
# …data is still there
```

## Docker Compose

Typing long `docker run` commands for every service doesn't scale. Compose describes the whole stack declaratively. Here's the real file for the tutorial app ([`examples/app/docker-compose.yml`](examples/app/docker-compose.yml)):

```yaml
services:
  api:
    build:
      context: .
      args:
        APP_VERSION: local
    ports:
      - "8080:8080"            # host:container
    environment:
      REDIS_URL: redis://redis:6379/0   # "redis" = the service name below
      GREETING: Hello from Docker Compose
    depends_on:
      redis:
        condition: service_healthy      # wait for the healthcheck, not just "started"
    restart: unless-stopped

  redis:
    image: redis:7.2-alpine
    command: ["redis-server", "--appendonly", "yes"]
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

volumes:
  redis-data:
```

Compose automatically creates a network for the project, so services reach each other by **service name**.

### Compose commands

```bash
docker compose up --build        # build + start (foreground)
docker compose up -d             # background
docker compose ps                # status
docker compose logs -f api       # follow one service's logs
docker compose exec api sh       # shell into a service
docker compose down              # stop and remove containers + network
docker compose down -v           # …and delete volumes (data!)
docker compose config            # validate and print the resolved file
```

### Useful patterns

```yaml
services:
  api:
    env_file: .env               # load variables from a file (keep .env out of git)
    environment:
      LOG_LEVEL: ${LOG_LEVEL:-info}   # from your shell, with a default
    volumes:
      - ./src:/app/src           # bind mount for hot reload in development
    deploy:
      resources:
        limits:
          memory: 512M
    profiles: ["debug"]          # only started with --profile debug
```

**Override files:** `docker-compose.yml` (shared) + `docker-compose.override.yml` (local dev, loaded automatically) or `-f docker-compose.prod.yml` for other environments.

## Compose vs Kubernetes

Compose is perfect for **local development and single-host setups**. When you need multiple machines, self-healing, rolling updates, autoscaling, and service discovery across a cluster, you move to **Kubernetes** — the rest of this track.

## Quick check

**Q: Your API container uses `REDIS_URL=redis://localhost:6379` and can't connect to the Redis container. Why?**

A: Inside the API container, `localhost` is the API container itself. Use the Redis container's name (or Compose service name) on a shared network: `redis://redis:6379`.

**Q: Why does `depends_on` alone not guarantee the database is ready?**

A: It only waits for the container to *start*. Use `condition: service_healthy` with a healthcheck — and make apps retry connections anyway.

**Next:** [YAML for DevOps](04-yaml-for-devops.md)
