# S-014 — Evidence

**Verdict:** GREEN (with one deferred AC — see Deferrals)
**Build session:** 2026-06-30 (self-QA)
**Tested against:** working tree on `main` after the redesign edits (uncommitted at time of Evidence).
**Skill gate satisfied:** `frontend-design` + `ui-ux-pro-max` both invoked before any JSX edit.

---

## ACs

| #     | Status            | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ----- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-1  | Pass              | `frontend/index.html` loads `Tinos:ital,wght@0,400;0,700;1,400` + `Poppins:wght@300;400;500;600;700`. Grep confirmed no `Newsreader`/`DM+Sans`.                                                                                                                                                                                                                                                                                              |
| AC-2  | Pass              | `tokens.js` exports the 11 required keys (page/card/ink/mute/hairline/accent/accentHover/accentSoft/danger/success/warning). `Grep "binding\|gilt\|moss\|spineColor"` over `frontend/src` returned zero matches.                                                                                                                                                                                                                                |
| AC-3  | Pass              | `type.display = '"Tinos", "Times New Roman", serif'`; `type.body = '"Poppins", system-ui, -apple-system, "Segoe UI", sans-serif'`.                                                                                                                                                                                                                                                                                                          |
| AC-4  | Pass              | `tailwind.config.js` colors block exposes `accent` (nested DEFAULT/hover/soft) and `warning`. `binding`/`gilt`/`moss` removed.                                                                                                                                                                                                                                                                                                              |
| AC-5  | Pass              | `index.css` purged of `.shelf`, `.spine`, `.spine-title`, `.empty-shelf`, `.ghost-spine`. Focus-visible and ::selection now reference `accent`. `btn-primary` now uses `bg-accent` / `hover:bg-accent-hover`. File trimmed from 161 → 46 lines.                                                                                                                                                                                                |
| AC-6  | Pass              | `BookCard.jsx` rewritten: 34 lines (was 62). Renders `border-l-2` + `border-l-accent`/`border-l-hairline` driven by `book.status`; `<span className="sr-only">` carries Read/Queued. No `StatusBadge`, no `spineColorFor`, no inline `style` for color. Public props unchanged.                                                                                                                                                              |
| AC-7  | Pass              | `Home.jsx` rewritten. `Spine`, `EmptyShelf`, `StatCard`, `spineColorFor` import all removed. Single `<StatsBlock>` sub-component renders three big metrics + reads-by-genre bar chart. The hero now sits in a single full-width column (no library-card aside).                                                                                                                                                                              |
| AC-8  | Pass              | `StatsBlock` uses `Math.max(8, (count / maxCount) * 100)` for bar widths (visible in source). `.slice(0, 6)` cap with `+ N more` overflow row. Empty-state copy `"Add a book and mark it Read to start seeing your reading patterns."` matches BRD exactly. Loading state renders `Loading library…`.                                                                                                                                       |
| AC-9  | Pass              | `cd frontend; npm test -- --run` prints `Tests  35 passed (35)`. Only `Home.test.jsx` was touched among test files.                                                                                                                                                                                                                                                                                                                          |
| AC-10 | Pass              | `cd frontend; npm run lint` exits 0 with no output (max-warnings 0).                                                                                                                                                                                                                                                                                                                                                                          |
| AC-11 | Pass              | `cd frontend; npm run build` exits 0. Output: `dist/assets/index-BDbfzzgs.js  242.58 kB │ gzip: 80.53 kB`. Baseline was 80.74 KB; delta −0.21 KB, well within ±10 KB.                                                                                                                                                                                                                                                                          |
| AC-12 | Pass              | `Grep "#[0-9a-fA-F]{3,8}"` across `frontend/src/**/*.jsx` returned zero matches.                                                                                                                                                                                                                                                                                                                                                              |
| AC-13 | **Deferred**      | Browser-rendered live smoke not yet captured. The dev server and backend boot cleanly (verified in `commands.md`); but a screenshot + click-through has not been attached. Recommended follow-up: 5-minute manual session, capture screenshots of Home, Books, Add, Edit at default and 360-px widths, attach below this row. Tests + build cover the behavioural and structural ACs; AC-13 is the pure-visual verification.                |

---

## Command transcripts (excerpted)

### Baseline (before any edits)

```
> book-library-frontend@1.0.0 test
> vitest --run

 ✓ src/pages/Home.test.jsx (4 tests)
 ✓ src/pages/Books.test.jsx (6 tests)
 ✓ src/pages/Books.filters.test.jsx (6 tests)
 ✓ src/pages/EditBook.test.jsx (5 tests)
 ✓ src/components/BookForm.test.jsx (5 tests)
 ✓ src/pages/AddBook.test.jsx (3 tests)
 ✓ src/components/SearchBar.test.jsx (3 tests)
 ✓ src/components/FilterDropdown.test.jsx (3 tests)

 Test Files  8 passed (8)
      Tests  35 passed (35)
   Duration  25.26s
```

### After all redesign edits

```
 Test Files  8 passed (8)
      Tests  35 passed (35)
   Duration  16.69s
```

### Build

```
> book-library-frontend@1.0.0 build
> vite build

vite v6.4.3 building for production...
transforming...
✓ 96 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                  0.72 kB │ gzip:  0.40 kB
dist/assets/index-CepJyabZ.css  22.16 kB │ gzip:  4.87 kB
dist/assets/index-BDbfzzgs.js  242.58 kB │ gzip: 80.53 kB
✓ built in 3.42s
```

### Lint

```
> book-library-frontend@1.0.0 lint
> eslint src --max-warnings 0
(no output)
```

---

## Self-QA disclosure

This packet was QA-ed by the same session that built it. Mitigations applied per the AI-SDLC framework:

- Each AC was re-derived from `Packet_BRD.md` independently from the build sequence.
- Test-first discipline was used for the `Home` rewrite: the test assertions were updated to target the new structure FIRST (4-test red), then `Home.jsx` was rewritten until the suite was green again. One iteration was required to disambiguate a selector that matched both the Genres metric and a bar-chart row count (both literally "2") — fixed by scoping each metric assertion to its label's parent.
- Grep gates were run for every "do-not-find" rule in the BRD: `binding`/`gilt`/`moss`, raw hex in JSX, `spineColorFor`/`StatusBadge`/`StatCard`/`Spine`/`EmptyShelf`/`Library card`/`By the numbers` — all returned zero matches.
- The two skills (`frontend-design`, `ui-ux-pro-max`) flagged that the chosen direction (slate + indigo on white) is itself a Modern-SaaS template cluster; the user explicitly picked it during brainstorming, so this is an accepted trade-off rather than a regression.

---

## Spec-level corrections recorded during BUILD

1. The original spec claimed "no other components need source modification because the colors propagate via Tailwind." That was wrong — `binding`/`gilt`/`moss` Tailwind class names are literal strings generated from the colors-block keys; when those keys go away, every `bg-binding` / `text-binding` / `ring-binding` becomes an undefined utility. The BUILD added a **sweep** across 7 unchanged components (`BookForm.jsx`, `ConfirmModal.jsx`, `FilterDropdown.jsx`, `Navbar.jsx`, `SearchBar.jsx`, `ToastProvider.jsx`, `Books.jsx`) renaming class names mechanically. No behavior or structure changed in those files. Recorded in `Packet_DESIGN.md` §1.
2. The original spec said "Home.test.jsx passes unchanged." That was also wrong — two of the four tests asserted directly on the removed structures (`/by the numbers/i` text and `role=list name=/books on the shelf/i`). The test file was updated as part of this packet (single allowed test-file modification, declared in BRD §5).

---

## Deferrals

- **AC-13 (live browser smoke)** — Tests + build cover behavior; pixel-level verification still requires a real browser pass with screenshots. Should be a 5–10 minute follow-up: start backend + frontend, open at default and 360 px widths, screenshot Home / Books / Add / Edit, append to this Evidence file. Not blocking the GREEN verdict on the structural / behavioral ACs (1–12).

---

## Tracker

- [x] `CLAUDE.md` §5 packet table updated for S-014 — done in the same commit chain as Evidence.
- [ ] `Project_Progress_Tracker.xlsx` row added for S-014 — needs manual update (Excel file; not edited in this session).
- [x] `docs/product/D9-DESIGN-SPEC.md` — supersession banner added at top.
