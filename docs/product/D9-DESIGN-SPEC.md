# D9 · Design Spec (per-screen, field-level)

## Skills that produced — and gate — this spec

This document captures **intent**, not the final visual system. The final palette, font pairing, and per-component treatment are produced by running the following skills at the start of each frontend packet (S-008 — S-012), in this exact order:

1. `frontend-design` — establishes visual direction, palette intent, typography hierarchy, layout principles for the page.
2. `ui-ux-pro-max` — picks the catalog palette (from 161), font pairing (from 57), UX patterns, and accessibility checks appropriate to the chosen style.

The tokens and Tailwind utility hints below are starting points. The skills may refine them; their output supersedes this doc for the affected component. Per-page invocation checklists appear under each section.

Tailwind utility hints are illustrative — implementers may adjust spacing as long as the visual hierarchy and behaviors match.

## 1. Global

- **Color tokens**
  - `bg-slate-50` page · `bg-white` cards · `text-slate-900` body · `text-slate-500` muted.
  - Status badge: `Read` → `bg-emerald-100 text-emerald-800`; `Unread` → `bg-amber-100 text-amber-800`.
- **Type scale**
  - h1 `text-3xl md:text-4xl font-bold` · h2 `text-2xl font-semibold` · body `text-base` · caption `text-sm text-slate-500`.
- **Spacing**: 4 px grid; section padding `py-12 md:py-16`.
- **Navbar**: sticky, `h-14`, links: Home · Books · Add Book.

## Per-page skill invocation checklist (tick before authoring JSX)

For each page below, the builder confirms in the packet's `Evidence.md`:

- [ ] `frontend-design` invoked; chosen palette + typography recorded.
- [ ] `ui-ux-pro-max` invoked; catalog palette / font pairing selected; accessibility checks captured.
- [ ] Design tokens committed to a `// design tokens` comment block at the top of the page file (or to a shared `src/design/tokens.js`).

## 2. Home (`/`)

```
┌─────────────────────────────────────────────────────┐
│  Navbar                                             │
├─────────────────────────────────────────────────────┤
│                                                     │
│   ░░░  My Library  ░░░         (h1)                 │
│                                                     │
│   Manage your books efficiently.                    │
│   Track your reading journey.                       │
│                                                     │
│   [ Add Book ]    [ View Books ]                    │
│                                                     │
├─────────────────────────────────────────────────────┤
│   Feature tiles (grid 2x2 on md, 1col on sm)        │
│   • Add Books   • Search Books                      │
│   • Filter Books • Track Reading                    │
├─────────────────────────────────────────────────────┤
│   Stats (4 cards in a row on md, 2x2 on sm)         │
│   Total | Read | Unread | Genres                    │
└─────────────────────────────────────────────────────┘
```

- Stats source: `GET /books` → compute client-side (OQ-005).
- Numbers animate from 0 to value on first paint (CSS, no JS easing).

## 3. Books (`/books`)

```
┌─────────────────────────────────────────────────────┐
│  Navbar                                             │
├─────────────────────────────────────────────────────┤
│  [Search input ........] [Author▾][Genre▾][Status▾] │  ← sticky filter bar
├─────────────────────────────────────────────────────┤
│  ┌───────────┐  ┌───────────┐  ┌───────────┐         │
│  │ BookCard  │  │ BookCard  │  │ BookCard  │   …    │
│  │ name      │  │           │  │           │         │
│  │ author    │  │           │  │           │         │
│  │ genre     │  │           │  │           │         │
│  │ [Read]    │  │ [Unread]  │  │ [Read]    │         │
│  │ Edit · Del│  │           │  │           │         │
│  └───────────┘  └───────────┘  └───────────┘         │
└─────────────────────────────────────────────────────┘
```

- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`.
- Empty state: centered card "No books yet — add your first" + CTA.
- Delete uses a confirm modal (`<dialog>` or headless modal); destructive button `bg-red-600 hover:bg-red-700`.

## 4. AddBook (`/add`)

```
┌─────────────────────────────────────────────────────┐
│  Add a Book                                         │
├─────────────────────────────────────────────────────┤
│  Book Name *  [_______________________________]     │
│  Author    *  [_______________________________]     │
│  Genre     *  [_______________________________]     │
│  Status    *  ( ) Read    ( ) Unread                │
│                                                     │
│  [Cancel]                                [Save]     │
└─────────────────────────────────────────────────────┘
```

- All fields required; `*` marker rendered with `text-red-500`.
- Inline error: `text-sm text-red-600 mt-1` directly under the field.
- Submit disabled while in-flight; show spinner inside the button.
- On 201 → `navigate('/books')` and show a success toast.

## 5. EditBook (`/edit/:id`)

- Identical form to AddBook (shared `BookForm` component, controlled via `initialValues` prop).
- On mount, GET `/books/{id}`; show skeleton placeholders while loading.
- 404 → redirect to `/books` with an error toast.
- Submit calls `PUT /books/{id}`.

## 6. Components

### BookCard
- Container: `rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition`.
- Title `text-lg font-semibold truncate`.
- Subtitle (author) `text-sm text-slate-500`.
- Genre pill `text-xs bg-slate-100 px-2 py-0.5 rounded-full`.
- Status badge (top-right).
- Actions: text buttons "Edit", "Delete" — `Delete` in red.

### BookForm
- Controlled inputs with `useState`; `onSubmit(values)` callback.
- Validation: required + length caps from D6 §5.
- Exposes `loading` and `serverErrors` props for the parent page.

### SearchBar
- Debounced 250 ms; triggers parent's `onSearch(query)` callback.
- Clear-button (×) appears when input is non-empty.

### FilterDropdown
- Generic `<select>` with label, controlled value, `options` prop.
- Three instances on Books page: Author (distinct list from current results), Genre (distinct), Status (`Read`/`Unread`).

### Navbar
- Logo text "📚 My Library" linking to `/`.
- Right-side links: Home, Books, Add Book.
- Active link underlined.

## 7. Toasts

- Library: lightweight in-house implementation; one toast container in `App.jsx`.
- Variants: success (`bg-emerald-600`), error (`bg-red-600`), info (`bg-slate-700`).
- Auto-dismiss after 3 s; dismissible by click.
