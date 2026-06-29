# S-013 · BUILD prompt

```text
Builder for S-013. Branch packet/S-013-readme-deploy. Mode: build.
Read D13, D4 §6, D11, D12 §T-08, Packet_BRD + DESIGN.

  1. Author the README.md per Packet_DESIGN §README outline. Every
     command must be copy-pasteable; test each one yourself in a
     scratch shell before committing.

  2. Verify backend/.env.example has DATABASE_URL + TEST_DATABASE_URL
     + CORS_ORIGINS. Create frontend/.env.example with VITE_API_BASE_URL.

  3. Author .github/workflows/ci.yml with three jobs (backend with
     postgres:16 service, frontend, security). Use the exact command
     list from D4 §6.

  4. Verify .gitignore covers .env, __pycache__, node_modules, dist,
     coverage, .pytest_cache.

  5. Resolve OQ-001 in docs/product/OQ-OPEN-QUESTIONS.md if not done
     (mark resolved with the chosen deploy target).

  6. Final self-check before commit:
       - git ls-files | grep -E '\.env$'   → empty
       - git ls-files | grep node_modules  → empty
       - git ls-files | grep __pycache__   → empty

  7. Commit + HANDOVER.

Abort:
  - Any command in the README fails when run from a clean shell →
    fix the README, don't leave broken steps.
```
