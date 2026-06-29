"""S-003 ACs — POST /books."""

from __future__ import annotations

from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.models import Book


def _valid_payload(**overrides: object) -> dict[str, object]:
    payload: dict[str, object] = {
        "book_name": "Atomic Habits",
        "author": "James Clear",
        "genre": "Self Help",
        "status": "Read",
    }
    payload.update(overrides)
    return payload


def test_create_201_returns_book(client: TestClient) -> None:
    """AC1 — POST /books with valid body → 201 + a Book including id and created_at."""
    r = client.post("/books", json=_valid_payload())
    assert r.status_code == 201
    body = r.json()
    assert body["book_name"] == "Atomic Habits"
    assert body["author"] == "James Clear"
    assert body["genre"] == "Self Help"
    assert body["status"] == "Read"
    assert isinstance(body["id"], int) and body["id"] > 0
    assert "created_at" in body and body["created_at"].endswith("Z") or "T" in body["created_at"]


def test_create_persists_row(client: TestClient, db_session: Session) -> None:
    """AC2 — the created row is visible via direct DB query."""
    r = client.post("/books", json=_valid_payload(book_name="Deep Work"))
    assert r.status_code == 201
    new_id = r.json()["id"]
    row = db_session.execute(select(Book).where(Book.id == new_id)).scalar_one()
    assert row.book_name == "Deep Work"
    assert row.status == "Read"
    assert row.created_at is not None


def test_create_missing_field_422(client: TestClient) -> None:
    """AC3 — missing any required field → 422."""
    payload = _valid_payload()
    del payload["author"]
    r = client.post("/books", json=payload)
    assert r.status_code == 422


def test_create_bad_status_422(client: TestClient) -> None:
    """AC4a — status='Reading' → 422."""
    r = client.post("/books", json=_valid_payload(status="Reading"))
    assert r.status_code == 422


def test_create_lowercase_status_normalized(client: TestClient, db_session: Session) -> None:
    """AC4b — status='read' (lowercase) → 201 and persisted as canonical 'Read'."""
    r = client.post("/books", json=_valid_payload(status="read"))
    assert r.status_code == 201
    assert r.json()["status"] == "Read"
    row = db_session.execute(
        select(Book).where(Book.id == r.json()["id"])
    ).scalar_one()
    assert row.status == "Read"


def test_create_max_length_violation_422(client: TestClient) -> None:
    """AC5 — 300-char book_name exceeds the 255-char cap → 422 (T-06)."""
    r = client.post("/books", json=_valid_payload(book_name="x" * 300))
    assert r.status_code == 422


def test_create_extra_field_forbidden_422(client: TestClient) -> None:
    """T-04 — unknown field → 422 (model_config extra='forbid')."""
    payload = _valid_payload()
    payload["rating"] = 5
    r = client.post("/books", json=payload)
    assert r.status_code == 422
