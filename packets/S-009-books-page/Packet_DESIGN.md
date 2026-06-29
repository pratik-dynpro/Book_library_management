# S-009 · Packet DESIGN

## Files In
D9 §3, §6 (BookCard), D7 §3.2/§3.5, D10 Q-001/Q-003, D12 §T-02, D15b US-02/US-04.
Existing: `tokens.js`, `services/api.js`, `App.jsx`, `Navbar.jsx`.

## Files Out
- `frontend/src/pages/Books.jsx` (replace stub)
- `frontend/src/components/BookCard.jsx`
- `frontend/src/components/ConfirmModal.jsx`
- `frontend/src/components/Toast.jsx` + `frontend/src/components/ToastProvider.jsx` (mounted once in `App.jsx`)
- `frontend/src/services/api.js` (extend with `deleteBook`)
- `frontend/src/pages/Books.test.jsx`

## Skill checkpoints

Before authoring `BookCard`, `ConfirmModal`, or `Toast`:
- Re-open `frontend-design` for the card + modal treatments (revisit, not restart — tokens are already chosen).
- Use `ui-ux-pro-max` to confirm the modal pattern + toast pattern from its catalog (focus trap, ESC-to-close, ARIA roles).
- Both invocations are minuted in `Evidence.md`.

## AC-to-code Map

| AC | Code |
|----|------|
| AC1 | `Books.jsx` calls `getBooks()` in `useEffect`; renders `<BookCard>` in `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`. |
| AC2 | If `books.length === 0` after load → empty-state card with Link to `/add`. |
| AC3 | `BookCard.jsx` per D9 §6. |
| AC4 | `ConfirmModal` (focus-trapped); on confirm → `api.deleteBook(id)` → optimistic-remove + toast. |
| AC5 | Catch → `toast.error(err.response?.data?.detail ?? "Couldn't delete")`. |
| AC6 | `<Link to={`/edit/${id}`}>Edit</Link>`. |
| AC7 | React text node → escaped by default; assertion via Vitest. |
| AC8 | Grid utility above; `truncate` on long titles. |
| AC9 | `npm run lint` + `npm test -- --run`. |
| AC10 | `Evidence.md` minutes; styles reference `tokens.js`. |

## Rollback
`git revert`; Home page (S-008) still functions.
