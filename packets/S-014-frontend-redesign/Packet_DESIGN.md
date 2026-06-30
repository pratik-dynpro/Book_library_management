# Packet S-014 — DESIGN

> **Stage:** DESIGN
> **Reads:** `Packet_BRD.md`, `docs/superpowers/specs/2026-06-29-frontend-redesign-design.md`, `docs/product/D9-DESIGN-SPEC.md`
> **Writes to:** the files listed in §1

---

## 1. Files in / out

### Modify

| File                                                                | What changes                                                                                                                                               |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `frontend/index.html`                                                | `<link>` to Google Fonts replaced (Newsreader + DM Sans → Tinos + Poppins).                                                                                |
| `frontend/src/design/tokens.js`                                      | `palette` block replaced; `type` block replaced; `spineColors` array and `spineColorFor` helper deleted. `scale` and `motion` unchanged.                  |
| `frontend/tailwind.config.js`                                        | `colors` block: `accent` block added, `binding`/`gilt`/`moss` removed, `warning` added.                                                                    |
| `frontend/src/index.css`                                             | Delete `.shelf`, `.spine`, `.spine::after`, `.spine::before`, `.spine[data-status='…']…`, `.spine:hover`, `.spine-title`, `.empty-shelf`, `.empty-shelf .ghost-spine` rules and the `prefers-reduced-motion` rule that scopes `.spine`. Update `:focus-visible` to ring on `accent` (not `binding`); update `::selection` to use `accent/15` (not `binding/15`); rename `bg-binding` / `hover:bg-binding-hover` in `.btn-primary` to `bg-accent` / `hover:bg-accent-hover`. |
| `frontend/src/components/BookCard.jsx`                               | Rewritten per spec §6.2. `StatusBadge` deleted, stripe deleted, sr-only status text added, 2-px left border driven by `book.status`.                       |
| `frontend/src/components/BookForm.jsx`                               | **Sweep only.** `text-binding` (line 18) → `text-accent`. `focus-visible:ring-binding` (line 107) → `focus-visible:ring-accent`. `accent-binding` (lines 187, 198) → `accent-accent`. No other edits.                                                            |
| `frontend/src/components/ConfirmModal.jsx`                           | **Sweep only.** `bg-binding text-page hover:bg-binding-hover` (line 105) → `bg-accent text-page hover:bg-accent-hover`. No other edits.                  |
| `frontend/src/components/FilterDropdown.jsx`                         | **Sweep only.** `text-binding` (line 14) → `text-accent`. No other edits.                                                                                  |
| `frontend/src/components/Navbar.jsx`                                 | **Sweep only.** `after:bg-binding` (line 5) → `after:bg-accent`. `text-binding` (line 15) → `text-accent`. No other edits.                                |
| `frontend/src/components/SearchBar.jsx`                              | **Sweep only.** `focus-visible:ring-binding` (line 68) → `focus-visible:ring-accent`. No other edits.                                                       |
| `frontend/src/components/ToastProvider.jsx`                          | **Sweep only.** `border-moss/40 bg-moss text-page` (line 73) → `border-success/40 bg-success text-page`. No other edits.                                  |
| `frontend/src/pages/Books.jsx`                                       | **Sweep only.** `text-binding` (line 172) → `text-accent`. Filter-bar code comment text on line 160 also updated for accuracy. No other edits.            |
| `frontend/src/pages/Home.jsx`                                        | Rewritten per spec §6.3. Spine shelf, library-card aside, four-card stats grid removed. New inline `<StatsBlock>` sub-component renders three big metrics + reads-by-genre bar chart. `text-binding` references replaced with `text-accent`. |
| `frontend/src/pages/Home.test.jsx`                                   | The two assertions on removed structures (`/by the numbers/i`, `'Books on the shelf'` role list on Home) are rewritten to target the new stats block + bar chart. The hero test and the 360-px-no-horizontal-scroll test are unchanged in spirit; selectors updated only if needed. |
| `docs/product/D9-DESIGN-SPEC.md`                                     | Supersession banner added at the top — one paragraph, no other edits.                                                                                       |

**`accent-binding` note:** Tailwind's `accent-<color>` utility (line 187/198 of `BookForm.jsx`) styles native `<input type="radio">`/`checkbox` accent. The Tailwind class **`accent-accent`** is grammatically valid (the `accent-` prefix is the utility namespace; the `accent` colour key is the value) and resolves to `accent-color: #4F46E5`. We use it as-is rather than introducing an alias, since renaming the colour key would ripple wider.

### Create

- `packets/S-014-frontend-redesign/Evidence.md` — populated after execution.

### Do not touch

- Any `*.py` file.
- `frontend/package.json`, `frontend/vite.config.js`, `frontend/eslint.config.js`, `frontend/postcss.config.js`, `frontend/.prettierrc`.
- `frontend/src/main.jsx`, `frontend/src/App.jsx`, `frontend/src/services/api.js`.
- `frontend/src/components/FormSkeleton.jsx` (no `binding`/`gilt`/`moss` references — independent).
- `frontend/src/pages/AddBook.jsx`, `EditBook.jsx` (no `binding`/`gilt`/`moss` references — independent).
- Any test file other than `Home.test.jsx`.
- The MSW setup in `frontend/src/test/`.

## 2. AC ↔ code map

| AC    | Files                                                                                              |
| ----- | -------------------------------------------------------------------------------------------------- |
| AC-1  | `frontend/index.html` (lines 9–12)                                                                  |
| AC-2  | `frontend/src/design/tokens.js` (lines 12–30, 67–82)                                                |
| AC-3  | `frontend/src/design/tokens.js` (lines 32–36)                                                       |
| AC-4  | `frontend/tailwind.config.js` (lines 8–23)                                                          |
| AC-5  | `frontend/src/index.css` (lines 14, 18, 48–161)                                                     |
| AC-6  | `frontend/src/components/BookCard.jsx` (whole file)                                                  |
| AC-7  | `frontend/src/pages/Home.jsx` (whole file)                                                          |
| AC-8  | `frontend/src/pages/Home.jsx` (`StatsBlock` sub-component)                                          |
| AC-9  | All `frontend/src/**/*.test.jsx` (only `Home.test.jsx` is modified)                                 |
| AC-10 | All `frontend/src/**/*.{js,jsx}` (lint pass)                                                        |
| AC-11 | `frontend/dist/` build output                                                                       |
| AC-12 | All `frontend/src/**/*.jsx` (grep gate)                                                             |
| AC-13 | Browser at `http://localhost:5173`                                                                  |

## 3. Build order (concise — full bite-sized plan is in `BUILD_prompt.md`)

The order minimizes the time the working tree is in a broken state.

1. **Fonts** — `index.html`. Visible diff but no behavior impact.
2. **Tokens** — `tokens.js`. Palette + type replaced; `spineColors` + `spineColorFor` deleted. (No tests run yet — Tailwind keys still reference removed properties via `palette.binding`/`palette.moss` until step 3.)
3. **Tailwind config** — `tailwind.config.js`. Add `accent` block + `warning`, remove `binding`/`gilt`/`moss`. **At this point every `bg-binding`/`text-binding`/`ring-binding`/`bg-moss`/`border-moss` becomes an unknown utility — but Tailwind v3 silently emits no class for unknown utilities, so the dev server still boots. The visual will look broken (no styling on those elements) until step 4 sweeps them.**
4. **Class-name sweep** — `BookForm.jsx`, `ConfirmModal.jsx`, `FilterDropdown.jsx`, `Navbar.jsx`, `SearchBar.jsx`, `ToastProvider.jsx`, `Books.jsx`. Mechanical class renames. Quick to verify with `grep`.
5. **CSS cleanup + utility rename** — `index.css`. Delete shelf/spine rules; rename `bg-binding` → `bg-accent` in `.btn-primary`; rename `ring-binding` → `ring-accent` in focus-visible; rename `bg-binding/15` → `bg-accent/15` in ::selection.
6. **Tests for new Home structure (TDD red)** — update `Home.test.jsx` to assert on the new stats block. Run vitest; expect the two new/edited tests to fail (red) because `Home.jsx` still has the old structure.
7. **`BookCard.jsx` rewrite** — drop stripe + StatusBadge + spineColorFor; add 2-px border + sr-only.
8. **`Home.jsx` rewrite** — drop spine shelf + library aside + 4-card grid; add `<StatsBlock>` with bar chart.
9. **Verify** — `npm test -- --run` (35 green), `npm run lint` (clean), `npm run build` (clean).
10. **Doc note** — D9 supersession banner.
11. **Evidence** — fill `Evidence.md`.

## 4. Rollback

Single commit (or single feature branch). Either:

- **Pre-merge:** delete the branch. Working tree returns to `33c004c`.
- **Post-merge:** `git revert <merge-commit>`. No state, no schema, no data — clean revert.

Re-running the existing pytest suite and the unchanged frontend tests confirms a clean rollback.

## 5. Design-system rules in force during BUILD

- **No raw hex in JSX.** Every color references a Tailwind class derived from `tokens.js`.
- **Mandatory skill invocations before any JSX edit:** `frontend-design` AND `ui-ux-pro-max` (CLAUDE.md hard rule). The BUILD prompt enforces this with a STEP 0 gate.
- **Two-channel a11y** for any status-by-color: pair color with text/glyph. Applies to the new BookCard left border.
- **WCAG AA contrast** holds: ink-on-page 16.7:1 (AAA), white-on-accent 7.4:1 (AAA large / AA body), white-on-danger 4.5:1 (AA), mute-on-page 5.0:1 (AA). Numbers come from the spec §8.
- **Type scale unchanged** — same sizes / line-heights / tracking; only the family changes.

## 6. Open questions

None. The three brainstorming open questions were resolved on 2026-06-30:

1. Tinos weight — **700** for all display tokens (real shipped weight; no synthetic bold).
2. Packetize — **yes, as S-014** (this packet).
3. D9 — **supersede** with a banner, do not rewrite.

---

**End of DESIGN.**
