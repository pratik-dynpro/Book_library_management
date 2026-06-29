# D2 · Product Requirements Document (PRD)

## 1. Persona

**"Solo Reader"** — owns 50–500 books across paper and ebook, wants a single place to record what they own and whether they've read it. Comfortable on the web, expects forms to behave, has no patience for sign-up walls.

## 2. User Journeys

### J1 · Capture a new book
1. Reader lands on Home → clicks **Add Book** (primary CTA).
2. Fills the four-field form, picks `Read` or `Unread`.
3. Submits → redirected to Books page → sees the new book at the top of the list.

### J2 · Find a book
1. Reader opens **Books**.
2. Types a query in the search bar (book name or author).
3. List filters live; clearing the box restores the full list.

### J3 · Narrow by attribute
1. Reader opens **Books**.
2. Selects a filter — author, genre, or status — from a dropdown.
3. List narrows; filters compose (e.g., `author=James Clear` AND `status=Read`).

### J4 · Update reading status
1. Reader finds a book → clicks **Edit**.
2. Changes `status` from `Unread` to `Read` → submits.
3. Returns to Books page; Home stats reflect the change next visit.

### J5 · Remove a book
1. Reader clicks **Delete** on a card → confirms in modal.
2. Card disappears; stats decrement.

## 3. Capabilities (maps to features in D3)

| Capability | Feature ID |
|------------|------------|
| Add a book | F-002 (API) + F-004 (UI) |
| List books | F-002 + F-003 |
| Edit a book | F-002 + F-004 |
| Delete a book | F-002 + F-003 |
| Search by name or author | F-005 |
| Filter by author / genre / status | F-006 |
| See aggregate stats | F-007 |
| Land on a friendly Home page | F-001 |

## 4. Non-goals (v1)

- Multi-user, login, profiles, sharing.
- Mobile native app.
- Importing from Goodreads/CSV.
- Cover images, ISBN lookup.

## 5. UX Principles

- **Zero friction:** no auth, no setup wizard, no email capture.
- **Instant feedback:** every mutation reflects in the UI within one render cycle.
- **Keyboard-first:** all forms submittable with Enter; tab order matches visual order.
- **Empty states matter:** a 0-book library still shows a useful Home and a clear CTA on Books.

## 6. Acceptance Demo Script (for v1 sign-off)

A fresh visitor performs J1 → J2 → J3 → J4 → J5 in under two minutes with no console errors and no broken styles on a 360 px viewport.
