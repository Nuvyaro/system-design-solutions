"""notes-api: a tiny web service used throughout the Docker / Kubernetes / CI-CD tutorials.

Endpoints:
  GET  /           -> greeting + visit counter (stored in Redis when available)
  GET  /healthz    -> liveness probe: is the process alive?
  GET  /readyz     -> readiness probe: can we serve traffic (Redis reachable)?
  POST /notes      -> store a note   {"text": "..."}
  GET  /notes      -> list notes
"""
import os
import socket

import redis
from flask import Flask, jsonify, request

APP_VERSION = os.getenv("APP_VERSION", "dev")
GREETING = os.getenv("GREETING", "Hello from notes-api")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

app = Flask(__name__)
_store = redis.Redis.from_url(REDIS_URL, socket_connect_timeout=1, socket_timeout=1)
_fallback_notes = []  # used only when Redis is unavailable (e.g. unit tests)


def _redis_ok():
    try:
        return bool(_store.ping())
    except redis.RedisError:
        return False


@app.get("/")
def index():
    visits = None
    if _redis_ok():
        visits = _store.incr("visits")
    return jsonify(message=GREETING, version=APP_VERSION, pod=socket.gethostname(), visits=visits)


@app.get("/healthz")
def healthz():
    return jsonify(status="ok")


@app.get("/readyz")
def readyz():
    if _redis_ok():
        return jsonify(status="ready")
    return jsonify(status="redis unavailable"), 503


@app.post("/notes")
def add_note():
    data = request.get_json(silent=True) or {}
    text = str(data.get("text", "")).strip()
    if not text:
        return jsonify(error="text is required"), 400
    if _redis_ok():
        _store.rpush("notes", text)
    else:
        _fallback_notes.append(text)
    return jsonify(text=text), 201


@app.get("/notes")
def list_notes():
    if _redis_ok():
        notes = [n.decode() for n in _store.lrange("notes", 0, -1)]
    else:
        notes = list(_fallback_notes)
    return jsonify(notes=notes)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "8080")))
