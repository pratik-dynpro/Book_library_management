"""FastAPI app — CORS, /healthz. Routes for /books land in later packets."""

from __future__ import annotations

import logging
import os
from typing import Literal

from fastapi import Depends, FastAPI, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from backend import crud, schemas
from backend.database import get_db

log = logging.getLogger("book_library")

app = FastAPI(title="Book Library", version="1.0.0")

_cors_origins = [
    o.strip()
    for o in os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(",")
    if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/healthz")
def healthz(db: Session = Depends(get_db)) -> dict[str, str]:
    """Liveness + DB round-trip check."""
    try:
        db.execute(text("SELECT 1"))
        db_state = "ok"
    except SQLAlchemyError as exc:
        log.warning("healthz: DB ping failed: %s", exc)
        db_state = "down"
        raise HTTPException(status_code=503, detail={"status": "degraded", "db": db_state}) from exc

    return {"status": "ok", "db": db_state}


@app.post("/books", status_code=201, response_model=schemas.Book)
def create_book(payload: schemas.BookCreate, db: Session = Depends(get_db)) -> schemas.Book:
    return crud.create_book(db, payload)


@app.get("/books", response_model=list[schemas.Book])
def list_books(
    search: str | None = Query(default=None, max_length=255),
    author: str | None = Query(default=None, max_length=255),
    genre: str | None = Query(default=None, max_length=100),
    status: Literal["Read", "Unread"] | None = Query(default=None),
    db: Session = Depends(get_db),
) -> list:
    return crud.list_books(
        db, search=search, author=author, genre=genre, status=status,
    )


@app.get("/books/{book_id}", response_model=schemas.Book)
def get_book(book_id: int, db: Session = Depends(get_db)) -> schemas.Book:
    row = crud.get_book(db, book_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Book not found")
    return row


@app.put("/books/{book_id}", response_model=schemas.Book)
def update_book(
    book_id: int,
    payload: schemas.BookUpdate,
    db: Session = Depends(get_db),
) -> schemas.Book:
    row = crud.update_book(db, book_id, payload)
    if row is None:
        raise HTTPException(status_code=404, detail="Book not found")
    return row


@app.delete("/books/{book_id}", status_code=204, response_class=Response)
def delete_book(book_id: int, db: Session = Depends(get_db)) -> Response:
    if not crud.delete_book(db, book_id):
        raise HTTPException(status_code=404, detail="Book not found")
    return Response(status_code=204)
