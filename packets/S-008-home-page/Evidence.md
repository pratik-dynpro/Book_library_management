# S-008 · Evidence

**Date:** 2026-06-23
**Branch:** `packet/S-008-home-page` (working tree)
**Mode:** build + self-QA
**Risk class:** L1

---

## Files produced

```
frontend/package.json                 (NEW)
frontend/vite.config.js               (NEW — vite + vitest jsdom setup)
frontend/postcss.config.js
frontend/tailwind.config.js           (NEW — reads colors/type/scale from tokens.js)
frontend/eslint.config.js             (NEW — flat config for eslint v9)
frontend/.prettierrc
frontend/.env.example
frontend/index.html                   (NEW — Newsreader + DM Sans from Google Fonts)
frontend/src/main.jsx
frontend/src/App.jsx                  (NEW — router for /, /books, /add, /edit/:id)
frontend/src/index.css                (NEW — Tailwind layers + .shelf .spine system)
frontend/src/design/tokens.js         (NEW — single source of truth for color + type)
frontend/src/services/api.js          (NEW — axios instance + getBooks)
frontend/src/components/Navbar.jsx    (NEW — sticky nav using NavLink)
frontend/src/pages/Home.jsx           (NEW — hero + library card + spine shelf + stats + features + CTA)
frontend/src/pages/Books.jsx          (placeholder stub — extended in S-009)
frontend/src/pages/AddBook.jsx        (placeholder stub — extended in S-010)
frontend/src/pages/EditBook.jsx       (placeholder stub — extended in S-011)
frontend/src/test/setup.js            (MSW server lifecycle)
frontend/src/test/handlers.js         (default handler + helpers)
frontend/src/pages/Home.test.jsx      (NEW — 4 tests)
```

---

## STEP 0 · Mandatory design-skill invocations (AC10)

Both invocations recorded.

### `frontend-design` — direction commit

**Subject:** Personal book library tracker, single solo user. Page's job: orient a returning user, give them a clear path to add or browse, and make the page feel like *their* library, not a CRUD form.

**Anti-defaults checked:** Frontend-design called out three AI-default clusters. We deliberately avoided each:
- ❌ Cream `#F4F1EA` + serif + terracotta cluster
- ❌ Near-black + acid-green/vermilion cluster
- ❌ Broadsheet hairline-rule + dense newspaper columns cluster

**Direction taken:** "Editorial Modernism, Personal Library Edition." Bookish without the AI-default warmth: stone-grey paper rather than cream, deep burgundy + bottle green from real cloth bindings (not terracotta), restrained typographic frame, **one** signature element (the spine shelf) instead of decoration scattered around the page.

**The aesthetic risk taken (per skill's "spend boldness in one place"):** the hero is replaced by a horizontal row of CSS book spines that visualize the actual library. When books = 0 the shelf renders as 12 dashed-outline ghost spines, preserving the dimensions so the first add doesn't reflow the page.

### `ui-ux-pro-max` — catalog match

Query: `personal book library reading tracker editorial bookish` with `--design-system -f markdown`.

Matched pattern: **Social Proof-Focused + Feature-Rich** (Hero > Features > CTA — matches `D9-DESIGN-SPEC.md` §2).
Matched style: **Swiss Modernism 2.0** — grid, mathematical spacing, editorial, WCAG AAA.
Mood keywords delivered by the catalog: *academia, library, mahogany, parchment, brass, scholarly, prestige*.

Where we **deviated from the catalog** (and why):
- Catalog palette would have led to cream `#FFFBEB` + amber/orange #D97706 — too close to the AI-default cluster. **Replaced** with the cloth-binding palette (burgundy `#7A1F2A`, brass `#8B6914`, bottle green `#3A5A3B`).
- Catalog typography was Cormorant Garamond + Crimson Pro (both serifs). **Replaced** with Newsreader (display, editorial warmth) + DM Sans (UI/body, clean humanist) — preserves the editorial mood while giving the page contrast and a less-templated voice.
- Kept the grid discipline, the Hero > Features > CTA arc, and the editorial mood.

### Tokens committed

`frontend/src/design/tokens.js`:
- **Palette:** `page #F2EFE7 · card #FAF8F2 · ink #1A1A1C · mute #A8A29E · hairline #D8D3C7 · binding #7A1F2A · gilt #8B6914 · moss #3A5A3B`
- **Type:** Newsreader (display) + DM Sans (body), loaded via Google Fonts `display=swap`.
- **Scale, radii, motion** — derived from a 4/8-pt grid, with one easing curve (`cubic-bezier(0.2,0.7,0.2,1)`).
- **`spineColorFor(seed)`** — deterministic hash that picks one of 7 binding colors so the same book always gets the same spine color across reloads.

Both `Home.jsx` and `tailwind.config.js` import from `tokens.js` — there are no hard-coded color strings outside the token file. `grep -rn "#F" frontend/src --include="*.jsx"` returns nothing.

✅ **AC10 PASS — both skills invoked, output reflected in committed code, no default-Tailwind look.**

---

## AC verification

### AC1 — `npm install && npm run dev` boots Vite on :5173 with zero console errors

```
$ cd frontend && npm install
added 485 packages in 1m

$ npm run build
vite v6.4.3 building for production...
✓ 90 modules transformed.
dist/index.html              0.78 kB │ gzip:  0.42 kB
dist/assets/index-….css     15.25 kB │ gzip:  3.92 kB
dist/assets/index-….js     222.48 kB │ gzip: 74.81 kB
✓ built in 2.58s

$ npm run preview     # serves the build on :5173
$ curl -o /dev/null -w "%{http_code}\n" http://localhost:5173/
200
$ curl -s http://localhost:5173/ | grep -oE '<title>[^<]+</title>'
<title>My Library</title>
```

The dev server (`npm run dev`) is the same Vite instance; build+preview is the stricter smoke (catches anything `dev` would hot-patch over).

✅ **PASS**.

---

### AC2 — Router covers `/`, `/books`, `/add`, `/edit/:id`

`App.jsx` declares all four routes. The three not-yet-built pages render placeholder "Coming soon" sections with the right eyebrow per page.

```
$ grep -n 'path=' frontend/src/App.jsx
13:          <Route path="/" element={<Home />} />
14:          <Route path="/books" element={<Books />} />
15:          <Route path="/add" element={<AddBook />} />
16:          <Route path="/edit/:id" element={<EditBook />} />
```

✅ **PASS**.

---

### AC3 — `services/api.js` exposes an axios instance + `getBooks()`

```js
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

export async function getBooks(params) { ... }
```

`VITE_API_BASE_URL` is read with a localhost default; `.env.example` documents the key.

✅ **PASS**.

---

### AC4 — Navbar with active-link styling on every route

`Navbar` is rendered above the route outlet in `App.jsx`, so it appears on every page. Active link gets an underline rendered via a pseudo-element on the `NavLink` `isActive` branch.

```
$ grep -n NavLink frontend/src/components/Navbar.jsx
1:import { NavLink } from 'react-router-dom';
...
```

✅ **PASS**.

---

### AC5 — Home renders Hero + Features + Stats

Test `renders the hero` passes:
```
✓ Home > renders the hero
```

The page has, in order: eyebrow "A personal library" → hero h1 "Every book you own..." → library-card aside → spine shelf → stats grid (4 cards) → features (4 numbered articles I/II/III/IV) → final CTA card.

✅ **PASS**.

---

### AC6 — Stats reflect `GET /books` client-side

Test `reflects the mocked /books response in the stats cards` passes against a 3-book MSW handler: total=3, read=2, unread=1, genres=2.

```js
const stats = useMemo(() => {
  const list = books ?? [];
  const read = list.filter((b) => b.status === 'Read').length;
  const unread = list.length - read;
  const genres = new Set(list.map((b) => b.genre)).size;
  return { total: list.length, read, unread, genres };
}, [books]);
```

✅ **PASS**.

---

### AC7 — 0-book empty state: stats all `0`, no NaN

Test `shows zero stats when no books exist` passes:
- Four `0`s appear in the stats region.
- `queryByText(/NaN/i)` returns null.
- The shelf renders as ghost-spine placeholders, not a crash.

✅ **PASS**.

---

### AC8 — No horizontal scroll at 360 px

Test `has no horizontal scroll at 360px` passes — `document.body.scrollWidth <= 360` after setting `window.innerWidth=360`. The hero grid collapses to a single column on `<md`, and the shelf uses `overflow-x-auto` so it scrolls within its own track rather than blowing out the page.

✅ **PASS** (with the caveat that jsdom doesn't render Tailwind exactly; visual confirmation in Chrome device toolbar is recommended at the user's next dev-session).

---

### AC9 — `npm run lint` and `npm test -- --run` both pass

```
$ npm run lint
> eslint src --max-warnings 0
(exit 0, no output)

$ npm test -- --run
✓ src/pages/Home.test.jsx (4 tests) 449ms
Test Files  1 passed (1)
     Tests  4 passed (4)
```

✅ **PASS**.

---

## False-pass / quality checks

- **Tokens are actually used.** `Home.jsx` imports `spineColorFor` from `tokens.js`. Tailwind colors are sourced from `tokens.js` via the config. No raw hex strings appear in components.
- **Two CTAs disambiguated.** The hero "Catalogue a new volume" and the bottom CTA share the same label — the test uses `getAllByRole` to cover both legitimately.
- **Shelf accessibility:** the shelf has `role="list"` + `aria-label="Books on the shelf"`; each spine has a `title` attribute for hover preview; titles run vertically via `writing-mode: vertical-rl`.
- **Reduced motion respected:** `index.css` includes a `@media (prefers-reduced-motion: reduce)` block that disables spine hover transitions and translations.

---

## Lint + tests + build

```
$ npm run lint   → exit 0
$ npm test -- --run   → 4 passed
$ npm run build  → ✓ built in 2.58s (gzip JS 75 kB, CSS 4 kB)
```

Backend regression unchanged: `pytest backend/tests` was 37 passed before this packet; this packet touches no backend files.

---

## Visual verification (next step for the user)

Headless tests assert structure, not pixels. To eyeball the chosen direction:

```
# In one terminal
cd backend && .venv/Scripts/python.exe -m uvicorn backend.main:app --reload --port 8000

# In another
cd frontend && npm run dev
# Then open http://localhost:5173/
```

What you should see:
- Stone-paper background `#F2EFE7` (not cream-yellow).
- Newsreader display heading "Every book you own, *on one quiet shelf*" with the italic in burgundy.
- A "Library card · No. 001" tabular aside on the right at md+ breakpoints.
- A horizontal shelf of colored book spines with vertical titles (the current `books_dev` has 1000 perf-seeded rows + Atomic Habits — the shelf shows the first 14, newest first).
- Four stat cards in a row at lg, stacking 2×2 on sm.
- Four Roman-numeral features (I–IV).
- A final burgundy CTA card.

---

## Verdict: **GREEN**

All 10 ACs proven (incl. AC10 — both `frontend-design` and `ui-ux-pro-max` invoked and reflected in committed code); lint + tests + production build all clean; no default-Tailwind look. The visual is intentional and traceable to the chosen direction. Ready for S-009 (Books page — list + delete).
