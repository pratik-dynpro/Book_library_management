"""S-002 ACs — /healthz, OpenAPI, CORS allow/deny."""

from __future__ import annotations

import json

from fastapi.testclient import TestClient


def test_healthz_ok(client: TestClient) -> None:
    """AC4 — GET /healthz returns 200 with {status:ok, db:ok}."""
    r = client.get("/healthz")
    assert r.status_code == 200
    assert r.json() == {"status": "ok", "db": "ok"}


def test_openapi_served(client: TestClient) -> None:
    """AC3 — /openapi.json is reachable and parseable."""
    r = client.get("/openapi.json")
    assert r.status_code == 200
    payload = json.loads(r.content)
    assert payload["openapi"].startswith("3.")


def test_cors_allows_localhost_5173(client: TestClient) -> None:
    """AC5 — preflight from the dev origin gets ACAO echoed."""
    r = client.options(
        "/healthz",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert r.status_code in (200, 204)
    assert r.headers.get("access-control-allow-origin") == "http://localhost:5173"


def test_cors_denies_evil_origin(client: TestClient) -> None:
    """AC5 — preflight from a foreign origin is not echoed."""
    r = client.options(
        "/healthz",
        headers={
            "Origin": "http://evil.example",
            "Access-Control-Request-Method": "GET",
        },
    )
    # The middleware will either omit the ACAO header or set it to a value
    # other than the requested origin. Either is a denial.
    assert r.headers.get("access-control-allow-origin") != "http://evil.example"
