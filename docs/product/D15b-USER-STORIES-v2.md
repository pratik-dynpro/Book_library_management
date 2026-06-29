# D15b · User Stories v2 — Build-precise

Each D15a story is restated with binary ACs that name `books.column` and the API contract from D7.

## US-01 · Add a book

**Story:** As a reader, I want to add a book to my library so I can remember what I own.

**ACs**
- AC1: `POST /books` with valid `book_name`, `author`, `genre`, `status` returns 201 and the created `Book` including server-generated `id` and `created_at`.
- AC2: A new row appears in `books` matching the request.
- AC3: Missing any required field → 422.
- AC4: `status` outside `{Read, Unread}` (case-insensitive accepted, persisted canonical) → 422.
- AC5: After creation, `GET /books` includes the new row first (ordered by `created_at DESC`).

## US-02 · List all books

**ACs**
- AC1: `GET /books` returns `Book[]`, ordered by `books.created_at DESC`.
- AC2: With 0 rows → empty array `[]`, status 200.
- AC3: Cap at 1 000 rows (T-05).

## US-03 · Edit a book

**ACs**
- AC1: `PUT /books/{id}` with full `BookUpdate` body returns 200 + the updated `Book`.
- AC2: Row in `books` reflects every changed field; `created_at` is **not** mutated.
- AC3: Unknown id → 404 `{ "detail": "Book not found" }`.
- AC4: Extra field in body → 422 (T-04).
- AC5: UI `EditBook` page prefills the form from `GET /books/{id}` before render.

## US-04 · Delete a book

**ACs**
- AC1: `DELETE /books/{id}` returns 204, empty body.
- AC2: Row is gone from `books`.
- AC3: Unknown id → 404.
- AC4: UI confirms via modal before calling DELETE.

## US-05 · Search

**ACs**
- AC1: `GET /books?search=q` returns rows where `LOWER(book_name) LIKE %q%` OR `LOWER(author) LIKE %q%`.
- AC2: Empty `search` → behaves as no filter.
- AC3: SQL-injection probe (`'; DROP TABLE books;--`) returns 0 rows; table still exists (T-01).

## US-06 · Filter by author

**ACs**
- AC1: `GET /books?author=X` returns rows where `LOWER(author) = LOWER(X)`.
- AC2: No match → `[]`.

## US-07 · Filter by genre

**ACs**
- AC1: `GET /books?genre=X` returns rows where `LOWER(genre) = LOWER(X)`.

## US-08 · Filter by status

**ACs**
- AC1: `GET /books?status=Read` returns only `Read` rows.
- AC2: `?status=foo` → 422.

## US-09 · Stats on Home

**ACs**
- AC1: Stat cards show: total = `count(*)`, read = `count where status='Read'`, unread = `count where status='Unread'`, genres = `count(distinct genre)`.
- AC2: Numbers refresh on next mount of `/` after any CRUD.

## US-10 · Friendly home

**ACs**
- AC1: `/` renders Hero + Features tiles + Stats cards + CTAs to `/books` and `/add`.
- AC2: With 0 books, stats show `0` cleanly (no NaN, no error).

## US-11 · Mobile

**ACs**
- AC1: All pages render without horizontal scroll at 360 px width (NFR Q-003).

## US-12 · Inline form errors

**ACs**
- AC1: Submitting `AddBook` with an empty `book_name` shows error text below that field, not a global banner.
- AC2: Submitting with a 422 from the API shows the field-level error returned by FastAPI.
