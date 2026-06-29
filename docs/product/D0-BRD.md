# D0 · Business Requirements Document (BRD)

**Product:** Book Library Management System
**Version:** 1.0
**Status:** Approved (pre-build)
**Risk class:** L1

---

## 1. Business Goal

Deliver a portfolio-grade full-stack web application that lets a single user manage a personal book collection. The project's dual purpose is (a) a usable tool and (b) a demonstrable example of disciplined AI-SDLC delivery — every change is gated by binary acceptance criteria and evidence.

## 2. Stakeholders

| Role | Who | Interest |
|------|-----|----------|
| Product owner | Pratik Mali | Defines scope, signs off on each packet |
| Builder | Claude Code | Authors code and tests inside each packet |
| QA (fresh session) | Claude Code | Verifies build output against BRD |
| End user | Pratik Mali | Manages personal book list |

## 3. In-Scope Capabilities (v1)

- Add a book (book name, author, genre, status).
- List all books.
- View a single book.
- Update an existing book.
- Delete a book.
- Search books by book name or author (single `search` query param).
- Filter books by `author`, `genre`, or `status`.
- Home page showing aggregate stats: total books, books read, unread, distinct genres.

## 4. Out-of-Scope (v1)

- Authentication, multi-user, JWT, role-based access.
- Book cover uploads, favorites, reading progress percentage.
- Recommendations, social features, ratings, reviews.
- Pagination, sorting (deferred to Level-1 enhancements).
- Offline mode, PWA features.

## 5. Success Criteria (binary)

| # | Criterion |
|---|-----------|
| BRD-AC-1 | All five CRUD operations work end-to-end via the UI. |
| BRD-AC-2 | Search returns books whose `book_name` or `author` contain the query (case-insensitive). |
| BRD-AC-3 | Each of `author`, `genre`, `status` can be filtered independently and in combination. |
| BRD-AC-4 | Home page stats reflect the current DB state without manual refresh after a CRUD action. |
| BRD-AC-5 | Backend exposes the contracts in `D7-API-CONTRACTS.md` exactly. |
| BRD-AC-6 | Every packet ships with a green `Evidence.md`. |

## 6. Constraints

- Stack locked: React + Vite + Tailwind (frontend); FastAPI + SQLAlchemy + **PostgreSQL** (backend) — no SQLite in any environment.
- Frontend packets must invoke the `frontend-design` and `ui-ux-pro-max` skills before writing JSX.
- Single-machine dev; no cloud dependency required to run.
- Weekend-scope effort; total code stays small enough to fit on a portfolio README.

## 7. Assumptions

- One reader, one library — no concurrency concerns.
- Dataset stays under ~10 000 rows for the foreseeable future.
- `genre` is free-text in v1 (see `OQ-OPEN-QUESTIONS.md`).

## 8. QA Sign-off

- [ ] PASS — content complete and binary.
- [ ] CONDITIONAL — minor edits required (list below).
- [ ] FAIL — re-author.

> Downstream readers: D1 (Roadmap), D2 (PRD), D3 (Feature Catalog), all packet BRDs.
