# S-012 · Packet DESIGN

## Files In
D9 §3 + §6 (SearchBar, FilterDropdown), D7 §3.2, D15b US-05/06/07/08.
Existing: `Books.jsx`, `services/api.js`, `tokens.js`.

## Files Out
- `frontend/src/components/SearchBar.jsx`
- `frontend/src/components/FilterDropdown.jsx`
- `frontend/src/pages/Books.jsx` (extend)
- `frontend/src/services/api.js` (extend `getBooks(params)`)
- `frontend/src/components/SearchBar.test.jsx`
- `frontend/src/components/FilterDropdown.test.jsx`
- `frontend/src/pages/Books.filters.test.jsx`

## State strategy

Single `URLSearchParams` is the source of truth, via `react-router`'s `useSearchParams`:
- `search`, `author`, `genre`, `status`.
- A `useEffect` watches the parsed params and re-calls `getBooks(params)`.
- Components only update the URL; they never own filter state directly.

This gives AC6 (persistence across navigation) for free.

## SearchBar

- Controlled input with internal `value`; on change, schedules a 250 ms debounce; on debounce-fire, writes `search` to the URL params.
- Clear button (×) appears when input non-empty; clicking it clears immediately (no debounce).

## FilterDropdown

- Generic `<label> + <select>` with props `{label, paramKey, options, value, onChange}`.
- Three instances on `Books.jsx`.
- Options for Author / Genre derived from the current result set (distinct, sorted). Status is the literal list `[{label:"Any",value:""}, {label:"Read", value:"Read"}, {label:"Unread", value:"Unread"}]`.

## AC-to-code Map

| AC | Code |
|----|------|
| AC1 | Sticky filter bar block in `Books.jsx` |
| AC2 | `SearchBar` debounce → URL params → `useEffect` → `getBooks(...)` |
| AC3 | Each dropdown's `onChange` updates one param via `setSearchParams` |
| AC4 | `useMemo(() => uniqueSorted(books.map(...)), [books])` for Author/Genre options |
| AC5 | × button clears the param |
| AC6 | URL params are the source of truth |
| AC7 | `flex flex-wrap gap-2` on the filter bar |
| AC8 | Evidence minutes skill invocation |

## Rollback
`git revert`; previous Books page (S-009) keeps working unchanged.
