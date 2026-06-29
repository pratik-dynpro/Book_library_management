# S-011 · Packet BRD — EditBook page

**Module:** frontend · **Risk:** L1 · **Depends on:** S-005, S-010

## ACs

| ID | Criterion |
|----|-----------|
| AC1 | `/edit/:id` fetches `GET /books/{id}` on mount and prefills `BookForm` with the returned values (US-03 AC5). |
| AC2 | While loading, the form shows skeleton placeholders (from `ui-ux-pro-max` pattern catalog) — no flicker, no jump. |
| AC3 | Submitting the form calls `PUT /books/{id}`; on 200 → navigate to `/books` + success toast. |
| AC4 | 404 from `GET /books/{id}` → redirect to `/books` + error toast. |
| AC5 | 422 from `PUT` → inline field errors via `serverErrors` prop (reuse S-010 plumbing). |
| AC6 | The shared `BookForm` is not modified for Edit specifically — Edit only differs by `initialValues`, `submitLabel="Update"`, and `onSubmit`. |
| AC7 | Lint, tests, 360 px all clean. |
| AC8 | `frontend-design` + `ui-ux-pro-max` invoked for the skeleton loader. |

## Do-Not-Break
- `BookForm` API contract from S-010.
- AddBook page, Books page, Home page.

## Out-of-Scope
- Partial updates / autosave.
- Optimistic UI for edits (full request/response cycle is fine).
