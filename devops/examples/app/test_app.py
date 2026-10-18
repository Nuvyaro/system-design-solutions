from app import app


def client():
    app.config.update(TESTING=True)
    return app.test_client()


def test_healthz():
    assert client().get("/healthz").get_json() == {"status": "ok"}


def test_readyz_reports_missing_redis():
    assert client().get("/readyz").status_code == 503


def test_notes_roundtrip():
    c = client()
    assert c.post("/notes", json={"text": "learn kubernetes"}).status_code == 201
    assert "learn kubernetes" in c.get("/notes").get_json()["notes"]


def test_notes_validation():
    assert client().post("/notes", json={}).status_code == 400
