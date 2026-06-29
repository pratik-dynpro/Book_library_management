"""S-005 ACs — PUT /books/{id}."""

from __future__ import annotations

from datetime import UTC, datetime

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.models import Book


def _seed(db_session: Session, **overrides: object) -> Book:
    defaults: dict[str, object] = {
        "book_name": "Atomic Habits",
        "author": "James Clear",
        "genre": "Self Help",
        "status": "Read",
        "created_at": datetime(2026, 1, 1, 12, 0, 0, tzinfo=UTC),
    }
    defaults.update(overrides)
    row = Book(**defaults)
    db_session.add(row)
    db_session.flush()
    return row


def _full_body(**overrides: object) -> dict[str, object]:
    body: dict[str, object] = {
        "book_name": "Atomic Habits",
        "author": "James Clear",
        "genre": "Self Help",
        "status": "Read",
    }
    body.update(overrides)
    return body


def test_put_updates_fields(client: TestClient, db_session: Session) -> None:
    """AC1 — PUT with full body returns 200 + the updated Book."""
    row = _seed(db_session)
    book_id = row.id

    r = client.put(
        f"/books/{book_id}",
        json=_full_body(book_name="Atomic Habits (2024 ed)", status="Unread"),
    )
    assert r.status_code == 200
    body = r.json()
    assert body["id"] == book_id
    assert body["book_name"] == "Atomic Habits (2024 ed)"
    assert body["status"] == "Unread"
    assert body["author"] == "James Clear"


def test_put_preserves_created_at(client: TestClient, db_session: Session) -> None:
    """AC2 — created_at is not mutated by PUT."""
    original = datetime(2026, 1, 1, 12, 0, 0, tzinfo=UTC)
    row = _seed(db_session, created_at=original)
    book_id = row.id

    r = client.put(
        f"/books/{book_id}",
        json=_full_body(book_name="New title"),
    )
    assert r.status_code == 200

    db_session.expire_all()
    refreshed = db_session.get(Book, book_id)
    assert refreshed is not None
    # SQLAlchemy returns the value as datetime; compare to original
    assert refreshed.created_at == original


def test_put_unknown_id_returns_404(client: TestClient) -> None:
    """AC3 — unknown id → 404 {detail: 'Book not found'}."""
    r = client.put("/books/999999", json=_full_body())
    assert r.status_code == 404
    assert r.json() == {"detail": "Book not found"}


def test_put_extra_field_returns_422(client: TestClient, db_session: Session) -> None:
    """AC4 — extra field → 422 (T-04, extra='forbid' on BookUpdate)."""
    row = _seed(db_session)
    body = _full_body()
    body["rating"] = 5
    r = client.put(f"/books/{row.id}", json=body)
    assert r.status_code == 422


def test_put_canonicalizes_lowercase_status(client: TestClient, db_session: Session) -> None:
    """AC5 — same canonicalization as POST: 'unread' is accepted, stored as 'Unread'."""
    row = _seed(db_session, status="Read")
    book_id = row.id

    r = client.put(f"/books/{book_id}", json=_full_body(status="unread"))
    assert r.status_code == 200
    assert r.json()["status"] == "Unread"

    db_session.expire_all()
    refreshed = db_session.get(Book, book_id)
    assert refreshed is not None
    assert refreshed.status == "Unread"


def test_put_bad_status_returns_422(client: TestClient, db_session: Session) -> None:
    """AC5 — status='Maybe' rejected at the schema layer."""
    row = _seed(db_session)
    r = client.put(f"/books/{row.id}", json=_full_body(status="Maybe"))
    assert r.status_code == 422


def test_put_missing_field_returns_422(client: TestClient, db_session: Session) -> None:
    """AC5 — PUT requires the full body."""
    row = _seed(db_session)
    body = _full_body()
    del body["genre"]
    r = client.put(f"/books/{row.id}", json=body)
    assert r.status_code == 422
