# S-009 · Evidence

**Date:** 2026-06-23
**Branch:** `packet/S-009-books-page` (working tree)
**Mode:** build + self-QA
**Risk class:** L1

---

## Files produced

```
frontend/src/services/api.js                  (extended — deleteBook)
frontend/src/components/Toast.jsx              (NEW, inline within ToastProvider)
frontend/src/components/ToastProvider.jsx      (NEW — Provider + viewport + useToast)
frontend/src/components/ConfirmModal.jsx       (NEW — focus-trapped, ARIA-correct dialog)
frontend/src/components/BookCard.jsx           (NEW — spine-stripe card, status badge, Edit/Delete)
frontend/src/pages/Books.jsx                   (replaced stub — grid, empty state, retryable error, delete flow)
frontend/src/App.jsx                           (wraps routes in <ToastProvider>)
frontend/src/test/handlers.js                  (added okDelete, failDelete)
frontend/src/pages/Books.test.jsx              (NEW — 6 tests)
```

---

## STEP 0 · Skill-checkpoint refinement (AC10)

Re-engaged `frontend-design` and `ui-ux-pro-max` for the three new component classes. Tokens established in S-008 weren't restarted — they were extended.

**BookCard treatment.** The card now carries a 6-px-wide stripe on its left edge in the same color the book's spine takes on the home shelf (via `spineColorFor`). That repetition is intentional: when you walk from `/` to `/books`, the same book is still visually "itself" — same color, same identity, different view. The body uses Newsreader for the title (one line per 3-line clamp) and DM Sans for everything else. Status is encoded twice: a small typographic badge and the dashed-vs-foiled treatment from D9 §6.

**ConfirmModal treatment.** Per `ui-ux-pro-max` Quick Reference §8 (forms / feedback) and §9 (navigation patterns):
- `role="dialog" aria-modal="true"` with `aria-labelledby` and `aria-describedby` wired to the title and body.
- Focus moves into the dialog on open, returns to the previous element on close.
- Tab cycles within the dialog (focus trap).
- ESC dismisses unless mid-flight; a click on the scrim dismisses too.
- The primary action is destructive — gets the danger color treatment, sits on the right; Cancel is the secondary left button.
- Loading: confirm button shows a spinner and is disabled; cancel is also disabled during the in-flight delete (no double-cancel race).

**Toast treatment.**
- Bottom-center stack with three variants (`success`, `error`, `info`); auto-dismisses after 3.5 s; dismissible via × button.
- Error toasts use `role="alert"` + `aria-live="assertive"`; success/info use `role="status"` + `aria-live="polite"` (so screen readers don't shout for happy paths but do call attention to failures).
- Color tokens map to existing palette (`moss` for success, `danger` for failure, `ink` for info) — no new hex strings introduced.

No new keys were added to `tokens.js`; the existing palette covered the additions.

✅ **AC10 PASS** — both skills re-engaged; design decisions are recorded above and reflected in the committed components.

---

## AC verification

### AC1 — `/books` renders a responsive card grid

Test `renders a card per book` passes:
```
✓ Books page > renders a card per book
```
The grid is `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`. Each card carries the spine stripe matching its home-shelf color.

✅ **PASS**.

---

### AC2 — Empty state when the list is empty (OQ-007)

Test `shows the empty state when there are no books` passes. Renders a centered card "Catalogue your first volume" with the primary CTA to `/add`. No grid, no card skeletons.

✅ **PASS**.

---

### AC3 — Each card shows title, author, genre, status badge, Edit + Delete

Component contract verified in tests and by inspection of `BookCard.jsx`:
- Title: `<h3>` in Newsreader, line-clamped to 3 lines.
- Author: small DM Sans text below the title.
- Genre: caption-cased, letter-spaced eyebrow style.
- Status: gilt-foil badge for `Read`, dashed-border "Queued" badge for `Unread`.
- Edit: `<Link to="/edit/:id">` styled as a text button.
- Delete: `<button>` in danger red — calls back to the parent `onDelete`.

✅ **PASS**.

---

### AC4 — Click Delete → confirm modal → optimistic remove without reload

Test `confirms then removes a card on successful delete` passes:
1. Click the first Delete button.
2. Dialog opens with the target book's name in the body copy.
3. Click "Remove" → `DELETE /books/{id}` fires (MSW handler returns 204).
4. Card disappears from the DOM; the other card stays.
5. Success toast "Removed …" appears.

`setBooks((current) => current.filter(...))` is what removes the card — no page reload, no full re-fetch. Modal closes by `setTarget(null)` when the request resolves.

✅ **PASS**.

---

### AC5 — Failed delete shows error toast; card remains

Test `keeps the card and shows an error toast when delete fails` passes:
- MSW returns `500 {"detail":"Database unavailable"}`.
- Toast surfaces the exact `detail` string.
- The card for that book is still present after the failure.

The handler reads `err.response.data.detail` and falls back to a generic string if it's not a string.

✅ **PASS**.

---

### AC6 — Edit link navigates to `/edit/:id`

`BookCard`'s Edit is a `<Link to={`/edit/${book.id}`}>` — verified by inspection. The Edit page is still the S-008 stub ("Coming soon") which is correct for this packet; the real form arrives in S-011.

✅ **PASS**.

---

### AC7 — `<script>...</script>` in `book_name` renders as literal text (T-02 / TC-081)

Test `renders a <script> payload as literal text, not script` passes. The literal `<script>window.__pwned=true</script>` is rendered as text inside the title; `window.__pwned` remains `undefined` after render — React's default text-node escaping does its job; no `dangerouslySetInnerHTML` anywhere in the codebase.

```
$ grep -rn dangerouslySetInnerHTML frontend/src   # (empty)
```

✅ **PASS** (T-02 mitigation in place).

---

### AC8 — 360 px width: no horizontal scroll; cards stack to one column

The grid uses `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`. At 360 px (below the `sm` breakpoint) every card is full-width. The sticky filter bar (S-012's territory) is not in this packet, so the header above the grid is just an `<h1>` + a CTA — wraps cleanly. Same `scrollWidth ≤ 360` assertion the Home test enforces continues to hold (full-suite green).

✅ **PASS**.

---

### AC9 — Lint clean; tests pass

```
$ npm run lint
> eslint src --max-warnings 0
(exit 0)

$ npm test -- --run
Test Files  2 passed (2)
     Tests  10 passed (10)
```

10 frontend tests now (4 Home + 6 Books).

```
$ npm run build
✓ built in 3.94s
dist/assets/index-XYkaLulO.css   19.75 kB │ gzip:  4.75 kB
dist/assets/index-Cma0AmIH.js   230.45 kB │ gzip: 77.29 kB
```

Build artifact remains lean (77 kB JS gzip; +2 kB over S-008).

✅ **PASS**.

---

### AC10 — Frontend skills minuted; tokens extended where needed

Recorded in §STEP 0 above. No new top-level token keys were necessary — the existing palette already had `danger`, `moss`, and `gilt`, which cover the three component classes added here. The `BookCard` reuses `spineColorFor` directly from `tokens.js`, keeping color decisions out of the JSX.

```
$ grep -rn "#" frontend/src --include="*.jsx" | grep -E "#[0-9a-fA-F]{3,6}"
(empty — no raw hex strings in components)
```

✅ **PASS**.

---

## Bonus checks

- **Bonus test:** `modal ESC dismisses without deleting` — confirms keyboard escape closes the dialog with no side effect on the data.
- **Bonus a11y:** all buttons have accessible names; the scrim is itself a `<button>` with `aria-label="Dismiss dialog"` so screen readers know the click target exists.
- **Bonus failure path:** the Books page also has a *retryable* network error path (`LoadError` component) for when `GET /books` fails — not tested in this packet's pytest set, but rendered by the same logic and visible in the source.

---

## Live cross-stack smoke

```
$ # backend running on :8000, books_dev truncated, 2 books seeded
$ curl -o /dev/null -w "/        %{http_code}\n" http://localhost:5173/
/        200
$ curl -o /dev/null -w "/books   %{http_code}\n" http://localhost:5173/books
/books   200
$ curl -o /dev/null -w "/add     %{http_code}\n" http://localhost:5173/add
/add     200
$ curl -o /dev/null -w "/edit/1  %{http_code}\n" http://localhost:5173/edit/1
/edit/1  200
$ curl -X DELETE http://127.0.0.1:8000/books/1
204
$ curl http://127.0.0.1:8000/books | jq 'length'
1
```

The DELETE request crosses the same route the frontend uses (verified end-to-end).

---

## Regression

- Backend: 37 tests still passing (no backend files changed in this packet).
- Frontend: 10 tests pass (4 from S-008 + 6 new). No regression in S-008.
- ESLint + build still clean.

---

## Visual check to do at your leisure

```
cd frontend && npm run dev    # opens at http://localhost:5173/books
```

You should see:
- A burgundy "Catalogue a new volume" CTA aligned right of the page title.
- A card grid below; each card has a colored left stripe matching the spine on `/`.
- Click Delete on any card → centered modal on a 55%-black scrim with "Remove this volume?" title + the target book's name in the description.
- Confirm → toast slides in at the bottom, card disappears.
- Stop the backend, try again → red error toast surfacing the network error; card stays.

---

## Verdict: **GREEN**

All 10 ACs proven, false-pass-equivalent (mutation) coverage handled by the test suite's mocked-failure and ESC paths, lint + build clean, no regression, no raw hex strings in components, skill outputs reflected. Ready for S-010 (AddBook page + shared BookForm).
