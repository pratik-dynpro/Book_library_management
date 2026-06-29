# S-013 · ENG-QA prompt

```text
Fresh QA. This is the FINAL gate. Read D13, D4 §6, D11, D12 §T-08,
F4 §4, Packet_BRD. Do NOT read BUILD_prompt.

This QA includes the product-integration smoke (Stage 4 §M4).

CLEAN-CLONE SMOKE (AC5):
  1. In a fresh directory:
       git clone <repo-url> bookshelf-fresh
       cd bookshelf-fresh
  2. Follow README.md verbatim, starting a stopwatch.
  3. Required outcome within 5 minutes:
       - docker compose up -d db succeeds.
       - alembic upgrade head succeeds.
       - uvicorn main:app boots; /docs returns 200.
       - npm install + npm run dev boots Vite; / renders Home page.
       - Walk the full journey: Add → Books shows it → Search filters
         → Edit → list updates → Delete → empty state.
  4. Stop the stopwatch; record elapsed time in Evidence.md.
  5. Take a final hero screenshot of the app for Evidence.

AC1: README is followable end-to-end (proven by the smoke above).

AC2: cat backend/.env.example and frontend/.env.example — every key
     has a placeholder value, no real secrets.

AC3: Push the branch; PR triggers CI. All three jobs pass. Backend
     job's logs show Postgres service container started. Record
     workflow run URL.

AC4: README §Deploy section names Render env vars + Vercel env vars
     and the exact build/start commands.

AC5: covered above.

AC6: git ls-files | grep -E '\.env$' → empty.

FINAL PRODUCT GATE:
  - pytest -q (backend) green.
  - npm test -- --run (frontend) green.
  - npm run lint + ruff check → 0.
  - Manual journey clean.

Verdict: GREEN closes the project — record in Evidence.md and update
HANDOVER.md with "Product v1 shipped".
```
