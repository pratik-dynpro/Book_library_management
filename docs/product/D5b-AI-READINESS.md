# D5b · AI-Readiness Scorecard

How well-suited is this product to AI-led, packet-driven build?

| Dimension | Score (1–5) | Justification |
|-----------|-------------|---------------|
| Greenfield | 5 | Empty repo — no legacy code to navigate. |
| Contract clarity | 5 | One entity, one REST resource, ~5 endpoints — fully specifiable in D7. |
| Surface area | 5 | < 20 files total per the layout in D5. |
| Test feasibility | 5 | FastAPI TestClient covers backend; Vitest covers frontend. |
| State complexity | 5 | Single table, no workflows, no concurrency. |
| External dependencies | 5 | None. No third-party APIs in v1. |
| Security sensitivity | 5 | No PII, no auth, no money — L1 risk class. |
| Reusable patterns in codebase | 1 | None yet — but acceptable in a greenfield project. |
| Documentation discipline | 5 | This file is doc #7 of 24; the framework forces discipline. |

**Composite: 41 / 45 → AI-led build is appropriate.**

## Dispositions

- **Lead with TDD.** Backend ACs are testable via FastAPI TestClient before any route exists.
- **Lock contracts early.** D6 and D7 are upstream of every backend packet; freeze them before S-002.
- **Bound each packet to ≤ 5 files of blast radius** (per the packet rule of thumb). The CRUD packets naturally fit.
- **No speculative abstractions.** With one entity, the "Repository" pattern is overkill — `crud.py` is enough.

## Risks specific to AI execution

| Risk | Mitigation |
|------|-----------|
| Hallucinated FastAPI APIs (deprecated dependency injection patterns) | Pin versions; QA pass runs `pip install -r requirements.txt` from scratch. |
| Test that passes vacuously (e.g., `assert response.status_code in [200, 201, 422]`) | `ENG-QA_prompt.md` includes a false-pass hunt template. |
| ORM session leaks | `get_db` dependency in D5 is the only sanctioned session source; QA greps for direct `SessionLocal()` calls. |
| Tailwind class drift (made-up utility names) | Stick to documented v3 classes; visual QA on a real browser in S-009. |
