"""S-006 ACs — DELETE /books/{id}."""

from __future__ import annotations

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.models import Book


def _seed(db_session: Session) -> Book:
    row = Book(
        book_name="To be deleted",
        author="Author",
        genre="Fiction",
        status="Read",
    )
    db_session.add(row)
    db_session.flush()
    return row


def test_delete_returns_204_empty_body(client: TestClient, db_session: Session) -> None:
    """AC1 — DELETE returns 204 with no body."""
    row = _seed(db_session)
    r = client.delete(f"/books/{row.id}")
    assert r.status_code == 204
    assert r.content == b""


def test_delete_removes_row(client: TestClient, db_session: Session) -> None:
    """AC2 — row is gone from the DB after DELETE."""
    row = _seed(db_session)
    book_id = row.id
    r = client.delete(f"/books/{book_id}")
    assert r.status_code == 204

    db_session.expire_all()
    assert db_session.get(Book, book_id) is None


def test_delete_unknown_returns_404(client: TestClient) -> None:
    """AC3 — DELETE on unknown id → 404 with the documented body."""
    r = client.delete("/books/999999")
    assert r.status_code == 404
    assert r.json() == {"detail": "Book not found"}
