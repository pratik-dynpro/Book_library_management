# S-003 · Packet DESIGN

## Files In
- D6, D7 §3.1, D12 §T-06 / §T-04, D15b US-01, D17 TC-001…TC-004, TC-082.
- `backend/main.py`, `backend/models.py`, `backend/database.py` (S-001/S-002).

## Files Out
- `backend/schemas.py` (new)
- `backend/crud.py` (new)
- `backend/main.py` (add route)
- `backend/tests/test_create_book.py` (new)

## Schemas (Pydantic v2)

```python
class BookBase(BaseModel):
    book_name: str = Field(min_length=1, max_length=255)
    author:    str = Field(min_length=1, max_length=255)
    genre:     str = Field(min_length=1, max_length=100)
    status:    Literal["Read", "Unread"]

    @field_validator("status", mode="before")
    def _canon_status(cls, v: str) -> str:
        if isinstance(v, str):
            v = v.strip().capitalize()
        return v

    @field_validator("book_name", "author", "genre", mode="before")
    def _strip(cls, v): return v.strip() if isinstance(v, str) else v

    model_config = ConfigDict(extra="forbid")

class BookCreate(BookBase): pass

class Book(BookBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
```

## CRUD

```python
def create_book(db: Session, payload: BookCreate) -> Book:
    row = BookModel(**payload.model_dump())
    db.add(row); db.commit(); db.refresh(row)
    return row
```

## Route

```python
@app.post("/books", status_code=201, response_model=schemas.Book)
def create_book(payload: schemas.BookCreate, db: Session = Depends(get_db)):
    return crud.create_book(db, payload)
```

## AC-to-code Map

| AC | Code |
|----|------|
| AC1 | route + `crud.create_book` |
| AC2 | `db.refresh(row)` returns the persisted row (id, created_at populated) |
| AC3 | `Field(min_length=1)` on each string + `Literal` on status |
| AC4 | `_canon_status` validator + Literal |
| AC5 | `max_length=...` per D6 §5 |
| AC6 | direct DB query in test (S-004 will add GET) |

## Rollback
`git revert`; no migration.

## Alternatives
- Separate request/response models with a base mixin — chosen (above).
- Auto-strip in DB triggers — rejected; validation belongs in Pydantic.
