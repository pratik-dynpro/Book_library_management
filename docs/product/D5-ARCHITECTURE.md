# D5 · Architecture

## 1. Stack Summary

| Layer | Technology | Version target |
|-------|------------|----------------|
| Frontend SPA | React 18 + Vite 5 + Tailwind 3 | Latest stable |
| HTTP client | Axios | Latest stable |
| Routing | React Router 6 | Latest stable |
| Backend API | FastAPI | Latest stable |
| Validation | Pydantic v2 | Latest stable |
| ORM | SQLAlchemy 2.x | Latest stable |
| Migrations | Alembic | Latest stable |
| DB (all envs) | **PostgreSQL 16** — dev (docker-compose), test (dedicated Postgres or testcontainer), prod (managed). No SQLite. | 16+ |
| Test (backend) | pytest + httpx TestClient + transaction-per-test rollback against Postgres | Latest stable |
| Test (frontend) | Vitest + React Testing Library | Latest stable |
| Lint | ruff (py) · eslint + prettier (js) | Latest stable |

## 2. Component Diagram (text)

```
┌────────────────────────┐        HTTPS/CORS         ┌────────────────────────┐
│   Browser (React SPA)  │ ─────────────────────────▶│   FastAPI ASGI app     │
│  ┌──────────────────┐  │                           │ ┌────────────────────┐ │
│  │ Pages: Home,     │  │   GET/POST/PUT/DELETE     │ │ Routers: /books    │ │
│  │ Books, Add, Edit │  │   /books · /books/{id}    │ │ Schemas (Pydantic) │ │
│  └──────────────────┘  │                           │ │ CRUD module        │ │
│  ┌──────────────────┐  │                           │ └─────────┬──────────┘ │
│  │ services/api.js  │  │                           │           │            │
│  │ (axios client)   │  │                           │           ▼            │
│  └──────────────────┘  │                           │ ┌────────────────────┐ │
└────────────────────────┘                           │ │ SQLAlchemy session │ │
                                                     │ └─────────┬──────────┘ │
                                                     │           ▼            │
                                                     │ ┌────────────────────┐ │
                                                     │ │ PostgreSQL 16      │ │
                                                     │ │ (dev/test/prod)    │ │
                                                     │ └────────────────────┘ │
                                                     └────────────────────────┘
```

## 3. Request Lifecycle

1. UI dispatches `axios.{get|post|put|delete}` from `services/api.js`.
2. FastAPI router validates input against a Pydantic schema (`schemas.py`).
3. Router delegates to a function in `crud.py` which runs the SQLAlchemy session.
4. ORM emits SQL; Postgres returns rows.
5. Router serializes the response via a Pydantic response model.
6. Axios resolves; React updates state via `useState` / `useEffect`.

## 4. Folder Layout

```
book-library-app/
├── frontend/
│   ├── src/
│   │   ├── components/   # Navbar, BookCard, BookForm, SearchBar, FilterDropdown
│   │   ├── pages/        # Home, Books, AddBook, EditBook
│   │   ├── services/api.js
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── main.py           # FastAPI app, router include, CORS
│   ├── database.py       # engine, SessionLocal, get_db dependency
│   ├── models.py         # SQLAlchemy ORM models
│   ├── schemas.py        # Pydantic request/response schemas
│   ├── crud.py           # query/mutation functions
│   ├── alembic/          # migration env + versions
│   ├── alembic.ini
│   ├── tests/            # pytest test suite (Postgres-backed)
│   └── requirements.txt
├── docker-compose.yml    # local Postgres for dev + test
├── docs/product/         # the 21 planning docs
├── packets/              # one folder per S-NNN packet
└── README.md
```

## 5. Cross-cutting Concerns

| Concern | Decision |
|---------|----------|
| Config | `.env` files; never commit secrets. `DATABASE_URL` (Postgres connection string) is the only required key in v1. |
| CORS | `http://localhost:5173` only (dev); deploy URL added in S-013. |
| Logging | Python `logging` module, level `INFO` for app, `WARNING` for SQLAlchemy. |
| Error envelope | `{ "detail": "<message>" }` — FastAPI default. |
| Time | UTC everywhere; `datetime.utcnow()` for `created_at`. |

## 6. Boundaries (what does NOT belong here)

- No business logic in `main.py` — routes call `crud.py`.
- No SQLAlchemy session in React — only Axios speaks to the backend.
- No raw SQL in `crud.py` — ORM only (mitigates SQLi per D12).
- No JWT, OAuth, or session middleware in v1.

## 7. Why this stack

- **FastAPI** gives Pydantic + OpenAPI for free, satisfying D7 with no extra wiring.
- **SQLAlchemy 2.x + Alembic** are the de facto Python ORM + migrations duo.
- **PostgreSQL everywhere** — dev/test/prod parity removes a whole class of surprises (different dialects, different `created_at` defaults, different `TIMESTAMP` handling). Local Postgres via docker-compose adds ~10 s to first boot and zero ongoing friction.
- **Vite** beats CRA on dev-server speed; **Tailwind** removes the need for a CSS module strategy on a weekend project.
- **Axios** picked over `fetch` for its instance-level base URL and interceptors — useful when the API moves to its deploy URL.
