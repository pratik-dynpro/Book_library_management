# S-012 · BUILD prompt

```text
Builder for S-012. Branch packet/S-012-search-filter-ui. Mode: build.
Read D18 §0, D9 §3 & §6, D7 §3.2, D15b US-05/06/07/08,
Packet_BRD + DESIGN.

STEP 0 — SKILLS:
  - frontend-design: density, alignment, and rhythm of the filter bar;
    decide stack-vs-row on mobile.
  - ui-ux-pro-max: pick the search input pattern (with clear-button
    affordance), dropdown pattern, and confirm focus-visible styling.

STEP 1 — TDD:
  SearchBar.test.jsx:
    - test_debounces_250ms_before_onChange
    - test_clear_button_appears_and_clears
  FilterDropdown.test.jsx:
    - test_renders_options
    - test_onChange_emits_value
  Books.filters.test.jsx (MSW):
    - test_dropdowns_populate_from_results
    - test_changing_filter_updates_url_and_refetches
    - test_filters_compose_in_request
    - test_filters_persist_after_navigation_back

STEP 2 — implement:
  - Author SearchBar.jsx with a debounced effect.
  - Author FilterDropdown.jsx (generic).
  - Extend services/api.js → getBooks(params) builds a query string
    from non-empty params.
  - Modify pages/Books.jsx:
      * use useSearchParams for state,
      * render the filter bar above the grid,
      * compute distinct Author / Genre options from `books`.

STEP 3 — verify:
  - npm test -- --run → green.
  - npm run lint → 0.
  - Manual: type "atomic" — list narrows after ~250ms; pick Genre →
    URL updates; reload — filters preserved; click × → reset.

STEP 4 — commit + HANDOVER.

Abort:
  - Filter state forks (component state + URL state) → fix; URL must
    be the single source of truth.
```
