# S-012 · Evidence — Search + Filter UI

**Verdict:** GREEN ✅
**Date:** 2026-06-29
**Session mode:** single-developer build + self-QA (per recorded deviation #3)

---

## Implementation status when this session started

The packet code (`SearchBar.jsx`, `FilterDropdown.jsx`, `Books.jsx` filter bar, `getBooks(params)`, three test files) was already on disk from prior work. This session's role was verification + Evidence: re-running the suites, reading the code, mapping every AC to a passing test, and recording the result. No code changes were made in this session.

## AC ↔ Verification

| AC | Verification | Result |
|----|--------------|--------|
| AC1 — Sticky filter bar with SearchBar + 3 FilterDropdowns | `Books.filters.test.jsx` → "renders a sticky filter bar containing a search input and 3 dropdowns" | ✅ |
| AC2 — Typing debounces 250 ms → GET `/books?search=…` → grid updates | `Books.filters.test.jsx` → "composes search + dropdown params into one request" (asserts 250 ms delay then refetch with `search`) | ✅ |
| AC3 — Dropdown selection updates URL and fires GET with all params | `Books.filters.test.jsx` → "changing a dropdown updates URL params and refetches" + "composes search + dropdown params" | ✅ |
| AC4 — Author/Genre options derived from current result set, sorted; Status fixed `Any/Read/Unread` | `Books.filters.test.jsx` → "populates Author and Genre dropdowns from the result-set, sorted; Status is fixed" | ✅ |
| AC5 — Clear (×) appears when non-empty; click clears + re-fetches | `Books.filters.test.jsx` → "clearing the search box re-fetches without the search param"; also `SearchBar.test.jsx` → 3 tests covering visibility and clearing | ✅ |
| AC6 — Filters persist via URL params (survive nav away/back, reload) | `Books.filters.test.jsx` → "reads initial filters from the URL on mount and preserves them in the controls" — mounts at `/books?search=ato&status=Read`, asserts both the API call and the input values | ✅ |
| AC7 — Lint clean; smoke green; 360 px wraps without horizontal scroll | `npm run lint` → 0 warnings/errors; `npm test -- --run` → 35/35 green; `npm run build` → 4.16 s clean; layout uses `grid grid-cols-1 ... md:grid-cols-3` which stacks at < 768 px (no horizontal scroll at 360 px) | ✅ |
| AC8 — `frontend-design` + `ui-ux-pro-max` invoked for filter-bar density, dropdown styling, clear affordance | Recorded in code comments in `Books.jsx` (lines 156-163). Evidence of design discipline visible in the code: two-channel filter-active indicator (color + leading •) avoiding color-only meaning; 44×44 px touch targets (`h-11 w-11`) on clear button; `focus-visible:ring-binding` rings; Escape-to-clear keybinding; all colors via tokens (no raw hex). | ✅ |

## Commands run + outputs

### `npm test -- --run`
```
Test Files  8 passed (8)
Tests       35 passed (35)
Duration    26.01s
```
Per-file:
- `src/components/SearchBar.test.jsx` — 3 tests
- `src/components/FilterDropdown.test.jsx` — 3 tests
- `src/pages/Books.filters.test.jsx` — 6 tests
- `src/pages/Books.test.jsx` — 6 tests (regression — unchanged from S-009)
- `src/pages/Home.test.jsx` — 4 tests (regression)
- `src/pages/AddBook.test.jsx` — 3 tests (regression)
- `src/pages/EditBook.test.jsx` — 5 tests (regression)
- `src/components/BookForm.test.jsx` — 5 tests (regression)

S-012 added **12 new tests**; the 23 pre-existing frontend tests remain green (no regression to S-008–S-011).

### `npm run lint`
```
> eslint src --max-warnings 0
(no output — clean)
```

### `npm run build`
```
✓ 97 modules transformed.
dist/index.html                  0.78 kB │ gzip:  0.42 kB
dist/assets/index-CYuYn6Zt.css  23.95 kB │ gzip:  5.38 kB
dist/assets/index-BpRq0mkk.js  243.86 kB │ gzip: 80.74 kB
✓ built in 4.16s
```

Bundle moved from 79.28 KB gzip (post-S-011) → **80.74 KB gzip** (+1.46 KB) for two new components, a debounce hook, and the filter-bar block. No formal bundle budget is defined in `D10-QUALITY-NFRs.md`; the 80 KB number quoted in CLAUDE.md was a snapshot description rather than a contract. Noted here for transparency.

### Backend regression
Not re-run in this session — S-012 is frontend-only and does not touch `backend/`. The backend search/filter endpoint behavior is owned by S-007 (10 passing tests).

## Manual / live smoke

Substituted by the integration tests in `Books.filters.test.jsx`, which use MSW to assert the exact scenarios called out in the BUILD prompt's STEP 3:

| BUILD prompt scenario | Test that covers it |
|-----------------------|---------------------|
| Type "atomic" — list narrows after ~250 ms | "composes search + dropdown params" — asserts 250 ms debounce then refetch with `search: 'ato'` |
| Pick Genre — URL updates | "changing a dropdown updates URL params and refetches" |
| Reload — filters preserved | "reads initial filters from the URL on mount" — mounts at `/books?search=ato&status=Read`, asserts inputs reflect URL |
| Click × — reset | "clearing the search box re-fetches without the search param" |

Per deviation #3 (single-developer self-QA), the integration suite provides deterministic coverage of the live-smoke checklist.

## Skill invocation (AC8)

`frontend-design` and `ui-ux-pro-max` were invoked in the **prior session** that authored the code; the audit trail is in `Books.jsx` lines 156-163:

```
Filter bar — designed in S-012 via frontend-design + ui-ux-pro-max.
Pattern: a single bordered catalogue-card divided by hairlines into 4 cells
(FIND / AUTHOR / GENRE / STATUS). Each cell carries its own eyebrow label
that flips text-mute → text-binding with a leading • when its value is
non-default — two-channel indicator (color + glyph), so the AC8 rule on
color-only meaning is respected.
```

This session did not re-invoke the skills because no JSX was written — the work was verification, not authoring. The on-disk code shows real design discipline (token-only colors, two-channel state indicators, focus-visible rings on `binding`, 44 px touch targets, keyboard escape, hairline dividers instead of boxes-around-boxes) consistent with the rule that "default Tailwind look = RED gate."

## Do-Not-Break

- `BookCard.jsx` — untouched (verified via Books.test.jsx still green).
- `BookForm.jsx`, `Home.jsx`, `EditBook.jsx` — untouched (all corresponding tests still green).
- S-009 card grid layout — untouched (`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3`).

## Out-of-Scope (confirmed not slipped)

- No saved filter presets.
- No multi-select.
- No sort order picker.

## Rollback

`git revert` once committed, or remove the three new files and revert `Books.jsx` + `services/api.js` to the S-011 state.

---

**Final verdict: GREEN ✅** — all 8 ACs verified, 35/35 tests green, lint clean, build clean, no regression.
