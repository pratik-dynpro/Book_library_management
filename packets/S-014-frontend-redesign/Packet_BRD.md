# Packet S-014 — Frontend redesign (Modern SaaS direction)

> **Stage:** BRD
> **Owner:** Builder
> **Date:** 2026-06-30
> **Supersedes (in part):** `docs/product/D9-DESIGN-SPEC.md` — §3 Color, §3 Typography, §6 Home, §6 BookCard sections are replaced by `docs/superpowers/specs/2026-06-29-frontend-redesign-design.md` and this packet.

---

## 1. What this packet does

Re-skin the frontend to a **Modern SaaS / Tech** direction. Concretely:

- Swap fonts: **Tinos** (display, serif) + **Poppins** (body, sans). Both via Google Fonts.
- Swap palette to slate ink + indigo accent on soft-white surfaces. Burgundy / gilt / moss are removed.
- Delete the Home page **book-spine shelf** signature element and the **library-card aside** in the hero. Replace both with a single stats block containing three big metrics and a CSS-only horizontal bar chart of reads-by-genre. The existing duplicate four-card stats grid is consolidated into the same block.
- Replace the `BookCard` 6-px decorative left stripe and `StatusBadge` pill with a **2-px functional left border** (indigo if Read, hairline if Unread) and a `sr-only` text node that preserves the two-channel a11y pattern.
- **Sweep Tailwind class renames across the rest of the frontend:** `binding` → `accent`, `binding-hover` → `accent-hover`, `binding/<x>` → `accent/<x>`, `moss` → `success`. The original design spec's claim that other components "need zero source modification" was wrong — `text-binding` / `bg-binding` / `ring-binding` / `bg-moss` / `border-moss` appear in **7 components and pages** outside Home and BookCard. When the Tailwind config drops `binding` (AC-4) those become undefined utilities and the build fails. The sweep replaces every literal occurrence with the new key. Files affected by the sweep: `BookForm.jsx`, `ConfirmModal.jsx`, `FilterDropdown.jsx`, `Navbar.jsx`, `SearchBar.jsx`, `ToastProvider.jsx`, `Books.jsx`. **The sweep does NOT alter behavior, structure, or any test.**
- Update `Home.test.jsx` so the removed structures (the "By the numbers" section, the `'Books on the shelf'` list on Home — the Books-page list with the same aria-label is unrelated and stays) are no longer asserted; replace with assertions on the new stats block and bar chart.

All changed source files live in `frontend/`. No backend, no API, no DB, no new dependencies, no new routes.

## 2. Why

Personal-library bookish-warmth (Editorial Modernism) didn't land. The user picked a clean Modern-SaaS direction during brainstorming (2026-06-29). The full design rationale is captured in `docs/superpowers/specs/2026-06-29-frontend-redesign-design.md`. This packet executes that spec.

## 3. Binary acceptance criteria

Each AC is independently checkable. Verdicts in `Evidence.md` are `Pass` or `Fail` — no halves.

| #     | AC                                                                                                                                                                                                                       | How to verify                                                                                                          |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| AC-1  | `frontend/index.html` loads exactly **Tinos** (`0,400;0,700;1,400`) and **Poppins** (`300;400;500;600;700`) from Google Fonts. No Newsreader, no DM Sans link remains.                                                     | Grep `index.html` — must contain `Tinos` and `Poppins`, must not contain `Newsreader` or `DM+Sans`.                    |
| AC-2  | `frontend/src/design/tokens.js` `palette` exports `page='#F8FAFC'`, `card='#FFFFFF'`, `ink='#0F172A'`, `mute='#64748B'`, `hairline='#E2E8F0'`, `accent='#4F46E5'`, `accentHover='#4338CA'`, `accentSoft='#EEF2FF'`, `danger='#DC2626'`, `success='#15803D'`, `warning='#B45309'`. The keys `binding`, `bindingHover`, `bindingSoft`, `gilt`, `moss`, `spineColors`, `spineColorFor` are removed.                                                          | Read `tokens.js`; grep for removed identifiers across `frontend/src/**/*.{js,jsx}` — zero hits.                        |
| AC-3  | `frontend/src/design/tokens.js` `type` exports `display: '"Tinos", "Times New Roman", serif'` and `body: '"Poppins", system-ui, -apple-system, "Segoe UI", sans-serif'`.                                                  | Read `tokens.js`.                                                                                                       |
| AC-4  | `frontend/tailwind.config.js` exposes `accent` as a nested block (`DEFAULT`, `hover`, `soft`) and `warning` as a single value. The keys `binding`, `gilt`, `moss` are removed from the `colors` object.                   | Read `tailwind.config.js`; grep the project for `bg-binding`, `text-binding`, `bg-gilt`, `text-gilt`, `bg-moss`, `text-moss` — zero hits.            |
| AC-5  | `frontend/src/index.css` no longer contains the CSS classes `.shelf`, `.spine`, `.spine-title`, `.empty-shelf`, `.ghost-spine`. Focus ring and selection rules reference `accent`/`ink` only, not `binding`.              | Grep `index.css`.                                                                                                       |
| AC-6  | `frontend/src/components/BookCard.jsx` renders a 2-px left border driven by `book.status` (Tailwind `border-l-2` + either `border-l-accent` or `border-l-hairline`). The previous absolutely-positioned stripe `<span>` and the `StatusBadge` sub-component are deleted. A `<span className="sr-only">` carries `'Read'` or `'Queued'` text. No `spineColorFor` import remains. | Read `BookCard.jsx`; grep for `StatusBadge`, `spineColorFor` in the file — zero hits.                                  |
| AC-7  | `frontend/src/pages/Home.jsx` no longer contains the spine-shelf, the library-card aside, the four-card stats grid, the `Spine` and `EmptyShelf` and `StatCard` sub-components, or the `spineColorFor` import. The page renders a single `<StatsBlock>` containing three big metrics (total / % read / genres) and a reads-by-genre horizontal bar chart. | Read `Home.jsx`; grep for `Spine`, `EmptyShelf`, `StatCard`, `spineColorFor`, `Library card`, `By the numbers` in the file — zero hits. |
| AC-8  | Reads-by-genre bar chart: each visible bar's width is computed `Math.max(8, (count / maxCount) * 100)` percent. Top 6 genres shown; overflow rendered as `"+ N more"`. Empty state (zero books or zero reads) renders the muted line `"Add a book and mark it Read to start seeing your reading patterns."`. | Read the `StatsBlock` implementation in `Home.jsx`.                                                                    |
| AC-9  | `cd frontend && npm test -- --run` prints `Tests  35 passed (35)`. Test files modified: `Home.test.jsx` only. All other test files unchanged.                                                                              | Run the command; diff the test files.                                                                                  |
| AC-10 | `cd frontend && npm run lint` exits 0 (max-warnings 0).                                                                                                                                                                   | Run the command.                                                                                                        |
| AC-11 | `cd frontend && npm run build` exits 0; gzipped JS is within ±10 KB of the current 80.74 KB baseline.                                                                                                                     | Run the command; read the printed JS gzip size.                                                                         |
| AC-12 | No raw hex strings appear anywhere in `frontend/src/**/*.jsx`. (Strictness as of S-008: a hex literal in JSX is a RED gate.)                                                                                              | `grep -E "#[0-9a-fA-F]{3,8}" frontend/src --include="*.jsx" -r` — zero matches.                                          |
| AC-13 | The frontend dev server boots cleanly (`npm run dev`), the Home page loads, the indigo accent is visible on the hero CTA and the Read-status left-border on `BookCard`, and the bar chart renders for ≥1 genre when ≥1 book is marked Read. | Manual: start backend, start frontend, open `http://localhost:5173`. Append console/screenshot to Evidence.            |

## 4. Do-not-break

- All 7 backend routes (`POST/GET/PUT/DELETE /books`, `/books/{id}`, search, `/healthz`) — untouched by this packet.
- All 37 pytest tests — untouched and still passing on entry.
- Frontend routes (`/`, `/books`, `/add`, `/edit/:id`) — same set, same components, same props, same behavior.
- React Router config, MSW handlers, Vitest config — untouched.
- `BookCard` public props (`book`, `onEdit`, `onDelete`) — unchanged.
- All ARIA attributes, modal focus trap, keyboard navigation patterns — unchanged.
- Two-channel a11y for Read-status (color + text) — preserved via `sr-only` node.
- 360-px responsive behavior — preserved (Home test asserts `document.body.scrollWidth <= 360`).

## 5. Out of scope

- No new pages, routes, components, or hooks.
- No backend changes, no DB migrations, no API contract changes.
- No new npm dependencies (no chart library, no animation library, no icon library).
- No changes to other test files (`Books.test.jsx`, `Books.filters.test.jsx`, `AddBook.test.jsx`, `EditBook.test.jsx`, `BookForm.test.jsx`, `SearchBar.test.jsx`, `FilterDropdown.test.jsx`) — all 31 of those tests should pass without modification.
- No behavior/structure changes to swept files (`BookForm.jsx`, `ConfirmModal.jsx`, `FilterDropdown.jsx`, `Navbar.jsx`, `SearchBar.jsx`, `ToastProvider.jsx`, `Books.jsx`). Only Tailwind class names (`binding` → `accent`, `moss` → `success`) are renamed in those files.
- D9-DESIGN-SPEC.md gets a one-paragraph supersession note added at the top, nothing more.
- Tracker update is a follow-up step recorded in the Evidence file, not a packet AC.

## 6. Risks and mitigations

| Risk                                                                                                                                  | Likelihood | Mitigation                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 31 unchanged tests break because a component references a removed token (e.g., `bg-binding`).                                          | Medium     | Run `npm test -- --run` after the tokens/Tailwind change, before touching components. Fix immediately.                           |
| Bar chart looks bad with very lopsided data (e.g., 95% one genre).                                                                    | Medium     | `Math.max(8, …)` floor enforced as part of AC-8.                                                                                  |
| Tinos 600 falls back to synthetic bold in some browsers (only 400/700 are real on Google Fonts).                                       | Avoided    | Per user decision 2026-06-30, all display weights use **700**; 600 is not requested.                                              |
| ESLint flags removed but still imported symbols.                                                                                       | Low        | The lint pass (AC-10) catches anything missed.                                                                                    |
| Lighthouse contrast regression on accent-on-white.                                                                                     | Low        | Numbers verified in the spec §8: `#FFFFFF` on `#4F46E5` = 7.4:1 (AAA large / AA body). Visual sanity check during AC-13.          |

## 7. Approvals required

- User has approved the redesign direction and the three open-question answers (Tinos 700; packetize as S-014; D9 supersede note) on 2026-06-30.
- No further approval needed before BUILD.

---

**End of BRD.**
