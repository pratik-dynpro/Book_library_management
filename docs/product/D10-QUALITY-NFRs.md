# D10 · Quality / Non-Functional Requirements

Every NFR is binary: measurable, with a stated pass threshold.

| ID | Category | Requirement | Threshold | Verification |
|----|----------|-------------|-----------|--------------|
| Q-001 | Performance | Books list renders within budget | `< 300 ms` from API response to paint, dataset = 1 000 rows, local network | Chrome DevTools Performance trace in `Evidence.md` for S-009 |
| Q-002 | Accessibility | All forms keyboard-navigable | Tab order matches visual order; Enter submits; Esc cancels modals | Manual keyboard pass; axe-core 0 critical issues |
| Q-003 | Responsive | UI usable on small phones | Layout intact at 360 px width; no horizontal scroll | Chrome device toolbar screenshots for each page |
| Q-004 | Test coverage | Backend coverage | ≥ 90 % line coverage on `crud.py`, `schemas.py`, route handlers | `pytest --cov` in `Evidence.md` for S-006 + S-007 |
| Q-005 | API latency | Median request latency | `< 50 ms` for `GET /books` (1 000 rows, local Postgres in docker-compose) | `pytest-benchmark` or `ab` snippet |
| Q-006 | Error UX | Failed mutations show user feedback | Toast or inline error within 1 render of failure; no silent failures | Manual fault-injection (stop backend, attempt save) |
| Q-007 | Static analysis | Lint + type-check clean | `ruff check` exits 0; `eslint --max-warnings 0` passes | CI log in `Evidence.md` |
| Q-008 | Reproducibility | Fresh clone → working app | `git clone` → follow README → app runs locally in `< 5 min` | Recorded in S-013 Evidence |
| Q-009 | Security baseline | Threats from D12 mitigated | All items in D12 §Threats marked Done | D12 checklist, attached to S-002 Evidence |
| Q-010 | Logs | App logs are informative | Each request line includes method, path, status, latency | `tail` snippet in Evidence |

## Out-of-scope NFRs (v1)

- Internationalization, RTL layout.
- Multi-region availability.
- SLA / uptime guarantees.
- HIPAA / GDPR data handling — no PII collected.
