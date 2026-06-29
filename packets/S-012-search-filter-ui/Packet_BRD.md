# S-012 · Packet BRD — Search + Filter UI

**Module:** frontend · **Risk:** L1 · **Depends on:** S-007, S-009

## ACs

| ID | Criterion |
|----|-----------|
| AC1 | `Books.jsx` shows a sticky filter bar with: `SearchBar` (text) + `FilterDropdown` × 3 (Author, Genre, Status). |
| AC2 | Typing in the search box debounces 250 ms then calls `GET /books?search=…` and updates the grid (TC-063). |
| AC3 | Selecting any filter dropdown updates the URL query string AND fires `GET /books?…` with all currently selected params combined (TC-064 / US-06/07/08). |
| AC4 | Author and Genre dropdowns are populated from the current result set's distinct values (sorted alphabetically). Status is hardcoded `Any / Read / Unread`. |
| AC5 | Clear-button (×) appears in `SearchBar` when non-empty; clicking clears search and re-fetches. |
| AC6 | Filters persist across navigation away and back via URL params (`/books?search=&author=&genre=&status=`). |
| AC7 | Lint clean; smoke tests pass; 360 px filter bar wraps without horizontal scroll. |
| AC8 | `frontend-design` + `ui-ux-pro-max` invoked for the filter-bar density, dropdown styling, and clear-button affordance. |

## Do-Not-Break
- `BookCard`, `BookForm`, `Home`, `EditBook` — none of these are modified.
- The card grid layout from S-009.

## Out-of-Scope
- Saved filter presets.
- Multi-select for filters.
- Sort order picker (Level-1).
