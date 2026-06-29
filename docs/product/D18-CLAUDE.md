# D18 · CLAUDE.md — Coding Standards & Conventions

This document is the rulebook every build session reads first.

## 0. Required Skills (invoke before coding)

| Packet kind | Skills, in invocation order |
|-------------|-----------------------------|
| Any | `superpowers:test-driven-development` → `superpowers:systematic-debugging` (on test failure) → `superpowers:verification-before-completion` (before evidence) |
| **Frontend (S-008 — S-012)** | `frontend-design` **first** (sets visual direction, palette intent, typography), then `ui-ux-pro-max` (locks the catalog palette / font pairing / UX patterns / accessibility rules), then the universal skills above. Both `frontend-design` AND `ui-ux-pro-max` are MANDATORY — not optional, not "where appropriate". |
| Backend / DB / Infra | The universal skills above. |

Skipping the frontend skills produces templated, default Tailwind output — explicitly rejected. The first action of any frontend build session is `Skill frontend-design`, followed by `Skill ui-ux-pro-max`; only after both have run may JSX or Tailwind classes be authored.

## 1. Universal Rules

- **TDD.** Failing test first, implementation second, refactor third.
- **Small commits.** One logical change per commit.
- **No scope creep.** If a task touches a file outside `Packet_DESIGN.md` files-out, stop and report.
- **No silent edits to QA artifacts.** `Evidence.md` is written only by the QA session.
- **No `print` for runtime output.** Use `logging` (Python) or `console.log` only in dev.

## 2. Python / Backend

- Python 3.11+.
- Format with `ruff format`; lint with `ruff check` (rules: `E, F, I, B, UP`).
- Type hints on every function signature.
- One responsibility per module:
  - `database.py` — engine, session, `get_db`.
  - `models.py` — SQLAlchemy ORM classes only.
  - `schemas.py` — Pydantic models only.
  - `crud.py` — pure functions taking a session + inputs.
  - `main.py` — FastAPI app + routes; no business logic.
- Pydantic v2:
  - `model_config = ConfigDict(extra='forbid')` on every write schema.
  - `Field(..., max_length=N)` on every string field (limits from D6 §5).
- SQLAlchemy:
  - Always go through `get_db` dependency. Never call `SessionLocal()` in business code.
  - Use `session.scalars(select(...))`; avoid legacy `Query` API.
- Tests in `backend/tests/test_<feature>.py`; one assertion concept per test.

## 3. JavaScript / Frontend

- Node 20+.
- ESLint + Prettier; max-warnings 0.
- React 18, functional components only.
- One component per file; **named exports** (no default export except `App`).
- Hooks order: state → derived → effects → handlers → JSX.
- API calls live in `src/services/api.js`; components never call `axios` directly.
- Tailwind utility classes; no inline `style={{…}}` except for dynamic values that can't be expressed in classes.
- No `dangerouslySetInnerHTML`.
- Form validation: client-side (HTML required + custom checks) **and** trust the API's 422.

## 4. File / Naming Conventions

| Item | Convention |
|------|------------|
| Python module | `snake_case.py` |
| Python class | `PascalCase` |
| Python function | `snake_case` |
| React component file | `PascalCase.jsx` |
| Hook | `useThing.js` |
| API service function | `getBooks`, `createBook` (verbNoun camelCase) |
| Pydantic schema | `Book`, `BookCreate`, `BookUpdate` |

## 5. Git Hygiene

- Branch per packet: `packet/S-NNN-slug`.
- Commit subject: imperative present, ≤ 72 chars. Body explains the WHY.
- Never `--no-verify`. If a hook fails, fix the underlying issue.
- Never amend a published commit.

## 6. Abort Conditions for a Build Session

Stop and report instead of guessing when any of these holds:
- A file in `files-in` doesn't exist as expected.
- A test you wrote earlier in the session unexpectedly turns green without an implementation change.
- An import you'd need to add isn't in `requirements.txt` / `package.json`.
- The change would touch a file not listed in `Packet_DESIGN.md` files-out.
- A migration would be destructive (drop column, alter type) — flag for human review.

## 7. Comments

- Default: write none. Code + names should explain themselves.
- Allowed: a single line when the WHY is non-obvious (e.g., a workaround for an upstream bug, a deliberate-not-a-mistake choice).
- Banned: change logs, "this used to do X", references to issue numbers.
