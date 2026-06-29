"""S-004 ACs — GET /books and GET /books/{id}."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.models import Book


def _make_book(
    *,
    book_name: str,
    author: str = "Author",
    genre: str = "Fiction",
    status: str = "Unread",
    created_at: datetime | None = None,
) -> Book:
    kwargs: dict[str, object] = {
        "book_name": book_name,
        "author": author,
        "genre": genre,
        "status": status,
    }
    if created_at is not None:
        kwargs["created_at"] = created_at
    return Book(**kwargs)


def test_list_empty_returns_empty_array(client: TestClient) -> None:
    """AC2 — with 0 rows, response is []."""
    r = client.get("/books")
    assert r.status_code == 200
    assert r.json() == []


def test_list_orders_by_created_at_desc(client: TestClient, db_session: Session) -> None:
    """AC1 — response is ordered by created_at DESC."""
    base = datetime(2026, 1, 1, tzinfo=UTC)
    db_session.add_all([
        _make_book(book_name="Oldest", created_at=base),
        _make_book(book_name="Middle", created_at=base + timedelta(hours=1)),
        _make_book(book_name="Newest", created_at=base + timedelta(hours=2)),
    ])
    db_session.flush()

    r = client.get("/books")
    assert r.status_code == 200
    body = r.json()
    assert [b["book_name"] for b in body] == ["Newest", "Middle", "Oldest"]


def test_list_capped_at_1000(client: TestClient, db_session: Session) -> None:
    """AC3 — HARD_LIMIT=1000 (T-05). 1001 rows → response length 1000."""
    base = datetime(2026, 1, 1, tzinfo=UTC)
    db_session.add_all([
        _make_book(book_name=f"Book {i:04d}", created_at=base + timedelta(seconds=i))
        for i in range(1001)
    ])
    db_session.flush()

    r = client.get("/books")
    assert r.status_code == 200
    assert len(r.json()) == 1000


def test_get_by_id_found(client: TestClient, db_session: Session) -> None:
    """AC4 — GET /books/{id} → 200 + Book."""
    row = _make_book(book_name="Targeted", author="A", genre="G", status="Read")
    db_session.add(row)
    db_session.flush()
    book_id = row.id

    r = client.get(f"/books/{book_id}")
    assert r.status_code == 200
    body = r.json()
    assert body["id"] == book_id
    assert body["book_name"] == "Targeted"


def test_get_by_id_not_found_returns_404(client: TestClient) -> None:
    """AC5 — unknown id → 404 with the documented detail string."""
    r = client.get("/books/999999")
    assert r.status_code == 404
    assert r.json() == {"detail": "Book not found"}


def test_response_schema_strictly_matches_book(client: TestClient, db_session: Session) -> None:
    """AC6 — list elements expose exactly the Book keys, no extras."""
    db_session.add(_make_book(book_name="Schema check", status="Read"))
    db_session.flush()

    r = client.get("/books")
    assert r.status_code == 200
    body = r.json()
    assert len(body) >= 1
    assert set(body[0].keys()) == {"id", "book_name", "author", "genre", "status", "created_at"}
