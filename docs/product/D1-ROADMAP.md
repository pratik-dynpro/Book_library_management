# D1 · Roadmap

Two delivery drops. Each drop ends with a working, demoable app.

## Drop-1 · "Walking skeleton" (backend + minimal UI)

**Goal:** every CRUD operation works end-to-end through a basic Books page.

| Packet | Title | Module |
|--------|-------|--------|
| S-001 | books schema + SQLAlchemy model | database |
| S-002 | FastAPI app skeleton + DB session + CORS | backend |
| S-003 | POST /books | backend |
| S-004 | GET /books, GET /books/{id} | backend |
| S-005 | PUT /books/{id} | backend |
| S-006 | DELETE /books/{id} | backend |
| S-009 | Books page (list + delete) | frontend |
| S-010 | AddBook page | frontend |
| S-011 | EditBook page | frontend |

**Exit gate:** all 9 packets green; user can add/list/edit/delete books in the browser.

## Drop-2 · "Polish + deploy"

**Goal:** search, filter, stats, deploy.

| Packet | Title | Module |
|--------|-------|--------|
| S-007 | Search + filter query params | backend |
| S-008 | Home page (hero + stats) | frontend |
| S-012 | SearchBar + FilterDropdown UI | frontend |
| S-013 | README + deploy notes | infra |

**Exit gate:** all 13 packets green; app reachable on its deploy URL (decision pending in OQ-001).

## Sequencing rules

- DB before backend, backend before frontend (contract-first).
- Within a drop, packets may parallelize only if they touch disjoint files (`Packet_DESIGN.md` files-out lists are the source of truth).
- A red packet blocks every downstream packet that imports its files.

## Milestones (calendar-light, evidence-heavy)

| Milestone | Trigger |
|-----------|---------|
| M1 — Backend usable via curl | S-001…S-006 green |
| M2 — Drop-1 demoable | S-009…S-011 green |
| M3 — Search/filter live | S-007 + S-012 green |
| M4 — v1 deployed | S-013 green |

Dates intentionally omitted — packets advance when their evidence is green, not when the calendar says so.
