# D16 · Fault Tolerance

## 1. Failure Inventory

| # | Failure | Likelihood | Impact | Detection | Recovery |
|---|---------|-----------|--------|-----------|----------|
| F-01 | Backend down (Render free tier idle sleep, 30 s cold start) | High in prod | UI requests time out | Axios catches network error | UI shows "Service waking up — retrying"; auto-retry with backoff (250 ms × 2^n, max 4 attempts, max 8 s total) |
| F-02 | Postgres connection drop (network blip, Render free-tier idle disconnect) | Medium | 5xx burst | `OperationalError` from psycopg / SQLAlchemy | `pool_pre_ping=True`, `pool_recycle=300`; one transparent retry on `OperationalError` in `crud.py` helpers |
| F-03 | Postgres connection pool exhausted | Low | 503 on burst | Pool checkout timeout | Default pool size 5, max overflow 5 — adequate for a single user; raise only if observed |
| F-04 | CORS misconfig (wrong origin) | One-time at deploy | Frontend can't talk to backend | Browser console preflight error | Backend logs preflight reject at WARNING; fix `CORS_ORIGINS` env var |
| F-05 | Frontend build breaks (bad import) | Caught in CI | No deploy | Vercel build fails | Revert PR or hotfix forward |
| F-06 | Bad data in DB (e.g., `status=NULL`) | Very low (CHECK constraint) | UI shows blank badge | Defensive render: `status ?? 'Unread'` only as a display fallback, not as a write | Manual cleanup query |
| F-07 | Postgres storage cap reached (Render free tier) | Low | Writes fail | Render dashboard alert | Upgrade Postgres tier; or run a retention job that trims (no rows are ever auto-deleted in v1, so this is a far-future concern) |
| F-08 | Dependency CVE published mid-cycle | Medium over time | Potential exploit | `pip-audit` / `npm audit` in CI | Bump and re-deploy in a hotfix packet |

## 2. UI Behavior on Failure

- Every mutation (POST/PUT/DELETE) shows:
  - Pending: button disabled + spinner.
  - Success: green toast.
  - Failure: red toast with the API's `detail` if available; falls back to "Something went wrong — please retry".
- The UI never crashes on a failed request. State is reverted to the pre-request value.
- A "Retry" button is provided on the Books page when `GET /books` fails.

## 3. Backend Defenses

- `pool_pre_ping=True` and `pool_recycle=300` on the SQLAlchemy engine.
- One transparent retry on `OperationalError` inside `crud.py` (single attempt, no exponential backoff in v1).
- All route handlers wrap business logic in try/except for `SQLAlchemyError` → 503 with generic message; full traceback logged server-side only (T-10).
- `--proxy-headers` on uvicorn so request logs show the real client IP behind Render's proxy.

## 4. Recovery Drills

- **Cold start drill:** stop the backend, hit `GET /books` in the browser, observe the retry sequence and "waking up" toast. Documented in S-013 Evidence.
- **Migration rollback drill:** apply the most recent Alembic revision, then `alembic downgrade -1`, then `alembic upgrade head`; confirm schema is identical (`pg_dump --schema-only` diff is empty).

## 5. Limits

- No multi-region failover.
- Backups rely on Render Postgres's daily snapshots (7-day retention). Custom `pg_dump` cron is a Level-2 enhancement.
