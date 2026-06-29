# D3 · Feature Catalog

Module boundaries: **frontend · backend · database · infra**.
Every feature decomposes into one or more packets in `D8-BACKLOG.md`.

| ID | Feature | Module | Packets | Priority |
|----|---------|--------|---------|----------|
| F-001 | Home page (hero + features + stats) | frontend | S-008 | MUST |
| F-002 | Book CRUD API | backend | S-002, S-003, S-004, S-005, S-006 | MUST |
| F-003 | Books list page | frontend | S-009 | MUST |
| F-004 | Add / Edit Book forms | frontend | S-010, S-011 | MUST |
| F-005 | Search by name or author | backend + frontend | S-007 (API), S-012 (UI) | MUST |
| F-006 | Filter by author / genre / status | backend + frontend | S-007 (API), S-012 (UI) | MUST |
| F-007 | Aggregate stats on Home | frontend | S-008 | MUST |
| F-DB  | Books schema | database | S-001 | MUST |
| F-INF | Local dev + deploy | infra | S-013 | MUST |

## Feature definitions

### F-001 · Home page
Hero (title + tagline), 4 feature tiles, 4 stat cards. CTA to **Add Book** and **View Books**.

### F-002 · Book CRUD API
Endpoints: `POST /books`, `GET /books`, `GET /books/{id}`, `PUT /books/{id}`, `DELETE /books/{id}`. Pydantic validation; SQLAlchemy persistence; error envelope `{detail}`.

### F-003 · Books list page
Responsive card grid. Each card shows book name, author, genre, status badge, Edit + Delete actions. Empty state when no books.

### F-004 · Add / Edit Book forms
Single shared `BookForm` component used by `AddBook` (blank) and `EditBook` (prefilled). Inline validation per field. `status` rendered as radio or select with two options.

### F-005 · Search
Free-text query that matches `book_name` OR `author`, case-insensitive, substring. Wired to `GET /books?search=…`.

### F-006 · Filter
Independent dropdowns for `author`, `genre`, `status`. Selections combine (AND). Wired to `GET /books?author=…&genre=…&status=…`.

### F-007 · Stats
Computed client-side in v1 from `GET /books`: total, read, unread, distinct genres.

### F-DB · Books schema
Single table; DDL in `D6-DATA-MODEL.md`.

### F-INF · Local dev + deploy
`README.md` covering setup, env vars, run commands; deploy targets resolved in OQ-001/002.

## Out-of-catalog (deferred)

- Pagination, sorting, dark mode, cover upload, auth — see `D8-BACKLOG.md` Level-1/2/3.
