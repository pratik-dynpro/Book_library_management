# S-005 · Packet DESIGN

## Files In
D6, D7 §3.4, D15b US-03, D17 TC-009/TC-010, D12 §T-04.

## Files Out
- `backend/schemas.py` (add `BookUpdate`)
- `backend/crud.py` (add `update_book`)
- `backend/main.py` (add route)
- `backend/tests/test_update_book.py`

## Schema

```python
class BookUpdate(BookBase): pass   # identical fields + extra='forbid'
```

## CRUD

```python
def update_book(db: Session, book_id: int, payload: BookUpdate) -> BookModel | None:
    row = db.get(BookModel, book_id)
    if row is None: return None
    for k, v in payload.model_dump().items():
        setattr(row, k, v)
    # created_at intentionally not touched
    db.commit(); db.refresh(row)
    return row
```

## Route

```python
@app.put("/books/{book_id}", response_model=schemas.Book)
def update_book(book_id: int, payload: schemas.BookUpdate, db: Session = Depends(get_db)):
    row = crud.update_book(db, book_id, payload)
    if row is None:
        raise HTTPException(404, "Book not found")
    return row
```

## AC-to-code Map
- AC1 / AC2 / AC5 → `update_book` writes all fields, returns refreshed row. `created_at` is preserved because the loop only iterates payload keys.
- AC3 → 404 branch.
- AC4 → `BookUpdate.model_config = ConfigDict(extra='forbid')` (inherited from `BookBase`).

## Rollback
`git revert`; no schema change.
