import os

# Point the app at an unreachable Redis so unit tests exercise the in-memory fallback.
os.environ.setdefault("REDIS_URL", "redis://127.0.0.1:1/0")
