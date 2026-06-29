# S-013 · Packet DESIGN

## Files In
D13 (Infra), D4 §6 (CI), D11 (Testing), D12 §T-08.

## Files Out
- `README.md` (NEW at repo root)
- `backend/.env.example` (already exists; verify completeness)
- `frontend/.env.example` (NEW; key: `VITE_API_BASE_URL`)
- `.github/workflows/ci.yml` (NEW)
- `.gitignore` (verify: `.env`, `__pycache__`, `node_modules`, `dist`, `.pytest_cache`, `frontend/coverage`, `backend/htmlcov`)

## README outline

```
# Book Library Management
1. What it is (1 paragraph) + screenshot
2. Stack at a glance
3. Quickstart (5-minute setup)
   - prerequisites: Docker, Python 3.11+, Node 20+
   - commands, in order, exact copy-paste
4. Run the test suite (backend + frontend)
5. Project layout (tree, link to docs/product/)
6. Deploy
   - Render: backend service config, Postgres add-on, env vars
   - Vercel: frontend project config, env vars, build command
7. Contributing / packet workflow (link to AI-SDLC-Build-Process.md)
8. License (or "Personal portfolio project" disclaimer)
```

## CI workflow shape

- `on: pull_request` to main, `push` to feature branches.
- Jobs: `backend` (services: postgres:16), `frontend`, `security` (pip-audit + npm audit).
- Both `backend` and `frontend` are required to merge.

## AC-to-code Map

| AC | Where |
|----|-------|
| AC1 | `README.md` §1-§5 |
| AC2 | `backend/.env.example`, `frontend/.env.example` |
| AC3 | `.github/workflows/ci.yml` |
| AC4 | `README.md` §6 |
| AC5 | Verified during QA, recorded in `Evidence.md` |
| AC6 | `.gitignore` + verification |

## Rollback
`git revert` the packet's commits. Nothing else affected.
