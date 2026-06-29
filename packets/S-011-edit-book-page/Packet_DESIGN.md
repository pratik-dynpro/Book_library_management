# S-011 · Packet DESIGN

## Files In
D9 §5, D7 §3.3/§3.4, D15b US-03, existing `BookForm.jsx`, `services/api.js`.

## Files Out
- `frontend/src/pages/EditBook.jsx` (replace stub)
- `frontend/src/components/FormSkeleton.jsx` (new)
- `frontend/src/services/api.js` (extend with `getBook`, `updateBook`)
- `frontend/src/pages/EditBook.test.jsx`

## Flow

```
mount → setLoading(true) → api.getBook(id)
  ↓                      ↓
 ok                    404
  ↓                      ↓
 setInitial(values)     toast.error + navigate('/books')
 setLoading(false)
  ↓
render BookForm(initialValues, submitLabel="Update", onSubmit=handleUpdate)
  ↓
handleUpdate(values) → api.updateBook(id, values) → 200 → toast.success + navigate('/books')
                                                 → 422 → setServerErrors(...)
```

## AC-to-code Map

| AC | Where |
|----|-------|
| AC1 | `useEffect` on mount; `useParams` for id |
| AC2 | `loading` ? `<FormSkeleton/>` : `<BookForm…/>` |
| AC3 | `handleUpdate` |
| AC4 | `catch` block in initial fetch |
| AC5 | `serverErrors` reused from S-010 |
| AC6 | Single `BookForm` import; no edits to it |
| AC7 | Tests + lint |
| AC8 | Evidence minutes |

## Rollback
`git revert`.
