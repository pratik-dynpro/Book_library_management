"""Pure query/mutation functions. Routes call these — never SQLAlchemy directly."""

from __future__ import annotations

from typing import Literal

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from backend import schemas
from backend.models import Book

HARD_LIMIT = 1000  # T-05: cap GET /books to bound response size


def create_book(db: Session, payload: schemas.BookCreate) -> Book:
    row = Book(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def list_books(
    db: Session,
    *,
    search: str | None = None,
    author: str | None = None,
    genre: str | None = None,
    status: Literal["Read", "Unread"] | None = None,
) -> list[Book]:
    stmt = select(Book)

    if search:
        pattern = f"%{search.lower()}%"
        stmt = stmt.where(
            or_(
                func.lower(Book.book_name).like(pattern),
                func.lower(Book.author).like(pattern),
            )
        )
    if author:
        stmt = stmt.where(func.lower(Book.author) == author.lower())
    if genre:
        stmt = stmt.where(func.lower(Book.genre) == genre.lower())
    if status:
        stmt = stmt.where(Book.status == status)

    stmt = stmt.order_by(Book.created_at.desc()).limit(HARD_LIMIT)
    return list(db.scalars(stmt))


def get_book(db: Session, book_id: int) -> Book | None:
    return db.get(Book, book_id)


def update_book(db: Session, book_id: int, payload: schemas.BookUpdate) -> Book | None:
    row = db.get(Book, book_id)
    if row is None:
        return None
    # Loop only over payload keys — created_at is intentionally not in BookUpdate
    # and therefore cannot be touched here.
    for key, value in payload.model_dump().items():
        setattr(row, key, value)
    db.commit()
    db.refresh(row)
    return row


def delete_book(db: Session, book_id: int) -> bool:
    row = db.get(Book, book_id)
    if row is None:
        return False
    db.delete(row)
    db.commit()
    return True
