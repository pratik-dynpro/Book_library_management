# D14 · Postgres Schema Evolution Runbook

Postgres is the database in dev, test, and prod (OQ-002 closed). There is no SQLite → Postgres cutover. This doc covers Alembic-based schema changes after the baseline migration in S-001.

## 1. Baseline (one-time, in S-001)

```bash
cd backend
alembic init alembic
# Edit alembic.ini → sqlalchemy.url = ${DATABASE_URL}
# Edit alembic/env.py → target_metadata = Base.metadata
alembic revision -m "baseline books table" --autogenerate
alembic upgrade head
```

The baseline revision must match the DDL in `D6-DATA-MODEL.md` exactly. Capture the `alembic upgrade head` output in `packets/S-001-*/Evidence.md`.

## 2. Per-Migration Recipe

For every schema-changing packet:

1. Edit the relevant SQLAlchemy model in `backend/models.py`.
2. Generate the revision: `alembic revision --autogenerate -m "<imperative summary>"`.
3. Open the generated file under `alembic/versions/` and **review it line by line** — autogenerate misses `CHECK` constraints, server defaults, and functional indexes; add them by hand.
4. Run `alembic upgrade head` locally; run the suite.
5. Run `alembic downgrade -1`, then `alembic upgrade head` again to prove reversibility.
6. Commit the model change and the revision file together.

## 3. Destructive Change Policy

Drop column, drop table, alter type narrowing, NOT NULL added to an existing populated column → **two-packet pattern**:

- **Packet A:** write-through (add the new column, dual-write, backfill).
- **Packet B:** stop writing the old column, then drop it in a later release.

This prevents a single revision from being unrecoverable mid-deploy.

## 4. Pre-deploy Checks

- [ ] `alembic upgrade head` is idempotent (running twice changes nothing the second time).
- [ ] `alembic downgrade -1` succeeds and leaves the schema queryable.
- [ ] The new schema does not break any of the test cases in D17.
- [ ] If the table holds prod data: estimate the migration's runtime against a row-count-matched local snapshot.

## 5. Cutover

1. Push the migration commit to `main`.
2. Render runs `alembic upgrade head` as part of the start command (or as a pre-deploy job).
3. Wait for health check (`GET /docs` → 200).
4. Smoke test the affected endpoints.

## 6. Rollback

If post-deploy smoke fails:

- **Schema-only failure:** `alembic downgrade -1` against the prod DB; redeploy the previous container image.
- **Data corruption:** restore from Render's nightly snapshot, document the gap in `OQ-OPEN-QUESTIONS.md`, file a post-mortem packet.

## 7. Backups

Render Postgres free tier provides daily snapshots with 7-day retention. v1 relies on this default; no custom `pg_dump` cron in v1. Re-evaluate at Level-2.
