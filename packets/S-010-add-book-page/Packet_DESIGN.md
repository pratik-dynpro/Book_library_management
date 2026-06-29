# S-010 · Packet DESIGN

## Files In
D9 §4 & §6 (BookForm), D7 §3.1, D15b US-01/US-12, D10 Q-002.

## Files Out
- `frontend/src/components/BookForm.jsx` (NEW; shared with S-011)
- `frontend/src/pages/AddBook.jsx` (replace stub)
- `frontend/src/services/api.js` (extend with `createBook`)
- `frontend/src/components/BookForm.test.jsx`
- `frontend/src/pages/AddBook.test.jsx`

## BookForm contract

Props:
- `initialValues` — `{book_name, author, genre, status}` (defaults blank).
- `onSubmit(values)` — async callback returning a promise; throw to surface errors.
- `submitLabel` — string (defaults "Save").
- `loading` — bool (parent-controlled).
- `serverErrors` — `{ [field]: string }` rendered as inline errors.

Internal state: controlled inputs with `useState`; client-side checks for required + length caps before calling `onSubmit`.

## AC-to-code Map

| AC | Code |
|----|------|
| AC1 | `BookForm` + `AddBook.jsx` shell |
| AC2 | Required checks before submit; inline error rendered with `aria-describedby` |
| AC3 | Radios under a `<fieldset>` with `<legend>` (a11y) |
| AC4 | `await api.createBook(values)` → `navigate('/books')` + `toast.success` |
| AC5 | Catch `err.response.status === 422` → map FastAPI's `detail[].loc` to fields → set `serverErrors` |
| AC6 | Default browser tab order suffices; `onKeyDown` for Enter submit on the last field |
| AC7 | `loading` state disables the button + shows spinner |
| AC8 | `tokens.js` reused; responsive single-column form |
| AC9 | Evidence minutes skill invocation |

## Rollback
`git revert`.
