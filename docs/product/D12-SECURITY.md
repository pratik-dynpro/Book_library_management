# D12 · Security

## 1. Posture for v1

- **No authentication.** Single-user, local-first app. Public deploy (S-013) is acceptable only because the app stores no PII and any reader can populate their own copy.
- **No PII collected.** Book metadata only.
- **No write access from third parties.** CORS restricted; no inbound webhooks.

## 2. Threat Model

| # | Threat | Vector | Mitigation | Owner |
|---|--------|--------|------------|-------|
| T-01 | SQL injection | User-controlled query strings (search, filters) | ORM-only access; never interpolate SQL strings; parameterized queries via SQLAlchemy | Builder (S-002, S-007) |
| T-02 | XSS in book name / author | Stored book fields rendered in React | React escapes by default; no `dangerouslySetInnerHTML`; lint rule blocks it | Builder (S-009) |
| T-03 | CSRF | Cross-site form submissions | No cookies / sessions in v1 → CSRF surface is empty. Reassess if auth is added. | N/A |
| T-04 | Mass-assignment | `PUT /books/{id}` accepting unknown fields | Pydantic `model_config = ConfigDict(extra='forbid')` on update schema | Builder (S-005) |
| T-05 | Resource exhaustion (DoS) | Unbounded `GET /books` | Hard cap `LIMIT 1000` in `crud.list_books`; document in D7 | Builder (S-004) |
| T-06 | Oversized payload | Multi-MB body to `/books` | FastAPI default body size; explicit length caps on string fields: `book_name <= 255`, `author <= 255`, `genre <= 100`, `status <= 20` | Builder (S-003) |
| T-07 | Open CORS | `*` origin allows hostile sites to call API on victim's behalf | CORS allowlist: dev `http://localhost:5173`; prod = deploy URL only | Builder (S-002) |
| T-08 | Secrets in repo | `.env` committed by mistake | `.gitignore` includes `.env`; `.env.example` only template committed | Builder (S-013) |
| T-09 | Dependency CVEs | Vulnerable transitive deps | `pip install --require-hashes` (or `pip-audit`) in CI; `npm audit --omit=dev` | Builder (D11) |
| T-10 | Sensitive logs | Stack traces leaked to client | FastAPI `debug=False` in prod; generic 500 to client; full trace server-side only | Builder (S-002) |

## 3. Auth Plan (deferred)

When Level-3 enhancements arrive:

- JWT access tokens (15 min) + refresh tokens (7 days), HTTP-only cookie storage.
- Argon2id for password hashing.
- Per-user `books.owner_id` column.
- Reactivate T-03 (CSRF) mitigations: SameSite=Strict + double-submit cookie.

## 4. Operational

- `DATABASE_URL` is the only secret in v1; rotate by editing the host's env vars.
- Backups in v1 rely on Render Postgres's built-in daily snapshots (7-day retention); no custom backup job. Local dev uses a docker-compose Postgres whose data lives in a named volume — losing the volume loses local data only.
- Public deploy must be HTTPS (Render / Vercel terminate TLS by default).

## 5. Sign-off Checklist (attached to S-002 Evidence)

- [ ] T-01 verified: SQLi attempt against `?search=` returns no rows; no SQL error.
- [ ] T-02 verified: `<script>` inside `book_name` is escaped in the rendered card.
- [ ] T-04 verified: `PUT` with unknown field returns 422.
- [ ] T-05 verified: requesting 5 000 rows returns at most 1 000.
- [ ] T-06 verified: 300-char `book_name` is rejected.
- [ ] T-07 verified: request from disallowed origin is blocked by CORS preflight.
- [ ] T-08 verified: `git ls-files | grep -E '\.env$'` returns empty.
