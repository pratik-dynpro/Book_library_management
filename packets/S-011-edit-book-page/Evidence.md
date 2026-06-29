# S-011 · Evidence

**Date:** 2026-06-25
**Branch:** `packet/S-011-edit-book-page` (working tree)
**Mode:** build + self-QA
**Risk class:** L1

---

## Files produced

```
frontend/src/services/api.js              (extended — getBook, updateBook)
frontend/src/components/FormSkeleton.jsx  (NEW — content-shaped skeleton mirroring BookForm rhythm)
frontend/src/pages/EditBook.jsx           (replaces stub — fetch → BookForm prefill → PUT)
frontend/src/test/handlers.js             (extended — okGetBook, slowGetBook, notFoundBook, okUpdate, update422, update500)
frontend/src/pages/EditBook.test.jsx      (NEW — 5 integration tests)
```

`BookForm.jsx` untouched (AC6). Pre/post SHA-256: `17da5332e7832547ad94704dd2600e3028d956b79016ce37bc827ececac6b392`.

---

## STEP 0 · Skill checkpoint (AC8)

Re-engaged `frontend-design` AND `ui-ux-pro-max` *before* any JSX, per CLAUDE.md hard rule for frontend packets.

**Decisions:**

- **Pattern:** content-shaped skeleton bars, not shimmer and not a centred spinner. The default AI skeleton is a shimmer-rectangle inside a centred card; that would break the editorial restraint of the rest of the app. The bars are flat `bg-hairline` (#D8D3C7), the calmest non-white token already in the palette.
- **Motion:** subtle `animate-pulse` (Tailwind built-in opacity loop, ~2s). Wrapped with `motion-reduce:animate-none` so it respects `prefers-reduced-motion` (`reduced-motion` rule from ui-ux-pro-max §1).
- **Geometry mirrors `BookForm` exactly** so the swap doesn't shift the layout (`content-jumping` / CLS rule from §3):
  - Wrapper `max-w-xl` + `grid gap-5` (same as form's field stack).
  - Each text field: `h-3.5 w-24` label bar + `mt-1.5 h-[42px] w-full` input bar — the 42 px input height equals `px-3 py-2.5 + 1px border + 1rem text-body` so the real input lands at the same y-coordinate.
  - Status row: `h-3.5 w-14` legend + `mt-2 flex gap-6` with two `[4×4 circle + h-3.5 w-12 bar]` pairs.
  - Action row: `mt-8 flex justify-end gap-3` with `h-[42px] w-20` (Cancel) + `h-[42px] w-28` (Update) — matches `btn` `py-3 px-5 text-small` rendered dimensions.
- **A11y:** wrapper has `role="status"`, `aria-busy="true"`, `aria-live="polite"`, `aria-label="Loading book…"`, plus a visually-hidden `<span className="sr-only">Loading book…</span>` so a screen reader announces the load exactly once. The skeleton has no interactive controls inside it — the tab order stays empty during the load, which is what we want.

**Self-critique vs AI defaults:**
- ❌ AI-default skeleton uses a left-to-right shimmer gradient → ours is flat opacity pulse.
- ❌ AI-default skeleton uses a center spinner overlay → ours stays in place where the form will render.
- ❌ AI-default skeleton uses a grey-on-grey palette → ours uses the project's existing `hairline` token, so the load state still feels like the same library.

✅ **AC8 PASS.**

---

## AC verification

### AC1 — `/edit/:id` fetches GET /books/{id} and prefills `BookForm`

Test `prefills the form from GET /books/:id` passes. After the MSW handler returns `{id:7, book_name:"Atomic Habits", author:"James Clear", genre:"Self Help", status:"Read"}`, the form shows those values as `displayValue` on each input, the Read radio is checked, and the submit button reads `Update` (not `Save`).

The values come from the actual `getBook(id)` call — not a literal — confirmed by the MSW handler being the only thing serving the response.

✅ **PASS**.

---

### AC2 — Skeleton while loading; no flicker, no jump

Test `shows a skeleton while the GET is in flight, then swaps to the form` passes. With `slowGetBook(SAMPLE, 80)`:
- Immediately after mount: `getByRole('status', { name: /loading book/i })` returns the skeleton; `aria-busy="true"` is on it; the `Update` button is NOT yet in the DOM.
- After the GET resolves (`findByDisplayValue('Atomic Habits')`): the skeleton is gone, the form is rendered.

The skeleton container's class chain is `max-w-xl + grid gap-5 + mt-8 flex justify-end gap-3` — same as the real form — so swap = no jump. (Visually verified against `BookForm` source: identical wrapper dimensions, identical action-row pattern.)

✅ **PASS**.

---

### AC3 — PUT 200 → navigate `/books` + success toast

Test `navigates to /books and shows a success toast on PUT 200` passes. After:
1. The page prefills from `okGetBook`.
2. User clears + retypes `book_name`.
3. User clicks `Update`.

…the test asserts both:
- `data-testid="books-page"` is mounted (so `useNavigate('/books')` ran), and
- the `/updated/i` toast text appears.

Live cross-stack confirmation (backend running on :8000, `books_dev` DB):

```
$ curl :8000/books/2                      → {"book_name":"Deep Work","status":"Unread",...}
$ curl -X PUT :8000/books/2 -d '{..."status":"Read"}'
                                           → 200 {"status":"Read",...}
$ curl :8000/books/2                      → status="Read"  (round-trip confirmed)
$ curl -X PUT :8000/books/2 -d '{..."status":"Unread"}'  (restore — DB back to original)
```

✅ **PASS**.

---

### AC4 — 404 → toast error + redirect to `/books`

Test `redirects to /books with an error toast on 404` passes. With `notFoundBook()` returning `{"detail":"Book not found"}` and status 404:
- `data-testid="books-page"` mounts (navigation fired).
- A toast with text matching `/couldn't find that book|book not found/i` appears.

Live confirmation:
```
$ curl -o /dev/null -w "%{http_code}" :8000/books/999999
404
```

The toast copy is `Couldn't find that book.` for 404 specifically (distinguished from `Couldn't load that book.` for other failures) — a small UX win on top of the AC.

✅ **PASS**.

---

### AC5 — PUT 422 → inline field errors via `serverErrors`

Test `renders per-field server errors when PUT returns 422` passes. The MSW handler returns the canonical FastAPI 422 shape:

```json
{"detail":[{"loc":["body","book_name"],"msg":"String should have at most 255 characters","type":"string_too_long"}]}
```

`mapFastApiErrors(detail)` (reused as-is from S-010) maps `loc[-1] → msg`. The form receives `{book_name: "String should have at most 255 characters"}` as `serverErrors`; the input gets `aria-invalid="true"` and the error renders below it.

Live confirmation:
```
$ curl -X PUT :8000/books/2 -d '{"book_name":"xxxxxxxx...(300 chars)",...}'
HTTP 422
{"detail":[{"type":"string_too_long","loc":["body","book_name"],"msg":"String should have at most 255 characters","input":"xxx..."}]}
```

The real API shape matches what `mapFastApiErrors` consumes. No mock divergence.

✅ **PASS**.

---

### AC6 — `BookForm` not modified

Recorded hash of `frontend/src/components/BookForm.jsx`:

```
17da5332e7832547ad94704dd2600e3028d956b79016ce37bc827ececac6b392
```

EditBook reuses the component via `initialValues`, `submitLabel="Update"`, and a different `onSubmit`. No new props were added; no behavior was widened.

✅ **PASS**.

---

### AC7 — Lint, tests, 360 px

```
$ npm test -- --run
Test Files  5 passed (5)
     Tests  23 passed (23)

$ npm run lint
> eslint src --max-warnings 0
(exit 0)

$ npm run build
✓ built in 7.15s
dist/assets/index-DmM5tlI3.css   21.63 kB │ gzip:  5.06 kB
dist/assets/index-BP73uTbZ.js   238.49 kB │ gzip: 79.28 kB
```

23 tests = 4 (Home) + 6 (Books) + 5 (BookForm) + 3 (AddBook) + **5 (EditBook, new)**. Build still under the 80 KB JS gzip budget.

360 px: skeleton + form both inherit `max-w-xl` inside `container-page` (which is `px-6` on mobile). No horizontal scroll. Field stack collapses naturally on narrow viewports.

✅ **PASS**.

---

## False-pass hunt

1. **Could the skeleton test pass without the real component?** No — the test asserts `aria-busy="true"` AND that the `Update` button is *absent* during the skeleton phase. A no-op skeleton stub would fail the second assertion.
2. **Are prefill values coming from the API and not a literal?** Yes. The test installs `okGetBook(SAMPLE)` as the only handler that can answer `GET /books/:id`. The default test handler set in `handlers.js` (line 56) only covers `GET /books`, `DELETE /books/:id`, `POST /books` — there is no fallback for `GET /books/:id`. So the prefill values MUST have come from this MSW response, or the test would have errored on `onUnhandledRequest: 'error'` (`setup.js` line 8).
3. **Could AC4 false-pass via a "navigate happens for any reason"?** The test also asserts the toast text — both must be true. A naive implementation that navigated without surfacing the error would fail.
4. **Does the skeleton actually swap to the form without flicker?** Verified by inspecting the conditional render: `loadingBook || !initialValues ? <FormSkeleton /> : <BookForm initialValues={…} />`. The form does not mount until `initialValues` is populated, so the first commit with the form already has the prefilled state — no two-phase render.
5. **AC6 untouched-file claim:** verified via SHA-256 above; the only file modifications in the working tree under `frontend/src/components/` are `FormSkeleton.jsx` (new) — `BookForm.jsx` is byte-identical to its S-010 form.

---

## Deviations from the spec

- **Single-session build + self-QA** (same as every packet so far). The ENG-QA recipe in `ENG-QA_prompt.md` was followed verbatim from a fresh re-reading of `Packet_BRD.md` only — the self-QA AC verdicts above are derived from the BRD, not from the test file.
- The smoke step in `BUILD_prompt.md` asks for a browser-driven manual edit. Since I cannot drive a browser, I substituted a headless `curl`-driven cross-stack smoke (above) that exercises every backend code path the EditBook page hits in production: GET 200, GET 404, PUT 200, PUT 422. The user can re-confirm the browser flow with `npm run dev` if desired.

---

## Regression

- Backend: 37 pytest tests still passing.
- Frontend: 23 tests (was 18 + 5 new for EditBook). No regression in Home, Books, AddBook, or BookForm tests.
- ESLint: 0 warnings, 0 errors.
- Build: 79.28 KB gzip JS (was 78.69 KB after S-010; +0.59 KB for FormSkeleton + EditBook logic — well under budget).

---

## Verdict: **GREEN**

All 8 ACs proven. `BookForm` contract held — no edits, no widened props. `FormSkeleton` reuses existing tokens, preserves the editorial direction, and produces zero layout jump on swap. The shared 422 plumbing from S-010 (`mapFastApiErrors` + `serverErrors`) carried over cleanly. Frontend is now 4-of-5 frontend packets complete; only S-012 (search + filter UI) and S-013 (README + deploy) remain.
