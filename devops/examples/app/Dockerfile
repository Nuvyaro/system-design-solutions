# syntax=docker/dockerfile:1

# ---- Stage 1: build dependencies into a virtualenv ----
FROM python:3.12-slim AS builder
WORKDIR /app
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
# Copy only the dependency list first so this layer stays cached until requirements change
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ---- Stage 2: small runtime image ----
FROM python:3.12-slim AS runtime
# Run as an unprivileged user
RUN useradd --create-home --uid 10001 appuser
WORKDIR /app
COPY --from=builder /opt/venv /opt/venv
COPY app.py .
ENV PATH="/opt/venv/bin:$PATH" \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8080
ARG APP_VERSION=dev
ENV APP_VERSION=${APP_VERSION}
USER 10001
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8080/healthz')" || exit 1
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "--workers", "2", "app:app"]
