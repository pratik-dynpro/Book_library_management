# S-002 · ENG-QA prompt

```text
Fresh session, QA mode. Read: D18, D7, D11, D12 §T-07, F4 §4,
packets/S-002-fastapi-skeleton/Packet_BRD.md. Do NOT read BUILD_prompt.

You may write only Evidence.md.

Verify:

  AC1: uvicorn main:app --port 8000 boots in <5s with TEST_DATABASE_URL
       unset and DATABASE_URL pointed at books_dev.
       Record stdout from boot.

  AC2/AC3: curl -s -o /dev/null -w "%{http_code}\n" localhost:8000/docs
           and /openapi.json. Both must be 200. Pipe /openapi.json
           through jq '.openapi' to confirm parseable.

  AC4: curl localhost:8000/healthz → body equals exactly
       {"status":"ok","db":"ok"}. Stop the Postgres container, call
       /healthz again — it should return 503 OR a body with db != "ok"
       (not crash). Record both outputs.

  AC5: curl -i -X OPTIONS localhost:8000/healthz \
         -H 'Origin: http://localhost:5173' \
         -H 'Access-Control-Request-Method: GET'
       must include Access-Control-Allow-Origin: http://localhost:5173.
       Same with Origin: http://evil.example must NOT include that header.

  AC6: cd backend && pytest -q. All tests must pass. Record output.

  AC7: ruff check backend → exit 0. Record.

False-pass hunt:
  - Open backend/tests/test_health.py and temporarily change the
    expected body to {"status":"nope"}; rerun the test → must FAIL.
    Restore the file. This proves the test actually asserts.
  - Confirm db_session fixture is used (grep test_*: must reference
    db_session OR client; an unused fixture means no real DB touch).

Regression: empty so far — record `pytest -q` was run.

Final line: Verdict: GREEN | RED — <reason>.
```
