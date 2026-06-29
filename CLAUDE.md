# Book Library Management — Project Context

> **Resume guide.** Everything a fresh Claude session needs to pick this project up where it was left off. Detailed designs and ACs live under `docs/product/`; this file is the index + state.

---

## 0. Companion files — read these together

This file is paired with **`Project_Progress_Tracker.xlsx`** at the project root. Read both at the start of any new session:

| File | Format | Read it for |
|------|--------|-------------|
| **`CLAUDE.md`** (this file) | Narrative markdown | Stack rules, repo layout, design tokens, run commands, troubleshooting — the *briefing*. |
| **`Project_Progress_Tracker.xlsx`** | Spreadsheet with 6 sheets | Live status per packet/AC/story with conditional formatting — the *dashboard*. |

**How they map onto each other:**

| CLAUDE.md section | Tracker sheet | What changes where |
|-------------------|---------------|--------------------|
| §5 *State as of last session* | **Dashboard** + **Packets** | Status per stage (BRD/DESIGN/BUILD/Execution/ENG-QA/Evidence) lives in `Packets`. Markdown is the snapshot at session end; spreadsheet is editable. |
| §5 packet status table | **Packets** rows 5–17 | One row per S-NNN. Notes column carries the same one-liner you'll find here. |
| AC counts in evidence files | **Acceptance Criteria** | Every AC is a row; Verdict column reflects Pass/Not run. |
| US-01…US-12 in `D15a` | **User Stories** | Story → features → packets → status. |
| `docs/product/OQ-OPEN-QUESTIONS.md` | **Open Questions** | Same items; spreadsheet lets you toggle Open/Resolved/Blocker with color. |

**Update protocol:** when a packet's Evidence flips to GREEN, update BOTH files in the same step:
1. Mark the six stage cells `Done` in the **Packets** sheet (KPI cards on the Dashboard roll up automatically).
2. Flip that packet's AC verdicts to `Pass` in the **Acceptance Criteria** sheet.
3. Update the matching row in §5 of this file (drop one line, mark the next packet NEXT).

If only one of the two is updated, the other is wrong — treat divergence as a bug.

The tracker's **Dashboard** sheet has a "Resume on a new day" cell pointing back to this file, so the link is bidirectional and there's no ambiguity about which file is the front door.

---

## 1. What this project is

A full-stack personal book library manager — single user, CRUD over one `books` table, search + filter, deploy-ready. Built as a **portfolio demonstration of the AI-SDLC build process** defined in `AI-SDLC-Build-Process.md`: every code change ships inside a 5-file packet with binary acceptance criteria and an Evidence file.

## 2. Stack (locked — do not change without an explicit conversation)

| Layer | Choice | Notes |
|------|--------|-------|
| Frontend | React 18 + Vite 6 + Tailwind 3 + React Router 6 + Axios | ES modules; tests with Vitest + RTL + MSW |
| Backend | FastAPI + Pydantic v2 + SQLAlchemy 2.x + Alembic | Python 3.11+ (this dev box runs 3.14) |
| Database | **PostgreSQL 17, native install — NOT SQLite, NOT Docker** | One server, two DBs: `books_dev`, `books_test` |
| Role / pwd | `books` / `books` (DB superuser is `postgres` / `1234`) | local-only, never deployed |

### Hard rules from user

- **Postgres-only. No SQLite, no in-memory test stand-in.** Saved as durable preference.
- **Every frontend packet (S-008–S-012) MUST invoke BOTH** `frontend-design` AND `ui-ux-pro-max` skills BEFORE writing any JSX. Default Tailwind look is a RED gate. Saved as durable preference.
- Build packets one at a time, **with explicit user approval before each**.

---

## 3. Process: how we work

Decomposition (defined in `AI-SDLC-Build-Process.md`): **product → modules → features → packets**.

Each packet has its own folder under `packets/S-NNN-slug/` with five files:

1. `Packet_BRD.md` — binary ACs, do-not-break, out-of-scope
2. `Packet_DESIGN.md` — files in/out, AC↔code map, rollback
3. `BUILD_prompt.md` — paste-ready prompt for the build session
4. `ENG-QA_prompt.md` — recipe for a fresh QA session
5. `Evidence.md` — verdict (GREEN/RED) + commands + outputs (written after execution)

**Per-packet cycle:** plan → red tests → implement → green tests → ruff/lint → live smoke → write Evidence → ask user for the next approval.

Because we're a single developer running both build and QA in one session, every Evidence file calls that deviation out explicitly and substitutes a self-QA pass (re-derive expectations from BRD, run the ENG-QA recipe verbatim).

---

## 4. Repository layout

```
Book_library_management/
├── AI-SDLC-Build-Process.md           # the framework
├── CLAUDE.md                          # this file
├── Project_Progress_Tracker.xlsx      # multi-sheet status tracker (open in Excel)
├── .gitignore
│
├── docs/product/                      # 24 planning docs — Stage 1
│   ├── D0-BRD.md
│   ├── OQ-OPEN-QUESTIONS.md
│   ├── D1-ROADMAP.md
│   ├── D2-PRD.md
│   ├── D3-FEATURE-CATALOG.md
│   ├── D4-ENFORCEMENT.md
│   ├── D5-ARCHITECTURE.md
│   ├── D5b-AI-READINESS.md
│   ├── D6-DATA-MODEL.md
│   ├── D7-API-CONTRACTS.md
│   ├── D8-BACKLOG.md
│   ├── D9-DESIGN-SPEC.md              # has the skill-invocation checklist for FE packets
│   ├── D10-QUALITY-NFRs.md
│   ├── D11-TESTING.md
│   ├── D12-SECURITY.md
│   ├── D13-INFRA.md
│   ├── D14-MIGRATION.md
│   ├── D15a-USER-STORIES-v1.md
│   ├── D15b-USER-STORIES-v2.md
│   ├── D16-FAULT-TOLERANCE.md
│   ├── D17-TEST-CASES.md
│   ├── D18-CLAUDE.md                  # coding standards + §0 Required Skills
│   ├── F1-LAUNCH.md
│   ├── F2-HANDOFF.md
│   ├── F3-HANDOVER.md
│   └── F4-OPERATING-MANUAL.md
│
├── packets/                           # 13 packets — Stage 2
│   ├── S-001-postgres-orm-alembic/    # GREEN ✅
│   ├── S-002-fastapi-skeleton/        # GREEN ✅
│   ├── S-003-post-books/              # GREEN ✅
│   ├── S-004-get-books/               # GREEN ✅
│   ├── S-005-put-books/               # GREEN ✅
│   ├── S-006-delete-books/            # GREEN ✅
│   ├── S-007-search-filter/           # GREEN ✅
│   ├── S-008-home-page/               # GREEN ✅ (frontend scaffolding + Home)
│   ├── S-009-books-page/              # GREEN ✅
│   ├── S-010-add-book-page/           # GREEN ✅
│   ├── S-011-edit-book-page/          # GREEN ✅
│   ├── S-012-search-filter-ui/        # GREEN ✅
│   └── S-013-readme-deploy/           # NEXT (final gate)
│
├── backend/
│   ├── .venv/                         # Python venv (gitignored)
│   ├── .env                           # gitignored — contains real DATABASE_URL
│   ├── .env.example
│   ├── requirements.txt
│   ├── pyproject.toml                 # ruff + pytest config
│   ├── __init__.py
│   ├── database.py                    # engine, SessionLocal, get_db
│   ├── models.py                      # SQLAlchemy Book model
│   ├── schemas.py                     # Pydantic BookBase / BookCreate / BookUpdate / Book
│   ├── crud.py                        # create/list/get/update/delete + search/filter
│   ├── main.py                        # FastAPI app + 5 routes + /healthz + CORS
│   ├── alembic.ini
│   ├── alembic/
│   │   ├── env.py
│   │   └── versions/0001_baseline_books.py
│   └── tests/
│       ├── conftest.py                # session engine, autouse migrations, SAVEPOINT db_session, client
│       ├── test_health.py             # 4 tests (S-002)
│       ├── test_create_book.py        # 7 tests (S-003)
│       ├── test_read_books.py         # 6 tests (S-004)
│       ├── test_update_book.py        # 7 tests (S-005)
│       ├── test_delete_book.py        # 3 tests (S-006)
│       └── test_search_filter.py      # 10 tests (S-007)
│
└── frontend/
    ├── .env.example                   # VITE_API_BASE_URL only
    ├── package.json
    ├── vite.config.js                 # also configures vitest jsdom + setupFiles
    ├── tailwind.config.js             # reads colors/type/scale from tokens.js
    ├── postcss.config.js
    ├── eslint.config.js               # flat config (eslint v9)
    ├── .prettierrc
    ├── index.html                     # loads Newsreader + DM Sans from Google Fonts
    └── src/
        ├── main.jsx
        ├── App.jsx                    # router + <ToastProvider>
        ├── index.css                  # Tailwind layers + .shelf .spine CSS system
        ├── design/tokens.js           # SINGLE SOURCE OF TRUTH for colors + type
        ├── services/api.js            # axios + getBooks/createBook/deleteBook + mapFastApiErrors
        ├── components/
        │   ├── Navbar.jsx
        │   ├── BookCard.jsx           # spine-stripe card mirroring home shelf colors
        │   ├── BookForm.jsx           # shared add/edit form (S-010)
        │   ├── ConfirmModal.jsx       # focus-trapped, ARIA-correct
        │   └── ToastProvider.jsx      # context + viewport + useToast hook
        ├── pages/
        │   ├── Home.jsx               # hero + library card + spine shelf + stats + features
        │   ├── Books.jsx              # card grid + delete flow
        │   ├── AddBook.jsx            # wires BookForm to POST /books
        │   ├── EditBook.jsx           # STUB — replaced in S-011
        │   ├── Home.test.jsx          # 4 tests
        │   ├── Books.test.jsx         # 6 tests
        │   └── AddBook.test.jsx       # 3 tests
        ├── components/BookForm.test.jsx  # 5 tests
        └── test/
            ├── setup.js               # MSW server lifecycle for vitest
            └── handlers.js            # okBooks, okCreate, okDelete, create422, etc.
```

---

## 5. State as of last session (2026-06-29)

- **Backend: complete and tested.** 37 pytest tests passing, ruff clean.
- **Frontend: 5 of 5 build packets done.** 35 Vitest tests passing, ESLint clean, build 80.74 KB JS gzip (S-012 added +1.46 KB for SearchBar + FilterDropdown).
- **Books in `books_dev`:** 2 rows (`Atomic Habits` Read, `Deep Work` Unread) — DB unchanged by S-012 (frontend-only packet). Truncate if you need a known baseline: `psql -U books -d books_dev -c "TRUNCATE books RESTART IDENTITY;"`
- **No commits.** Everything is working-tree only; no git initialised yet by design. If you want to start committing, do so per packet.

### Packet status (mirror of `Project_Progress_Tracker.xlsx`)

| Packet | Module | Status |
|--------|--------|--------|
| S-001 Postgres + ORM + Alembic | database | ✅ GREEN |
| S-002 FastAPI skeleton + CORS | backend | ✅ GREEN |
| S-003 POST /books | backend | ✅ GREEN |
| S-004 GET /books + /books/{id} | backend | ✅ GREEN |
| S-005 PUT /books/{id} | backend | ✅ GREEN |
| S-006 DELETE /books/{id} | backend | ✅ GREEN |
| S-007 Search + filter | backend | ✅ GREEN |
| S-008 Home page + scaffolding | frontend | ✅ GREEN |
| S-009 Books page (list + delete) | frontend | ✅ GREEN |
| S-010 AddBook + shared BookForm | frontend | ✅ GREEN |
| S-011 EditBook page | frontend | ✅ GREEN |
| S-012 Search + Filter UI | frontend | ✅ GREEN |
| **S-013 README + deploy + final gate** | **infra** | **NEXT — awaiting approval** |

---

## 6. Design system snapshot

**Direction:** "Editorial Modernism, Personal Library Edition." Bookish without the AI-default warmth (cream + serif + terracotta cluster was explicitly avoided).

**Palette** (all from `frontend/src/design/tokens.js`):

| Token | Hex | Used for |
|------|-----|----------|
| `page` | `#F2EFE7` | Warm stone background (not cream) |
| `card` | `#FAF8F2` | Surface above background |
| `ink` | `#1A1A1C` | Body text |
| `mute` | `#A8A29E` | Captions, borders |
| `hairline` | `#D8D3C7` | Dividers |
| `binding` | `#7A1F2A` | Primary CTA, accent (cloth-binding burgundy) |
| `gilt` | `#8B6914` | Read-status mark (antique brass) |
| `moss` | `#3A5A3B` | Success toasts |
| `danger` | `#9A2A2A` | Destructive actions, error toasts |

**Type:** `Newsreader` (display + variable OPSZ) + `DM Sans` (UI/body). Both loaded from Google Fonts in `index.html`.

**Signature element:** the CSS book-spine shelf on Home — colored vertical bars with rotated titles, unread books pulled forward 4 px, hover lifts. `BookCard` carries a matching 6-px stripe so the same book is recognizable across views.

**Rule:** NO raw hex strings in JSX. All colors come through Tailwind classes resolved from `tokens.js`.

---

## 7. How to run things

### Bootstrap (if env is missing)

```bash
# Postgres role + databases (one time, requires the `postgres` superuser pwd '1234')
psql -U postgres -h localhost -d postgres <<SQL
DO \$\$BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='books') THEN CREATE ROLE books LOGIN PASSWORD 'books' CREATEDB; END IF; END\$\$;
SQL
psql -U postgres -h localhost -d postgres -c "CREATE DATABASE books_dev OWNER books;"
psql -U postgres -h localhost -d postgres -c "CREATE DATABASE books_test OWNER books;"

# Backend
cd backend
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements.txt
.venv/Scripts/alembic.exe -c alembic.ini upgrade head

# Frontend
cd frontend
npm install
```

### Day-to-day

```bash
# Run the backend
backend/.venv/Scripts/python.exe -m uvicorn backend.main:app --reload --port 8000

# Run the frontend (Vite dev server on :5173)
cd frontend && npm run dev

# Tests
backend/.venv/Scripts/python.exe -m pytest backend/tests              # 37 tests
cd frontend && npm test -- --run                                       # 35 tests

# Lint
backend/.venv/Scripts/ruff.exe check backend
cd frontend && npm run lint                                            # eslint --max-warnings 0
```

### Required env vars

Already in `backend/.env` (gitignored). For a fresh checkout:

```
DATABASE_URL=postgresql+psycopg://books:books@localhost:5432/books_dev
TEST_DATABASE_URL=postgresql+psycopg://books:books@localhost:5432/books_test
CORS_ORIGINS=http://localhost:5173
```

Frontend uses `VITE_API_BASE_URL=http://localhost:8000` (default if unset).

---

## 8. Resuming tomorrow — what to do

1. Open `Project_Progress_Tracker.xlsx` if you want the dashboard view.
2. Run the test suites to confirm the working tree is still green:
   ```
   backend/.venv/Scripts/python.exe -m pytest backend/tests
   cd frontend && npm test -- --run
   ```
3. Read `packets/S-013-readme-deploy/Packet_BRD.md` + `Packet_DESIGN.md` + `BUILD_prompt.md`.
4. **Ask the user for explicit approval** of S-013 before authoring anything. (User has been approving packet-by-packet.)
5. S-013 is infra/docs (README + deploy + final gate) — likely no JSX, so the frontend-design / ui-ux-pro-max skill gate does not apply. Confirm by reading the BRD.

---

## 9. Known deviations from the original spec (recorded for audit)

| # | Original | Actual | Reason |
|---|----------|--------|--------|
| 1 | docker-compose with `db` + `db_test` services | Native Postgres 17, two databases on `:5432` | User asked to skip Docker |
| 2 | Postgres 16 | Postgres 17 | What's installed locally |
| 3 | Separate build vs. QA sessions | Build+self-QA in one session | Single-developer execution |
| 4 | Backlog: S-001 used the title "books schema + ORM model" | Title updated to "Postgres + ORM model + Alembic baseline" | Reflects the actual scope after the OQ-002 resolution |

All four are recorded in the relevant Evidence files.

---

## 10. User preferences (saved in memory — see `~/.claude/projects/.../memory/stack-preferences.md`)

- **Postgres-only DB**, no SQLite anywhere.
- **`frontend-design` AND `ui-ux-pro-max`** are both mandatory before any JSX. Default Tailwind look = RED gate.
- **Approve each packet individually** before execution. Don't chain.

---

## 11. Things explicitly out of scope for v1 (don't slip them in)

- Authentication, multi-user, JWT, sessions.
- Cover images, ISBN lookup, social features.
- Pagination, sorting (Level-1 enhancements).
- Server-side stats endpoint (client-side is fine until ~1k rows).
- Native mobile app.

These are documented in `docs/product/D0-BRD.md` §4 and `D8-BACKLOG.md` (Level-1/2/3 enhancements section).

---

## 12. If something feels off

- **Schema drift in `books_dev`:** `alembic -c backend/alembic.ini downgrade base && alembic -c backend/alembic.ini upgrade head` rebuilds it cleanly.
- **A test hangs:** vitest worker crashes on infinite renders. Common cause: `useEffect` with an object-literal dep. Run with `--testTimeout=8000` to fail fast.
- **`/read/i` regex matches both radios:** anchor it to `/^read$/i` (caught in S-010).
- **You can't find a hex color in a JSX file:** good. They all live in `frontend/src/design/tokens.js`.
- **The user pushes back on the design feeling templated:** invoke `frontend-design` again, re-check the three AI-default clusters in §STEP 0 of the latest frontend packet's Evidence, and propose specific adjustments before changing code.
