# S-008 · ENG-QA prompt

```text
Fresh QA. Read D18 (esp. §0), D9, D7 §3.2, D10 Q-003, F4 §4, Packet_BRD.
Do NOT read BUILD_prompt.

You may write only Evidence.md.

Verify:

  AC1: cd frontend && npm install && npm run dev. Open
       http://localhost:5173/. No console errors (DevTools → Console
       should show 0 errors and at most 0 warnings of severity error).
       Screenshot the page; attach the path in Evidence.

  AC2: Navigate to /books, /add, /edit/1 — each renders a "Coming soon"
       stub. Back button returns to / cleanly.

  AC3: Open frontend/src/services/api.js — confirm it reads
       import.meta.env.VITE_API_BASE_URL with a sensible default.
       Confirm getBooks() exists and calls /books.

  AC4: Navbar visible on every route; active link has a distinct style.

  AC5/AC6: With backend running and 3 books seeded (POST via curl),
       reload /. Stats show Total 3, Read 2, Unread 1, Genres 2
       (assuming the seed). Verify by changing one book's status via
       PUT and refreshing — counts update.

  AC7: Stop backend OR truncate books. Reload /. Stats all read 0,
       no NaN, no React error overlay.

  AC8: Chrome device toolbar → iPhone SE (360 px). Visually confirm
       no horizontal scroll. Also: window.innerWidth=360 in DevTools
       Console, assert document.body.scrollWidth <= 360.

  AC9: cd frontend && npm run lint  → exit 0.
       cd frontend && npm test -- --run → all tests pass; record output.

  AC10 (skill invocations):
       Open frontend/src/design/tokens.js. Confirm:
         - It contains real palette values (multiple hex codes), not
           a stub.
         - It contains font-family pairs.
         - The Home page imports from this file (grep Home.jsx).
       Open Evidence.md (already in progress) and confirm builder
       recorded:
         - the chosen direction from frontend-design,
         - the catalog palette + font pair name from ui-ux-pro-max.
       If tokens.js is empty / default Tailwind / palette unnamed → RED.

False-pass hunt:
  - Confirm Home.jsx imports tokens.js. If colors are hard-coded
    Tailwind defaults (e.g., bg-slate-50) and tokens.js is unused →
    the skills were not actually applied → RED (AC10).
  - Visual check: compare the rendered page to default Vite/Tailwind
    boilerplate. If indistinguishable → RED.

Regression: pytest -q in backend still green; no backend changes
expected in this packet.

Verdict.
```
