# S-006 · Packet DESIGN

## Files Out
- `backend/crud.py` (add `delete_book`)
- `backend/main.py` (add route)
- `backend/tests/test_delete_book.py`

## CRUD
```python
def delete_book(db: Session, book_id: int) -> bool:
    row = db.get(BookModel, book_id)
    if row is None: return False
    db.delete(row); db.commit()
    return True
```

## Route
```python
@app.delete("/books/{book_id}", status_code=204)
def delete_book(book_id: int, db: Session = Depends(get_db)):
    if not crud.delete_book(db, book_id):
        raise HTTPException(404, "Book not found")
    return Response(status_code=204)
```

## AC-to-code Map
- AC1 → 204, empty body via FastAPI `Response`.
- AC2 → ORM delete + commit.
- AC3 → bool return → 404.

## Rollback
`git revert`.
