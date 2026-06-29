# S-008 · Packet BRD — Home page (incl. frontend scaffolding)

**Module:** frontend · **Risk:** L1
**Depends on:** S-007 (full backend live)
**Note:** This is the **first frontend packet** in build order — it carries the project scaffolding (Vite + Tailwind + Router + `services/api.js` + `Navbar`) so later packets can extend, not re-create.

## ACs

| ID | Criterion |
|----|-----------|
| AC1 | `cd frontend && npm install && npm run dev` boots Vite on `:5173` with no console errors against a running backend. |
| AC2 | `App.jsx` mounts `react-router-dom` with routes `/`, `/books`, `/add`, `/edit/:id` (other pages may be placeholder stubs). |
| AC3 | `services/api.js` exposes a configured Axios instance using `import.meta.env.VITE_API_BASE_URL` (default `http://localhost:8000`) and a `getBooks()` function. |
| AC4 | `Navbar` renders on every page with links Home / Books / Add Book; active link is underlined. |
| AC5 | `/` renders Hero (title + tagline + two CTAs) + Features grid + Stats cards. |
| AC6 | Stats cards display **Total**, **Read**, **Unread**, **Genres** — computed client-side from `getBooks()` (US-09 AC1). |
| AC7 | With 0 books, every stat reads `0`; no `NaN`, no crash (US-10 AC2). |
| AC8 | Layout has no horizontal scroll at 360 px width (NFR Q-003 / US-11). |
| AC9 | `npm run lint` exits 0; `npm test -- --run` passes the page's smoke test. |
| AC10 | **`frontend-design` skill** invoked before any JSX written, AND **`ui-ux-pro-max` skill** invoked before locking palette/typography. Output of both is recorded in `Evidence.md` (chosen palette name, font pair, style direction). |

## Do-Not-Break
- Backend API contract (read-only consumer here).

## Out-of-Scope
- Books list rendering, edit, delete, search/filter — own packets.
- Auth, profiles.
