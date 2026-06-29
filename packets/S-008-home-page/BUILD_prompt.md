# S-008 · BUILD prompt

```text
Builder for S-008 — Home page + frontend scaffolding.
Branch: packet/S-008-home-page. Mode: build.

Read first, in order:
  docs/product/D18-CLAUDE.md  (note §0 Required Skills)
  docs/product/D9-DESIGN-SPEC.md  (skill preamble + §2 Home)
  docs/product/D7-API-CONTRACTS.md §3.2
  docs/product/D10-QUALITY-NFRs.md Q-002, Q-003
  packets/S-008-home-page/Packet_BRD.md and Packet_DESIGN.md

STEP 0 — REQUIRED SKILL INVOCATIONS (before any JSX or CSS):

  a. Invoke `frontend-design`. Brainstorm a visual direction for a
     personal book library tracker. Decide ONE direction and commit
     to it: an editorial / library-card feel vs. a minimal product
     feel vs. another. Capture the chosen direction + the rationale
     in 3-5 lines. Pick one heading + one body typeface, one accent
     color, and one neutral scale.

  b. Invoke `ui-ux-pro-max`. Using the direction from (a):
       - Pick exactly one catalog palette (record its name + hex set).
       - Pick exactly one font pairing (record both family names).
       - Confirm primary / secondary / danger / success contrast
         ratios pass WCAG AA.
       - List the catalog patterns to use for: navbar, hero, stat card,
         feature tile.

  c. Write the result to frontend/src/design/tokens.js. This file is
     the source of truth for color + type across the project; later
     packets import from it, not from string literals.

If either skill is not invoked in this packet, the packet is RED.

STEP 1 — scaffolding (TDD-style for components where it makes sense):

  d. npm create vite@latest frontend -- --template react
  e. Install tailwind + autoprefixer + postcss; init; configure
     content paths.
  f. Install: axios, react-router-dom, vitest, @testing-library/react,
     @testing-library/user-event, msw, eslint, prettier.
  g. Author App.jsx with BrowserRouter + Routes for /, /books, /add,
     /edit/:id (last three render placeholder <h1>Coming soon</h1>).
  h. Author services/api.js exporting `api` (axios instance) and
     `getBooks()`.
  i. Author Navbar.jsx using tokens.js for colors + type.
  j. Author Home.jsx per D9 §2 — Hero, Features grid (4 tiles),
     Stats cards (4 cards) computed client-side from getBooks().
     Loading and error states must be present (use a skeleton from
     ui-ux-pro-max's pattern catalog).

STEP 2 — tests:

  k. Author Home.test.jsx with MSW mocking /books:
       - test_renders_hero
       - test_stats_show_zeros_when_no_books
       - test_stats_reflect_mocked_response   (3 books: 2 Read, 1 Unread, 2 genres)
       - test_no_horizontal_scroll_at_360px   (jsdom: set window.innerWidth=360,
         render, assert document.body.scrollWidth <= 360 — guarded with
         tolerance for jsdom quirks)
  l. npm test -- --run → green.

STEP 3 — lint + smoke:

  m. npm run lint → 0 warnings/errors.
  n. Manual smoke: open Chrome, visit / at 360 px (device toolbar)
     and 1280 px. Screenshot both into the session report (NOT Evidence).
  o. Commit and update HANDOVER.md.

Abort:
  - Skills not invoked / tokens.js missing → RED gate; stop, restart STEP 0.
  - Any test fails persistently → invoke superpowers:systematic-debugging.
  - Default Vite/Tailwind look on the home page → fail; the skill outputs
    should have produced a visibly intentional design.
```
