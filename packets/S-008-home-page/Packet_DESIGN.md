# S-008 · Packet DESIGN

## Files In
D9 (esp. §2 Home + per-page skill checklist), D7 §3.2 (`GET /books`), D10 Q-003.

## Files Out
- `frontend/package.json`, `frontend/vite.config.js`, `frontend/tailwind.config.js`, `frontend/postcss.config.js`, `frontend/index.html`
- `frontend/src/main.jsx`, `frontend/src/App.jsx`, `frontend/src/index.css`
- `frontend/src/services/api.js`
- `frontend/src/design/tokens.js`  ← committed output of frontend-design + ui-ux-pro-max
- `frontend/src/components/Navbar.jsx`
- `frontend/src/pages/Home.jsx`
- placeholder stubs: `frontend/src/pages/{Books,AddBook,EditBook}.jsx` (each renders `<h1>Coming soon</h1>` — replaced in later packets)
- `frontend/src/test/setup.js`, `frontend/src/test/handlers.js` (MSW)
- `frontend/src/pages/Home.test.jsx`
- `frontend/.eslintrc.cjs`, `frontend/.prettierrc`, `frontend/.gitignore`

## Skill-driven design preamble (mandatory)

**Before any JSX is written**, the builder must, in order:

1. **Invoke `frontend-design`.** Brainstorm a visual direction for a personal library / reading-tracker app. Settle on: a single hero typeface, one accent color, and a layout posture (e.g., "library-card editorial" vs. "minimal product").
2. **Invoke `ui-ux-pro-max`.** Use it to:
   - Pick one of its 161 catalog palettes that matches the direction.
   - Pick one of its 57 font pairings for body/heading.
   - Confirm accessibility-color contrast for primary/secondary/danger.
   - Identify the catalog patterns that apply: hero card, stat card, navbar.

The outputs are recorded in `frontend/src/design/tokens.js`:

```js
// design tokens — produced by frontend-design + ui-ux-pro-max in packet S-008
export const palette = { /* names + hex + Tailwind shade refs */ };
export const type    = { /* heading + body family + scale */ };
export const radii   = { /* xs..2xl */ };
export const motion  = { /* durations + easings */ };
```

`Evidence.md` for this packet must include the skill names + a one-line note on the chosen palette and font pair.

## AC-to-code Map

| AC | Where |
|----|-------|
| AC1 | `vite.config.js` + `package.json` scripts |
| AC2 | `App.jsx` `<BrowserRouter>` + `<Routes>` |
| AC3 | `services/api.js` `axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000' })` + `getBooks()` |
| AC4 | `Navbar.jsx` with `NavLink`; active class from `tokens.js` |
| AC5 / AC6 / AC7 | `Home.jsx` uses `useEffect` → `getBooks()` → derive 4 stats; defaults to 0 |
| AC8 | Tailwind responsive utilities; tested via Vitest jsdom `matchMedia` shim or visual smoke |
| AC9 | `eslint`, `vitest` configured |
| AC10 | `tokens.js` exists with non-placeholder values; Evidence narrates the skill invocations |

## Rollback
`git revert` the packet's commits; `rm -rf frontend/node_modules` if needed.

## Alternatives Considered
- shadcn/ui — `ui-ux-pro-max` may pick from its MCP-backed catalog; permitted.
- CSS-in-JS — rejected, conflicts with D18's Tailwind-only rule.
