# Frontend redesign — Modern SaaS direction with Poppins + Tinos

**Date:** 2026-06-29
**Status:** design — awaiting user review before writing-plans
**Author:** Builder
**Supersedes (in part):** `docs/product/D9-DESIGN-SPEC.md` (color, type, and the Home/BookCard component patterns sections). All other D9 contents — accessibility, responsive breakpoints, motion, spacing scale — remain authoritative.
**Out of scope:** routing, API contracts, backend, test infrastructure, packet process changes.

---

## 1. Why

The current design (S-008 "Editorial Modernism") uses a custom warm palette (page `#F2EFE7`, binding burgundy `#7A1F2A`, gilt brass `#8B6914`) with Newsreader serif + DM Sans, plus a Home-page spine-shelf hero of colored vertical book spines and a 6 px colored stripe on every `BookCard`. The user wants a redesign toward **"Modern SaaS"** — soft white surfaces, slate ink, single indigo accent, minimal decoration — with **Poppins** for UI and **Tinos** (the metrically-identical free Google substitute for Times New Roman) for headlines. The bookish-decorative elements (spine shelf, card stripe) lose their visual rationale in that direction and need replacement.

## 2. Goals

- Re-skin every page by swapping `frontend/src/design/tokens.js` and `frontend/index.html` — no component file *needs* to change for the colors and fonts to propagate.
- Replace the two components whose decoration is intrinsic to the bookish identity (Home spine-shelf hero, BookCard left stripe).
- Preserve all routing, props, behavior, accessibility, and the 35 frontend tests without modification.
- Keep the design tokens as the single source of truth — **no raw hex strings in JSX**, same rule as before.

## 3. Non-goals

- No new pages, routes, or components.
- No changes to the backend, API service layer, or any test.
- No new third-party dependencies (chart library, animation library, icon library).
- Not removing or renaming any public prop or exported function.
- Not changing the responsive breakpoints, container widths, or spacing scale from `D9 §4`.

## 4. Decisions (recap of the brainstorming dialogue)

| # | Decision | Picked over |
|---|----------|-------------|
| D1 | Serif: **Tinos** via Google Fonts | Literal Times New Roman (system-font, Linux gaps); a different professional serif (Source Serif 4, EB Garamond) |
| D2 | Scope: **tokens + selective component tweaks** | Tokens-only; full new visual identity (packet-worthy) |
| D3 | Aesthetic direction: **Modern SaaS / Tech** | Editorial Newsroom; Quiet Corporate / Finance |
| D4 | Home hero replacement: **library stats block with bar chart** | Recent-additions card row; minimal CTA-only hero |
| D5 | BookCard status indicator: **2 px left accent bar** (indigo if Read, hairline if Unread) | Status pill top-right; leading dot before title |

## 5. Tokens

The whole spec mechanically lands in `frontend/src/design/tokens.js`. Every Tailwind color and font class downstream is generated from this file via `tailwind.config.js`. Components reference Tailwind classes only — never raw hex.

### 5.1 Palette

Keeping the existing export name (`palette`, not `colors`) — `tailwind.config.js` imports it by that name and renaming would propagate edits to a file that's out of scope.

```js
// frontend/src/design/tokens.js (replacement values; export name unchanged)
export const palette = {
  /* Surfaces */
  page:         '#F8FAFC',   // slate-50 — app background
  card:         '#FFFFFF',   // surface above background
  ink:          '#0F172A',   // slate-900 — primary text
  mute:         '#64748B',   // slate-500 — secondary text, captions
  hairline:     '#E2E8F0',   // slate-200 — borders, dividers

  /* Accent (replaces `binding`) */
  accent:       '#4F46E5',   // indigo-600 — primary CTA, Read status, focus rings
  accentHover:  '#4338CA',   // indigo-700 — hover state
  accentSoft:   '#EEF2FF',   // indigo-50 — tinted bg, chart bar track

  /* Functional */
  danger:       '#DC2626',   // red-600
  success:      '#15803D',   // emerald-700
  warning:      '#B45309',   // amber-700
};
```

Removed (no longer referenced after this change): `binding`, `bindingHover`, `bindingSoft`, `gilt`, `moss`. The `spineColors` array and `spineColorFor` function are also deleted from `tokens.js` because they're used only by the soon-to-be-deleted spine-shelf and BookCard stripe.

Added: `accentHover`, `accentSoft`, and `warning` (the last two were absent from the current tokens; both are needed by the new design).

### 5.1.1 tailwind.config.js update

The Tailwind config flattens `palette` into class-name colors. Today it has a nested `binding: { DEFAULT, hover, soft }` block; we mirror that shape for `accent` so Tailwind generates `bg-accent`, `bg-accent-hover`, `bg-accent-soft`:

```js
// frontend/tailwind.config.js — colors block (replacement)
colors: {
  page: palette.page,
  card: palette.card,
  ink: palette.ink,
  mute: palette.mute,
  hairline: palette.hairline,
  accent: {
    DEFAULT: palette.accent,
    hover:   palette.accentHover,
    soft:    palette.accentSoft,
  },
  danger:  palette.danger,
  success: palette.success,
  warning: palette.warning,
},
```

Removed entries: `binding`, `gilt`, `moss`. Added: `accent` (nested), `warning`.

### 5.2 Typography

Keeping the existing export name (`type`, not `fonts`) — same reason as §5.1.

```js
export const type = {
  display: '"Tinos", "Times New Roman", serif',
  body:    '"Poppins", system-ui, -apple-system, "Segoe UI", sans-serif',
};
```

The `scale` export and all its values (display1 64px, display2 44px, h1 32px, h2 24px, h3 18px, body 16px, small 14px, caption 12px) stay exactly as today — only the family changes. The full mapping for context:

| Token | Family | Weight | Size | Line height | Tracking | Used for |
|-------|--------|--------|------|-------------|----------|----------|
| `display-1` | display | 700 | 4rem / 64px | 1.02 | -0.02em | Home hero headline |
| `display-2` | display | 600 | 2.75rem / 44px | 1.05 | -0.01em | Stats block big numbers |
| `h1` | display | 600 | 2rem / 32px | 1.15 | — | Page H1s + final-CTA heading |
| `h2` | display | 600 | 1.5rem / 24px | 1.25 | — | Section headings, BookCard titles |
| `h3` | display | 600 | 1.125rem / 18px | 1.35 | — | Feature card titles, Roman numerals |
| `body` | body | 400 | 1rem / 16px | 1.6 | — | Default text |
| `small` | body | 400 | 0.875rem / 14px | 1.5 | — | Captions, helper, metadata |
| `caption` | body | 500 | 0.75rem / 12px | 1.4 | 0.08em | Eyebrows, labels, uppercase microcopy |

### 5.3 Google Fonts load

Replace the current Newsreader + DM Sans link in `frontend/index.html` with:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Tinos:ital,wght@0,400;0,700;1,400&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

Tinos doesn't have a 600 weight on Google Fonts (it ships 400 and 700). When tokens.js requests Tinos 600, the browser will synthetically render it from 400; that's acceptable. If we want crisper headlines, we step up to 700 — flagged as a small follow-up choice during implementation, not blocking.

### 5.4 `index.css` cleanup

Delete the following CSS classes from `frontend/src/index.css` (they exist only for the Home spine-shelf, which goes away):
- `.shelf`
- `.spine`
- `.spine-title`
- `.empty-shelf`
- `.ghost-spine`

Keep: `.eyebrow`, `.btn-primary`, `.btn-secondary`, `.container-page`, and any other utility classes. Their visual values flow from tokens, so they re-skin automatically.

## 6. Components

### 6.1 Tokens-only (no JSX changes)

These components inherit the new palette and fonts and need zero source modification. Marked as such because reviewers should NOT touch them.

- `Navbar.jsx` — logo word now renders in Tinos because `font-display` is Tinos; links Poppins-500 because `font-body` is Poppins; underlines on active link become indigo.
- `BookForm.jsx` — input borders, focus rings, error states all derive from tokens.
- `ConfirmModal.jsx` — destructive button picks up the new `danger` red; focus trap and ARIA unchanged.
- `ToastProvider.jsx` — success/error/info toasts pick up new palette tokens.
- `SearchBar.jsx` — clear-button focus ring picks up `accent` indigo.
- `FilterDropdown.jsx` — active-filter indicator (the "• Label" pattern) flips from `text-binding` to `text-accent`; the existing two-channel (color + glyph) pattern is preserved.
- Pages `AddBook.jsx`, `EditBook.jsx`, `Books.jsx` — all inherit. The filter bar's sticky catalogue-card pattern on `Books.jsx` is unchanged.

### 6.2 BookCard.jsx — JSX changes

The current card uses an absolutely-positioned 1.5-rem-wide colored stripe (`spineColorFor(book)`) plus a `StatusBadge` sub-component that renders a "Read" pill in gilt brass or a "Queued" dashed-border pill. Both decorative artifacts go away. Replace with a single 2 px functional left border driven by `book.status`.

**Before (current code shape):**

```jsx
import { spineColorFor } from '../design/tokens.js';

function StatusBadge({ status }) { /* gilt pill or dashed Queued pill */ }

export function BookCard({ book, onEdit, onDelete }) {
  const stripe = spineColorFor(`${book.author}|${book.book_name}`);
  return (
    <article className="group relative ... rounded-md border border-hairline bg-card pl-5 pr-4 py-4 ...">
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5" style={{ background: stripe }} />
      <header className="flex items-start justify-between gap-3">
        <h3 className="font-display text-h3 ...">{book.book_name}</h3>
        <StatusBadge status={book.status} />
      </header>
      <p className="mt-1 text-small text-ink/75">{book.author}</p>
      <p className="mt-2 text-caption ... text-mute">{book.genre}</p>
      <div className="mt-auto ...">
        <Link ...>Edit</Link>
        <button ...>Delete</button>
      </div>
    </article>
  );
}
```

**After:**

```jsx
export function BookCard({ book, onEdit, onDelete }) {
  const isRead = book.status === 'Read';
  return (
    <article
      className={`group relative flex h-full min-h-[180px] flex-col rounded-md border border-hairline bg-card p-5 transition-shadow hover:shadow-md border-l-2 ${
        isRead ? 'border-l-accent' : 'border-l-hairline'
      }`}
    >
      <span className="sr-only">{isRead ? 'Read' : 'Queued'}</span>
      <h3 className="font-body text-h2 font-semibold leading-snug text-ink line-clamp-3">
        {book.book_name}
      </h3>
      <p className="mt-1 text-small text-mute">{book.author}</p>
      <p className="mt-2 text-caption uppercase tracking-[0.08em] text-mute">{book.genre}</p>
      <div className="mt-auto flex items-center justify-end gap-4 pt-4">
        <Link to={`/edit/${book.id}`} className="text-small text-mute transition-colors hover:text-accent" onClick={onEdit}>
          Edit
        </Link>
        <button type="button" onClick={() => onDelete?.(book)} className="text-small font-medium text-danger transition-colors hover:underline">
          Delete
        </button>
      </div>
    </article>
  );
}
```

Key points:
- The absolute-positioned `<span>` stripe is gone; replaced by a Tailwind border (`border-l-2 border-l-accent` / `border-l-hairline`).
- The `StatusBadge` sub-component is deleted entirely.
- A `<span className="sr-only">` carries status text for screen readers — preserves the two-channel pattern (visual border + text content) and avoids the color-only-meaning a11y regression.
- Title moves from `font-display text-h3` (Newsreader 18 px) to `font-body text-h2 font-semibold` (Poppins-600 24 px). This is the per-user-pick of "title in Poppins-600".
- `spineColorFor` import removed.
- `getSpineColor` was never a real function name — corrected to the actual `spineColorFor`.
- All public props (`book`, `onEdit`, `onDelete`) unchanged. The existing `Books.test.jsx` and `Books.filters.test.jsx` queries (`screen.findByText('Atomic Habits')`) keep working.

### 6.3 Home.jsx — JSX changes

The current Home has **five** distinct sections, not three: Hero (with a "library card" stats-aside on the right), Shelf (the spine-shelf signature), Stats grid (four count cards), Features (I–IV), Final CTA card. The redesign consolidates duplicated stats and removes decoration. The final structure is **four sections**:

1. Hero — drop the library-card aside; typography swap.
2. Stats block — new; replaces both the spine-shelf AND the four-card stats grid (they showed the same numbers redundantly).
3. Features I–IV — typography swap; `text-binding` Roman numerals become `text-accent`.
4. Final CTA card — typography swap; primary CTA inherits the new indigo via the `.btn-primary` utility class.

#### Hero — drop the aside, typography swap

Today's hero is a 12-column grid: 8 cols of heading/sub/CTAs on the left, 4 cols of "Library card · No. 001" with a `<dl>` of stats on the right. The aside is removed because its four stats (Volumes / Read / Queued / Genres) now live in the new stats block immediately below.

Resulting hero is a single full-width column:

```
Eyebrow:  "A personal library"
Display:  "Every book you own, [newline] <em>on one quiet shelf.</em>"
          h1 = display-1 size, Tinos 600 for the first half + Tinos italic 400 for the <em>
          Note: italic <em> stays text-ink (not text-accent) to avoid creating
          a focal point that competes with the indigo CTA
Sub:      Unchanged copy. Poppins-400, text-ink/75.
CTAs:     [ Catalogue a new volume ] (btn-primary)  [ View the shelf ] (btn-secondary)
```

#### Stats block — replaces spine-shelf AND the four-card stats grid

A single `bg-card` card with `border border-hairline rounded-lg p-8 md:p-10`. Two rows:

**Row 1 — three big metrics, evenly spaced (grid 3 cols on md+, stack on mobile):**

| Metric | Source | Format |
|--------|--------|--------|
| Total volumes | `books.length` | Whole number, `font-display text-display-2 leading-none tabular-nums` |
| % read | `total === 0 ? 0 : Math.round(read / total * 100)` | `"NN%"`, same style |
| Distinct genres | `new Set(books.map(b => b.genre).filter(Boolean)).size` | Whole number, same style |

Beneath each number, a Poppins-caption label (uppercase: `volumes`, `read`, `genres`).

**Row 2 — reads-by-genre bar chart:**

- Section heading: a small Poppins-500 caption, `text-mute`, uppercase: `"Reads by genre"`. Separated from row 1 by `mt-8 pt-8 border-t border-hairline`.
- For each genre present in the data (filtered to status === 'Read'), in descending count order: a row with the genre label (Poppins-400, fixed width, e.g. `w-28`) and a horizontal bar.
- Bar implementation: a parent div `bg-accent-soft` at fixed height (8 px, `h-2`), with a child div `bg-accent` whose width is computed as `Math.max(8, (count / maxCount) * 100)` percent. The `Math.max(8, …)` floor guarantees a 1-of-20 bar is still a visible sliver — addresses the lopsided-data risk in §10. Pure CSS, no chart library.
- Trailing count number (Poppins-500, `text-mute small`) to the right of each bar.
- Limit display to top 6 genres; if more exist, last row is `"+ N more"` in `text-mute small`.
- Empty case (`total === 0` or zero reads): the chart section renders a single muted line: `"Add a book and mark it Read to start seeing your reading patterns."`

**Loading state:** while `books === null` (the initial fetch is in flight), render the same stats block scaffolding with `—` placeholders for the three numbers and a `text-mute small` line "Loading library…" where the bar chart goes. No skeleton shimmer required.

**Error state:** when `getBooks` fails, the existing inline error message (`Could not reach the library.`) renders below the stats block, in `text-danger small`. Same copy as today.

**Data flow:** Home already calls `GET /books` once on mount. The same `books` array feeds the new stats block. No new endpoint, no new state, no new hooks. The existing `useMemo`'d `stats` object adds two more fields (`readByGenre`, `topGenres`) computed off the same array.

#### Features I–IV — typography swap + accent-color tweak

Same four cards, same copy ("Catalogue with care", "Find a volume in a beat", "Browse your shelf", "Track the read pile"). Two visual changes:
- `<p className="font-display text-h3 text-binding">{f.eyebrow}</p>` → `text-accent` (the Roman numerals).
- Card body typography flows from the new tokens automatically.

#### Final CTA — typography swap

Unchanged structure; the `btn-primary` button reads indigo via the new token.

#### What gets deleted from Home.jsx

- The `<Spine>` and `<EmptyShelf>` sub-components and the entire "The shelf — signature element" block (lines roughly 148–180 in the current file).
- The "Library card · No. 001" `<aside>` inside the hero (and the 12-column grid wrapper that positioned it).
- The "By the numbers" / `<StatCard>` four-card grid section.
- The `import { spineColorFor } from '../design/tokens.js'` line.
- The `Spine`, `EmptyShelf`, and `StatCard` function declarations.

#### What is added to Home.jsx

- A `<StatsBlock>` sub-component (declared inline in `Home.jsx`, not a separate file — same locality pattern as `StatCard` today) that takes `books` as a prop and renders the two-row card. Keeping it inline because it has zero reuse value outside Home.

## 7. Data and state

- No new state, no new fetches, no new endpoints.
- The Home page continues to call `GET /books` once on mount.
- The stats block derives every number client-side via plain JS (no `useMemo` needed — the dataset is tiny).
- The BookCard receives the same `book` prop it does today and reads `book.status` to decide the left-border color.

## 8. Testing

The 35 existing frontend tests assert on **text and behavior**, not pixel colors. Concrete grep of what tests look for:

- `Home.test.jsx` — asserts the hero text and the existence of CTA buttons; passes unchanged.
- `Books.test.jsx` / `Books.filters.test.jsx` — assert on book titles, filter behavior, delete confirmation; passes unchanged.
- `AddBook.test.jsx` / `EditBook.test.jsx` — assert on form submission and toast outcomes; passes unchanged.
- `BookForm.test.jsx` — asserts on field rendering and onSubmit calls; passes unchanged.
- `SearchBar.test.jsx` / `FilterDropdown.test.jsx` — assert on debounce, clear button, options; passes unchanged.

**No new tests are added** by this redesign — there are no new behaviors to verify. The bar chart's bar widths are presentational and out of scope for unit testing in v1. If the spec drifts and behavior changes during implementation, the implementer should add tests then.

**Manual verification** during implementation:
- Boot frontend + backend, add five books across three genres with mixed read/unread status.
- Visit `/` — confirm hero typography, stats block numbers, bar chart proportions, features list typography.
- Visit `/books` — confirm BookCards show the 2 px left border (indigo for Read, hairline for Unread), filter bar reads SaaS-clean, delete confirmation toast picks up new colors.
- Visit `/add` and `/edit/:id` — confirm form inputs, focus rings, primary CTA all read indigo.
- Resize to 360 px width — confirm nothing breaks; stats block stacks gracefully; bar chart legible.
- Lighthouse contrast check on the new palette (ink on page, accent on white, danger on white, accent-soft on white) — all must clear WCAG AA 4.5:1 for body text and 3:1 for large text. Numbers from the brainstorming dialogue:
  - `#0F172A` on `#F8FAFC`: 16.7:1 (AAA)
  - `#FFFFFF` on `#4F46E5`: 7.4:1 (AAA for large text, AA for body)
  - `#FFFFFF` on `#DC2626`: 4.5:1 (AA borderline — verify in browser)
  - `#64748B` on `#F8FAFC`: 5.0:1 (AA)

## 9. Accessibility

- Focus rings move from `binding` to `accent` everywhere — same width (`ring-2`), same offset. `focus-visible:` selector unchanged.
- Read-status is now communicated by both **color** (left border indigo vs hairline) and the existing **text** content of cards. Same two-channel pattern as the filter bar's "• Label" indicator, so we don't regress on the color-only-meaning rule from D9 §accessibility.
- All ARIA attributes, modal focus trap, and screen-reader-only labels remain unchanged because no JSX in the relevant components changes.

## 10. Risks and trade-offs

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Tinos 600 falls back to synthetic-bold on browsers that can't synthesize | Low | Visually verify during implementation; switch to weight 700 if it reads thin or muddy |
| Bar chart widths look wrong with very lopsided data (e.g., 95% one genre) | Medium | Use `max(count/maxCount * 100, 8)%` so a 1-of-20 bar still shows a visible sliver |
| Removing the spine-shelf removes the app's most distinctive visual element — Home reads "generic SaaS" | Acknowledged trade-off | The user picked Modern SaaS direction explicitly; this is the expected outcome, not a regression |
| The 2 px left border on the card might be invisible on high-density displays | Low | If reviewers find it too thin in implementation, bump to 3 px; tokens-only change |
| Existing CLAUDE.md frontend rule says "frontend-design + ui-ux-pro-max MUST be invoked before any JSX" | Applies | Implementation session must invoke both skills before authoring `BookCard.jsx` or `Home.jsx` changes |

## 11. Rollback

Two paths:
- **Branch-level:** the change ships on a feature branch (e.g., `redesign/saas-poppins-tinos`). Don't merge until visually approved. Easy revert: delete the branch.
- **Post-merge:** `git revert <merge-commit>` undoes `tokens.js`, `tailwind.config.js`, `index.html`, `index.css`, `BookCard.jsx`, and `Home.jsx` in a single commit. No data, no state, no schema is touched, so the revert is clean.

## 12. Open questions

- **Q1 — Tinos weight 600 vs 700 for headlines.** Resolve during implementation by looking at the rendered hero. Default to 600 with a `font-display` fallback chain.
- **Q2 — Should the redesign be packaged as a packet (`S-014`) with BRD/DESIGN/Evidence?** It would be the most consistent thing to do given the AI-SDLC process the rest of the project follows. The user picked "tokens + selective component tweaks" scope, which is borderline — bigger than a typical bugfix, smaller than a feature. Recommendation: yes, packetize it as `S-014-frontend-redesign` so it gets the same gate treatment. Confirm with user before the implementation plan is drafted.
- **Q3 — Does the `D9-DESIGN-SPEC.md` document need to be rewritten to reflect the new direction, or should this spec just supersede the relevant sections?** Lighter touch: this spec supersedes color/type/Home/BookCard sections of D9; everything else (accessibility, breakpoints, motion) remains authoritative. Heavier touch: rewrite D9 §3 and §6 inline. Default: lighter touch, noted in the spec header.

## 13. Implementation roadmap (high level — full plan comes from writing-plans)

Approximate order, all on one feature branch:

1. Update `frontend/index.html` Google Fonts `<link>` to Tinos + Poppins.
2. Update `frontend/src/design/tokens.js` (`palette` block, `type` block, remove `spineColors` array + `spineColorFor` helper).
3. Update `frontend/tailwind.config.js` (flatten `accent` block, drop `binding` / `gilt` / `moss`, add `warning`).
4. Delete `.shelf`, `.spine`, `.spine-title`, `.empty-shelf`, `.ghost-spine` rules from `frontend/src/index.css`.
5. Update `frontend/src/components/BookCard.jsx` (remove stripe + `StatusBadge`, add 2 px status-driven border, add sr-only status text, drop `spineColorFor` import).
6. Update `frontend/src/pages/Home.jsx` (delete spine-shelf, library-card aside, four-card stats grid; add the new `<StatsBlock>` sub-component; swap `text-binding` to `text-accent` in features section).
7. Run `npm test -- --run` — expect 35/35 still green.
8. Run `npm run lint` — expect clean.
9. Run `npm run build` — expect clean; bundle size +/- a few KB.
10. Manual verification per §8.
11. If packetized (Q2), author `packets/S-014-frontend-redesign/Evidence.md` and update the tracker.

---

**End of spec.**
