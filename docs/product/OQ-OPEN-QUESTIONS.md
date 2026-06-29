# OQ · Open Questions Tracker

Live document. Any **Blocker** halts the downstream packet that depends on it.

| ID | Question | Raised by | Status | Resolution / Decision | Affects |
|----|----------|-----------|--------|------------------------|---------|
| OQ-001 | Production deploy target — Render (backend) + Vercel (frontend) vs. single Railway service vs. Fly.io? | Builder | **Open** | _TBD before S-013_ | D13, S-013 |
| OQ-002 | Database choice across environments. | Builder | **Resolved** | **PostgreSQL in dev, test, and prod.** No SQLite anywhere. Dev uses local Postgres via docker-compose; tests use a Postgres test database with transaction-per-test rollback. | D5, D6, D11, D13, D14, D16 |
| OQ-003 | Is `genre` free-text or a closed enum? Free-text is simpler; enum prevents typos. | Builder | **Resolved** | Free-text for v1; pre-populate dropdown from existing distinct genres in DB. | D6, S-007, S-012 |
| OQ-004 | Should `created_at` be returned in UTC ISO 8601 only, or also a humanized "X days ago" string? | Builder | **Resolved** | UTC ISO 8601 from the API; humanize in the frontend using `Intl.RelativeTimeFormat`. | D7 |
| OQ-005 | Stats: client-side from `GET /books` or server-side `GET /books/stats`? | Builder | **Resolved** | Client-side in v1 (dataset is small); add server endpoint at >1k rows. | F-007, S-008 |
| OQ-006 | Validation: do we case-normalize `status` on input (`read` → `Read`)? | Builder | **Resolved** | Yes — accept case-insensitive, store canonical `Read` / `Unread`. | S-003, S-005 |
| OQ-007 | Empty-state behavior — what does the Books page show when 0 rows? | Builder | **Resolved** | Centered empty-state card with "Add your first book" CTA. | S-009 |

## Logging conventions

- Status: **Open** (no decision) · **Resolved** (decision recorded) · **Blocker** (downstream packet cannot start).
- Each resolution must cite the doc/packet that will encode it.
- A Blocker auto-bounces the dependent packet to "Not Ready" until cleared.
