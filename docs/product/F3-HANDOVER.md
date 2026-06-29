# F3 · Handover — Session-Start Contract

A short, machine-readable preamble that every session reads first. Stored at the top of the current packet's branch as `HANDOVER.md`; this document defines its shape.

## Template

```markdown
# Handover — <date>

**Active packet:** S-NNN-<slug>
**Branch:** packet/S-NNN-<slug>
**Last green commit:** <sha> (<one-line message>)
**Session mode:** build | qa
**Builder:** <agent / human>

## Where we left off
- <one-line status>
- <one-line status>

## Next planned action
- <one specific next step, with file path>

## Active open questions (from OQ-OPEN-QUESTIONS.md)
- OQ-XXX: <question> — Blocker? (yes/no)

## Test state
- Backend: pass / fail / not-run
- Frontend: pass / fail / not-run
- Last command: `<exact command>`
```

## Rules

- Updated at the end of every session, by the session that owned it.
- Truthful or absent — never partial. If you can't honestly fill the "Test state" line, leave the prior session's line untouched and add a note.
- A new session must read this file before any other action.
- If `Session mode` is missing, default to `build` and announce mode at session open.

## Example

```markdown
# Handover — 2026-06-23

**Active packet:** S-003-post-books
**Branch:** packet/S-003-post-books
**Last green commit:** a1b2c3d (S-002: app skeleton + CORS + get_db dependency)
**Session mode:** build

## Where we left off
- Wrote 3 of 4 failing tests in `backend/tests/test_create_book.py`.
- POST handler stub exists but raises NotImplementedError.

## Next planned action
- Implement `crud.create_book` in `backend/crud.py` to satisfy TC-001.

## Active open questions
- (none affecting this packet)

## Test state
- Backend: 3 failing, 7 passing
- Frontend: not-run (frontend not started yet)
- Last command: `pytest -q backend/tests/test_create_book.py`
```
