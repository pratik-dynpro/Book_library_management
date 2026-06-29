# S-007 · Packet DESIGN

## Files In
D7 §3.2, D6 (functional indexes), D17 TC-020…028, TC-083, D12 §T-01, D15b US-05/06/07/08.

## Files Out
- `backend/crud.py` (modify `list_books`)
- `backend/main.py` (add query params)
- `backend/tests/test_search_filter.py`
- `backend/tests/test_perf.py` (one pytest-benchmark)

## list_books signature

```python
from sqlalchemy import select, func, or_

def list_books(
    db: Session,
    *,
    search: str | None = None,
    author: str | None = None,
    genre:  str | None = None,
    status: Literal["Read","Unread"] | None = None,
) -> list[BookModel]:
    stmt = select(BookModel)
    if search:
        q = f"%{search.lower()}%"
        stmt = stmt.where(or_(
            func.lower(BookModel.book_name).like(q),
            func.lower(BookModel.author).like(q),
        ))
    if author:
        stmt = stmt.where(func.lower(BookModel.author) == author.lower())
    if genre:
        stmt = stmt.where(func.lower(BookModel.genre) == genre.lower())
    if status:
        stmt = stmt.where(BookModel.status == status)
    stmt = stmt.order_by(BookModel.created_at.desc()).limit(HARD_LIMIT)
    return list(db.scalars(stmt))
```

## Route

```python
from typing import Literal, Optional

@app.get("/books", response_model=list[schemas.Book])
def list_books(
    search: Optional[str] = None,
    author: Optional[str] = None,
    genre:  Optional[str] = None,
    status: Optional[Literal["Read","Unread"]] = None,
    db: Session = Depends(get_db),
):
    return crud.list_books(db, search=search, author=author, genre=genre, status=status)
```

`Literal` typing makes FastAPI return 422 on `?status=foo` automatically — covers AC7.

## AC-to-code Map

| AC | Where |
|----|-------|
| AC1 | `or_(LOWER(book_name) LIKE, LOWER(author) LIKE)` — uses functional indexes from S-001 |
| AC2 | `if search:` guard — empty string is falsy |
| AC3 | Parameter binding via SQLAlchemy `like()`; the literal `%`/`'` chars are escaped by the driver; test inserts a "DROP TABLE" string and asserts the table still exists |
| AC4 / AC5 | `func.lower(col) == X.lower()` — uses functional indexes |
| AC6 | `status == status` (canonical) |
| AC7 | FastAPI Literal → 422 |
| AC8 | All `where` clauses compose with AND inherently |
| AC9 | `tests/test_perf.py` uses pytest-benchmark; threshold 50 ms median |

## Rollback
`git revert`; no migration; functional indexes from S-001 remain useful.
