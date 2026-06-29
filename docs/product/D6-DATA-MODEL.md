# D6 · Data Model

## 1. ERD (text)

```
┌──────────────────────────────┐
│ books                        │
├──────────────────────────────┤
│ id          INTEGER PK       │
│ book_name   VARCHAR(255) NN  │
│ author      VARCHAR(255) NN  │
│ genre       VARCHAR(100) NN  │
│ status      VARCHAR(20)  NN  │  -- CHECK ('Read','Unread')
│ created_at  TIMESTAMP    NN  │  -- default NOW (UTC)
└──────────────────────────────┘
```

Single-entity model in v1. Multi-entity (users, tags, shelves) is deferred to Level-3 enhancements.

## 2. DDL (PostgreSQL 16)

```sql
CREATE TABLE books (
    id         BIGSERIAL    PRIMARY KEY,
    book_name  VARCHAR(255) NOT NULL,
    author     VARCHAR(255) NOT NULL,
    genre      VARCHAR(100) NOT NULL,
    status     VARCHAR(20)  NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_books_status CHECK (status IN ('Read', 'Unread'))
);

CREATE INDEX idx_books_author       ON books (LOWER(author));
CREATE INDEX idx_books_genre        ON books (LOWER(genre));
CREATE INDEX idx_books_status       ON books (status);
CREATE INDEX idx_books_book_name_ci ON books (LOWER(book_name));
```

Functional `LOWER(...)` indexes match the case-insensitive search/filter patterns from D7. Apply via Alembic baseline migration in packet S-001.

## 3. SQLAlchemy ORM (target shape)

```python
class Book(Base):
    __tablename__ = "books"

    id         = Column(BigInteger, primary_key=True, autoincrement=True)
    book_name  = Column(String(255), nullable=False)
    author     = Column(String(255), nullable=False)
    genre      = Column(String(100), nullable=False)
    status     = Column(String(20),  nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    __table_args__ = (
        CheckConstraint("status IN ('Read', 'Unread')", name="ck_books_status"),
    )
```

## 4. State Machine — `status`

```
   ┌──────────┐    edit / mark read     ┌────────┐
   │  Unread  │ ──────────────────────▶ │  Read  │
   └──────────┘                          └────────┘
        ▲                                    │
        └──────── edit / mark unread ────────┘
```

No other states. Transitions are unrestricted (any state → any state).

## 5. Field Rules

| Field | Validation |
|-------|------------|
| `book_name` | Required, 1–255 chars, leading/trailing whitespace trimmed. |
| `author` | Required, 1–255 chars, whitespace trimmed. |
| `genre` | Required, 1–100 chars, whitespace trimmed; free-text (see OQ-003). |
| `status` | Required, exactly one of `Read` / `Unread`; case-insensitive on input, stored canonical. |
| `created_at` | Server-generated; never accepted from client. |

## 6. Sample Row

```json
{
  "id": 1,
  "book_name": "Atomic Habits",
  "author": "James Clear",
  "genre": "Self Help",
  "status": "Read",
  "created_at": "2026-06-23T14:05:32.000Z"
}
```

## 7. Index Rationale

- Functional `LOWER(...)` indexes cover case-insensitive filter/search dimensions.
- `idx_books_status` is plain since `status` is already canonical case.
- No composite indexes — query patterns are simple and Postgres handles them efficiently well below the catalog size expected here.
