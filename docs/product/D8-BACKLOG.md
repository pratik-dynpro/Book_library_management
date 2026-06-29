# D8 · Backlog

Every story below becomes one packet folder `packets/S-NNN-slug/` containing the 5-file cycle.

## v1 — MUST (build order)

| Story | Title | Module | Files-out (representative) | Depends on |
|-------|-------|--------|----------------------------|------------|
| S-001 | Postgres + ORM model + Alembic baseline | database | `backend/database.py`, `backend/models.py`, `backend/alembic/`, `backend/alembic.ini`, `docker-compose.yml` | — |
| S-002 | FastAPI app skeleton + DB session + CORS | backend | `backend/main.py`, `backend/database.py` (already created in S-001), `.env.example` | S-001 |
| S-003 | POST /books | backend | `backend/schemas.py`, `backend/crud.py`, `backend/main.py`, `backend/tests/test_create_book.py` | S-002 |
| S-004 | GET /books + GET /books/{id} | backend | `backend/crud.py`, `backend/main.py`, `backend/tests/test_read_books.py` | S-003 |
| S-005 | PUT /books/{id} | backend | `backend/schemas.py`, `backend/crud.py`, `backend/main.py`, `backend/tests/test_update_book.py` | S-004 |
| S-006 | DELETE /books/{id} | backend | `backend/crud.py`, `backend/main.py`, `backend/tests/test_delete_book.py` | S-005 |
| S-007 | Search + filter query params | backend | `backend/crud.py`, `backend/main.py`, `backend/tests/test_search_filter.py` | S-006 |
| S-008 | Home page (hero + stats) | frontend | `frontend/src/pages/Home.jsx`, `frontend/src/components/Navbar.jsx` | S-004, S-009 |
| S-009 | Books page (card grid + delete) | frontend | `frontend/src/pages/Books.jsx`, `frontend/src/components/BookCard.jsx`, `frontend/src/services/api.js` | S-006 |
| S-010 | AddBook page + BookForm | frontend | `frontend/src/pages/AddBook.jsx`, `frontend/src/components/BookForm.jsx` | S-003, S-009 |
| S-011 | EditBook page (prefilled BookForm) | frontend | `frontend/src/pages/EditBook.jsx` | S-005, S-010 |
| S-012 | SearchBar + FilterDropdown | frontend | `frontend/src/components/SearchBar.jsx`, `frontend/src/components/FilterDropdown.jsx`, `frontend/src/pages/Books.jsx` | S-007, S-009 |
| S-013 | README + deploy notes | infra | `README.md`, `.env.example`, deploy config | all of above |

## Level-1 enhancements (post-v1, deferred)

- L1-01 Dark mode
- L1-02 Pagination (10 / 20 / 50 per page)
- L1-03 Sorting by name / author / created_at
- L1-04 Server-side stats endpoint `GET /books/stats`

## Level-2 enhancements

- L2-01 Book cover image upload (object storage)
- L2-02 Favorite flag
- L2-03 Reading progress percentage
- L2-04 "Recently added" widget on Home

## Level-3 enhancements

- L3-01 User accounts (email + password)
- L3-02 JWT auth with refresh tokens
- L3-03 Per-user libraries (`books.owner_id`)
- L3-04 Sharing read lists via public URL

## Rules

- A packet may be split if its files-out exceeds ~5 files.
- A packet may not be merged into another — it would dilute the gate.
- New v1 work requires a row added here before any packet folder is created.
