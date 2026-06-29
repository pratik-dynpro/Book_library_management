# S-013 · Packet BRD — README + deploy

**Module:** infra · **Risk:** L1 · **Depends on:** all preceding packets green.

## ACs

| ID | Criterion |
|----|-----------|
| AC1 | Root `README.md` covers: project intent, stack, prerequisites, **5-minute local setup** (clone → `docker compose up -d db` → backend install + migrate + run → frontend install + run), env vars (`DATABASE_URL`, `TEST_DATABASE_URL`, `VITE_API_BASE_URL`, `CORS_ORIGINS`), how to run tests, link to `docs/product/`. |
| AC2 | `.env.example` files in both `backend/` and `frontend/` list every required key with placeholder values; no secret is committed. |
| AC3 | `.github/workflows/ci.yml` matches `D4-ENFORCEMENT.md` §6 with a Postgres 16 service container; runs on PRs to `main`; backend + frontend jobs both required. |
| AC4 | Deploy notes section in README covers: Render setup (env vars, build/start commands, attaching a Postgres add-on) AND Vercel setup (`VITE_API_BASE_URL`, build command, output dir). |
| AC5 | **Clean-clone smoke** (NFR Q-008): on a fresh machine (or a wiped scratch dir), follow README from clone to running app in under 5 minutes; documented in `Evidence.md` with timing + screenshot. |
| AC6 | `git ls-files | grep -E '\.env$'` returns empty (T-08). |

## Do-Not-Break
- Any prior packet's commands or contracts.

## Out-of-Scope
- Domain purchase, CDN config, monitoring setup.
- Production data import.
