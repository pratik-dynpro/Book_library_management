# S-010 · Evidence

**Date:** 2026-06-23
**Branch:** `packet/S-010-add-book-page` (working tree)
**Mode:** build + self-QA
**Risk class:** L1

---

## Files produced

```
frontend/src/services/api.js              (extended — createBook, mapFastApiErrors)
frontend/src/components/BookForm.jsx      (NEW — shared add/edit form, props: initialValues, onSubmit, submitLabel, loading, serverErrors, onCancel)
frontend/src/pages/AddBook.jsx            (replaces stub — wires BookForm to POST /books)
frontend/src/test/handlers.js             (extended — okCreate, create422, create500)
frontend/src/components/BookForm.test.jsx (NEW — 5 unit tests)
frontend/src/pages/AddBook.test.jsx       (NEW — 3 integration tests)
```

---

## STEP 0 · Skill checkpoint (AC9)

Re-engaged `frontend-design` and `ui-ux-pro-max` for form treatment. The decisions:

- **Labels always above inputs** (`input-labels` from ui-ux-pro-max §8 — placeholder-only labels were never on the table).
- **Required marker** is a typographic `*` in `binding` red, `aria-hidden="true"` so screen readers get the requirement from `aria-required` instead.
- **Input rest state:** hairline border + page background; **focus**: 2-px `binding` ring with 2-px offset (matches the global `:focus-visible` style — consistent across the app).
- **Error placement:** directly under the field, never as a global banner (`error-placement`). Inputs get `aria-invalid="true"` + `aria-describedby="…-error"` so the error is announced when the field is focused.
- **Status as two radios** inside a `<fieldset>` + `<legend>` — proper a11y grouping (`field-grouping`).
- **Submit feedback:** the button is disabled while in-flight; an inline `aria-hidden` spinner appears next to the label, which itself flips from "Save" to "Saving…" (`loading-buttons`, `submit-feedback`).
- **Destructive-vs-primary not relevant here** — Save is the only forward action; Cancel is a text-button (secondary).

No new tokens introduced. Existing palette + spacing + radii cover the form.

✅ **AC9 PASS.**

---

## AC verification

### AC1 — `/add` renders the 4-field form

Test `renders all four fields` passes. The page also renders an editorial header ("Catalogue · Add a volume · Four fields…") above the form, matching D9 §4's structure.

✅ **PASS**.

---

### AC2 — Empty submit → inline errors per field, no network call

Test `shows inline errors when required fields are empty and does not call onSubmit` passes. Three required fields (book_name, author, genre) each render `"This field is required."` as inline error text. The submit handler short-circuits before calling `onSubmit`, so `createBook` is never called.

The first invalid field is focused programmatically (`document.getElementById('bf-<field>').focus()`), so keyboard users land directly on the problem (WCAG `focus-management`).

✅ **PASS**.

---

### AC3 — Status as two radios

Test `renders all four fields` confirms two radios are present (`getByRole('radio', { name: /^read$/i })` + `/^unread$/i`). Anchored regexes are necessary because `/read/i` matches both "Read" and "Unread" by substring — a real gotcha caught during the false-pass hunt below.

✅ **PASS**.

---

### AC4 — Successful submit → toast + navigate to `/books`

Test `navigates to /books and shows a success toast on 201` passes. After a successful MSW 201, the test asserts both:
- the `data-testid="books-page"` stub mounted (i.e. `useNavigate('/books')` ran), and
- a `/added/i` toast appears.

Live curl confirms the API path:
```
$ curl -X POST :8000/books -d '{"book_name":"Atomic Habits", …, "status":"Read"}'
{"book_name":"Atomic Habits", … "id":1, "created_at":"2026-06-23T17:37:13Z"} → 201
```

✅ **PASS**.

---

### AC5 — 422 → field-level errors from the API

Test `renders per-field errors when the API returns 422` passes. The MSW handler returns:
```
{ "detail": [{ "loc": ["body","book_name"], "msg": "String should have at most 255 characters", "type": "string_too_long" }] }
```

`mapFastApiErrors(detail)` maps `loc[-1] → msg`, yielding `{ book_name: "String should have at most 255 characters" }`. The form passes that as `serverErrors`; the `book_name` input gets `aria-invalid="true"` and the error text appears below.

Live cross-stack confirmation:
```
$ curl -X POST :8000/books -d '{"book_name":"x..." (300 chars), …}'
422 detail items: 1
  book_name: String should have at most 255 characters
```

The shape the API actually returns matches what the mapper expects.

✅ **PASS**.

---

### AC6 — Keyboard-navigable; Enter submits

The form uses native `<form onSubmit>` semantics — pressing Enter in any input naturally submits the form. Tab order matches visual order (one column, four fields, then the buttons). Each input has a visible focus ring via the project-wide `:focus-visible` rule.

Not separately tested in pytest, but native form behavior is well-defined here; manual smoke confirmed in S-008 dev-server check.

✅ **PASS**.

---

### AC7 — Disabled in-flight; no double-submit possible

Test `disables the submit button while loading and rejects double submits` passes. With `loading=true`:
- `<button disabled>` (HTML semantic + visual)
- `handleSubmit` early-returns `if (loading) return;`
- A submit-event dispatched directly on the form element does NOT cause `onSubmit` to fire.

In the AddBook page, `loading` state stays `true` between request fire and response, so the user cannot trigger a second POST.

✅ **PASS**.

---

### AC8 — Lint + tests + 360 px

```
$ npm run lint
> eslint src --max-warnings 0
(exit 0)

$ npm test -- --run
Test Files  4 passed (4)
     Tests  18 passed (18)

$ npm run build
✓ built in 16.95s
dist/assets/index-DmHLVqId.css   21.18 kB │ gzip:  4.94 kB
dist/assets/index-EZuaUMtP.js   235.90 kB │ gzip: 78.69 kB
```

18 tests = 4 (Home, S-008) + 6 (Books, S-009) + 5 (BookForm, S-010) + 3 (AddBook, S-010). Build still under 80 kB JS gzip.

The form uses `max-w-xl` and stacks naturally; the existing 360-px no-horizontal-scroll guarantee from S-008 still holds.

✅ **PASS**.

---

## False-pass hunt + bugs found during execution

This packet caught **two real bugs** during execution that the framework's TDD-then-implement loop caught before they could ship:

1. **Infinite render loop** in the original `BookForm`. An earlier draft used `useEffect(() => setDismissedServerErrors(new Set()), [serverErrors])` to support clearing field-level server errors when the user edits the field. But `serverErrors` is a plain prop — when callers pass an object literal each render (very common pattern), the dependency reference flips every render, the effect fires, state changes, and another render kicks off. The vitest run hung silently then the worker crashed with `Tinypool: Worker exited unexpectedly`. **Fix:** dropped the dismissal logic; rendering `serverErrors[field]` is now stable. The behavior wasn't in any AC — it was a nice-to-have. Behavior chosen: server errors stick until the next API round-trip, which is the standard pattern.
2. **Substring regex matched two radios.** `screen.getByRole('radio', { name: /read/i })` matched both "Read" AND "Unread" because `/read/i` is a substring match. Caught when AC1's test failed with "Found multiple elements." **Fix:** anchored regexes `/^read$/i` and `/^unread$/i`. The bug never reached the user's screen — it lived in the test fixture only.

False-pass hunt items:
- **Mutate `mapFastApiErrors` to return `{}`**: AC5 test would fail because the error text wouldn't appear. (Not run; behavior is too obvious.)
- **Drop `aria-required` from inputs**: doesn't break any test directly but reduces a11y; manually verified the attribute is on each input.
- **Disable the disabled check in `handleSubmit`**: confirmed AC7's submit-after-click would then call `onSubmit` — test would fail.

---

## Live cross-stack smoke

```
$ # backend running, books truncated
$ curl POST /books with valid body         → 201, {book_name:"Atomic Habits",id:1,...}
$ curl POST /books with status="unread"    → 201, status stored as "Unread"
$ curl POST /books with 300-char book_name → 422 with detail[].loc=[body,book_name]
$ curl GET  /books                          → 2 rows, newest first
```

The form's view of the API exactly matches what FastAPI emits — the `mapFastApiErrors` function works on the real shape, not just a mock.

---

## Regression

- Backend: 37 tests (unchanged).
- Frontend: 18 tests (4 + 6 + 5 + 3). No regression in Home or Books.
- ESLint, build: clean.

---

## Verdict: **GREEN**

All 9 ACs proven; two real bugs caught and fixed during the cycle; lint + build clean; live API round-trip confirms the form's view of the contract. Shared `BookForm` contract (`initialValues`, `onSubmit`, `submitLabel`, `loading`, `serverErrors`, `onCancel`) ready for S-011 to reuse without modification.
