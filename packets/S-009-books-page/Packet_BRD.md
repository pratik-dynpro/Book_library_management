# S-009 · Packet BRD — Books page (list + delete)

**Module:** frontend · **Risk:** L1 · **Depends on:** S-006, S-008

## ACs

| ID | Criterion |
|----|-----------|
| AC1 | `/books` lists books in a responsive card grid (1 / 2 / 3 cols) using `BookCard`. |
| AC2 | Empty state renders the "Add your first book" CTA when the list is empty (OQ-007). |
| AC3 | Each card shows: book name, author, genre pill, status badge, **Edit** + **Delete** buttons. |
| AC4 | Clicking **Delete** opens a confirm modal; confirming calls `DELETE /books/{id}` and removes the card without a full reload (TC-062). |
| AC5 | Failed delete shows a red toast with the API's `detail` message; the card stays. |
| AC6 | Clicking **Edit** navigates to `/edit/:id` (stub from S-008 is still fine here; S-011 fills it in). |
| AC7 | A `<script>...</script>` literal stored in `book_name` renders as text, not script (TC-081 / T-02). |
| AC8 | 360 px width: no horizontal scroll; cards stack to one column. |
| AC9 | Lint clean; smoke tests pass. |
| AC10 | `frontend-design` + `ui-ux-pro-max` invoked before authoring `BookCard` and the delete modal; outputs reflected in `tokens.js` and the component styles. |

## Do-Not-Break
- Home page (S-008) and the Navbar/services scaffolding.

## Out-of-Scope
- Edit form (S-011), Add form (S-010), Search/Filter UI (S-012), pagination.
