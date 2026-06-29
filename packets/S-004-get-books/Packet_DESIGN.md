# S-004 · Packet DESIGN

## Files In
D6, D7 §3.2/§3.3, D15b US-02/US-03 AC3, D17 TC-005…008, D12 §T-05.
`backend/{main,models,crud,schemas}.py`.

## Files Out
- `backend/crud.py` (extend)
- `backend/main.py` (add routes)
- `backend/tests/test_read_books.py` (new)

## Functions

```python
# crud.py
HARD_LIMIT = 1000

def list_books(db: Session) -> list[BookModel]:
    return list(db.scalars(
        select(BookModel).order_by(BookModel.created_at.desc()).limit(HARD_LIMIT)
    ))

def get_book(db: Session, book_id: int) -> BookModel | None:
    return db.get(BookModel, book_id)
```

## Routes

```python
@app.get("/books", response_model=list[schemas.Book])
def list_books(db: Session = Depends(get_db)):
    return crud.list_books(db)

@app.get("/books/{book_id}", response_model=schemas.Book)
def get_book(book_id: int, db: Session = Depends(get_db)):
    row = crud.get_book(db, book_id)
    if row is None:
        raise HTTPException(404, "Book not found")
    return row
```

## AC-to-code Map

| AC | Where |
|----|-------|
| AC1 | `list_books` + `.order_by(created_at.desc())` |
| AC2 | empty DB → SQLAlchemy returns empty list → JSON `[]` |
| AC3 | `HARD_LIMIT = 1000`; test inserts 1001 rows via direct ORM and asserts response length |
| AC4 | `get_book` + 200 |
| AC5 | `HTTPException(404)` |
| AC6 | `response_model=list[schemas.Book]` strips extras |

## Rollback
`git revert`; no schema change.
