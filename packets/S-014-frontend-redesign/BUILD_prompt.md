# Packet S-014 — BUILD prompt

> **Paste this into a fresh build session, alongside `Packet_BRD.md` and `Packet_DESIGN.md`.**
> **Format:** writing-plans bite-sized tasks. Each task is one action with a runnable check.

---

## STEP 0 — Mandatory skill gate (DO NOT SKIP)

CLAUDE.md hard rule (saved preference): *every frontend packet MUST invoke BOTH `frontend-design` AND `ui-ux-pro-max` before any JSX edit.* The default-Tailwind look is a RED gate.

**Before editing any `.jsx` file:**

- [ ] Invoke `frontend-design` skill. Confirm AI-default clusters (cream + serif + terracotta; soft-blue-violet gradient; mid-grey "neutral SaaS") are NOT being introduced; the redesign target is Modern SaaS / Tech (slate ink + indigo + soft white) per the design spec.
- [ ] Invoke `ui-ux-pro-max` skill. Confirm the bar-chart and BookCard left-border patterns are consistent with one of its 50+ style references; spot-check Tailwind class shapes.
- [ ] Verify the design spec (`docs/superpowers/specs/2026-06-29-frontend-redesign-design.md`) is loaded in context.

If either skill flags a concern, pause and reconcile before starting.

---

## Tech context

- Working tree clean on `main` at `33c004c`.
- Frontend: React 18 + Vite 6 + Tailwind 3 + Vitest 1.x. Test runner is `npm test -- --run` from `frontend/`.
- Node `npm` available on PATH; backend not required for any of these steps.
- No new dependencies. No new files except `Evidence.md`.

---

## Task 1 — Bootstrap

- [ ] **Step 1.1:** Confirm working tree clean.

  Run (PowerShell):

  ```powershell
  git status --porcelain
  ```

  Expected: empty output.

- [ ] **Step 1.2:** Confirm baseline tests pass.

  Run:

  ```powershell
  cd frontend; npm test -- --run; cd ..
  ```

  Expected: `Tests  35 passed (35)`.

- [ ] **Step 1.3:** Confirm baseline build passes.

  Run:

  ```powershell
  cd frontend; npm run build; cd ..
  ```

  Expected: exits 0; printed JS gzip ≈ 80.74 KB.

If any baseline step fails, stop and report. The redesign assumes a green start.

---

## Task 2 — Fonts (`frontend/index.html`)

**File:** `frontend/index.html`

- [ ] **Step 2.1:** Replace the existing Google Fonts `<link>` (lines 9–12) with the Tinos + Poppins combination. Tinos 600 is not requested — Tinos only ships 400 and 700 on Google Fonts, and we use 700 for all display headlines (decision 2026-06-30).

  Replace:

  ```html
  <link
    href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&display=swap"
    rel="stylesheet"
  />
  ```

  With:

  ```html
  <link
    href="https://fonts.googleapis.com/css2?family=Tinos:ital,wght@0,400;0,700;1,400&family=Poppins:wght@300;400;500;600;700&display=swap"
    rel="stylesheet"
  />
  ```

- [ ] **Step 2.2:** Verify.

  ```powershell
  Select-String -Path frontend/index.html -Pattern "Tinos|Poppins|Newsreader|DM\+Sans"
  ```

  Expected: matches for `Tinos` and `Poppins` only. No `Newsreader`, no `DM+Sans`.

---

## Task 3 — Tokens (`frontend/src/design/tokens.js`)

**File:** `frontend/src/design/tokens.js`

- [ ] **Step 3.1:** Replace `palette` (lines 12–30). New value:

  ```js
  export const palette = {
    /* Surfaces */
    page:        '#F8FAFC', // slate-50 — app background
    card:        '#FFFFFF', // surface above background
    ink:         '#0F172A', // slate-900 — primary text
    mute:        '#64748B', // slate-500 — secondary text, captions
    hairline:    '#E2E8F0', // slate-200 — borders, dividers

    /* Accent */
    accent:      '#4F46E5', // indigo-600 — primary CTA, Read status, focus rings
    accentHover: '#4338CA', // indigo-700 — hover state
    accentSoft:  '#EEF2FF', // indigo-50 — tinted bg, chart bar track

    /* Functional */
    danger:      '#DC2626', // red-600
    success:     '#15803D', // emerald-700
    warning:     '#B45309', // amber-700
  };
  ```

- [ ] **Step 3.2:** Replace `type` (lines 32–36). New value:

  ```js
  export const type = {
    display: '"Tinos", "Times New Roman", serif',
    body:    '"Poppins", system-ui, -apple-system, "Segoe UI", sans-serif',
  };
  ```

- [ ] **Step 3.3:** Delete the `spineColors` array and the `spineColorFor` function (lines 63–82) and the `/** Helper: ... */` comment above them.

- [ ] **Step 3.4:** Update the file header comment (lines 1–10) to reflect Modern SaaS direction:

  ```js
  /**
   * Design tokens — produced via frontend-design + ui-ux-pro-max in packet S-014.
   *
   * Direction: "Modern SaaS / Tech"
   *   Surfaces:   slate-50 page, white cards
   *   Accent:     indigo-600 single accent (CTAs, focus, Read-status)
   *   Type:       Tinos (display) + Poppins (body)
   *
   * Single source of truth for color + type. All components import from here.
   */
  ```

- [ ] **Step 3.5:** Verify no references to old identifiers remain in tokens.js.

  ```powershell
  Select-String -Path frontend/src/design/tokens.js -Pattern "binding|gilt|moss|spineColor|Newsreader|DM Sans"
  ```

  Expected: no matches.

---

## Task 4 — Tailwind config (`frontend/tailwind.config.js`)

**File:** `frontend/tailwind.config.js`

- [ ] **Step 4.1:** Replace the `colors` block (lines 8–23) with:

  ```js
  colors: {
    page: palette.page,
    card: palette.card,
    ink: palette.ink,
    mute: palette.mute,
    hairline: palette.hairline,
    accent: {
      DEFAULT: palette.accent,
      hover:   palette.accentHover,
      soft:    palette.accentSoft,
    },
    danger:  palette.danger,
    success: palette.success,
    warning: palette.warning,
  },
  ```

  The keys `binding`, `gilt`, `moss` are removed; `accent` (nested) and `warning` are added.

- [ ] **Step 4.2:** Verify.

  ```powershell
  Select-String -Path frontend/tailwind.config.js -Pattern "binding|gilt|moss"
  ```

  Expected: no matches.

---

## Task 5 — Class-name sweep across unchanged components

Each substep is a single search-and-replace inside one file. **Do not change structure, props, behavior, or any other class.** The sweep is mechanical.

- [ ] **Step 5.1:** `frontend/src/components/BookForm.jsx`
  - Replace `text-binding` with `text-accent` (line 18).
  - Replace `focus-visible:ring-binding` with `focus-visible:ring-accent` (line 107).
  - Replace both occurrences of `accent-binding` with `accent-accent` (lines 187, 198).

- [ ] **Step 5.2:** `frontend/src/components/ConfirmModal.jsx`
  - Replace `bg-binding text-page hover:bg-binding-hover` with `bg-accent text-page hover:bg-accent-hover` (line 105).

- [ ] **Step 5.3:** `frontend/src/components/FilterDropdown.jsx`
  - Replace `text-binding` with `text-accent` (line 14).

- [ ] **Step 5.4:** `frontend/src/components/Navbar.jsx`
  - Replace `after:bg-binding` with `after:bg-accent` (line 5).
  - Replace `text-binding` with `text-accent` (line 15).

- [ ] **Step 5.5:** `frontend/src/components/SearchBar.jsx`
  - Replace `focus-visible:ring-binding` with `focus-visible:ring-accent` (line 68).

- [ ] **Step 5.6:** `frontend/src/components/ToastProvider.jsx`
  - Replace `border-moss/40 bg-moss text-page` with `border-success/40 bg-success text-page` (line 73).

- [ ] **Step 5.7:** `frontend/src/pages/Books.jsx`
  - Replace `text-binding` with `text-accent` (line 172).

- [ ] **Step 5.8:** Verify only Home.jsx and BookCard.jsx still reference the old keys.

  ```powershell
  Select-String -Path frontend/src -Pattern "binding|gilt|moss" -Recurse |
    Where-Object { $_.Path -notmatch "Home\.jsx$|BookCard\.jsx$" }
  ```

  Expected: empty (or only matches inside code comments — flag those).

---

## Task 6 — `frontend/src/index.css` cleanup

**File:** `frontend/src/index.css`

- [ ] **Step 6.1:** Rename token references in the `@layer base` and `@layer components` blocks.
  - Line 15: `ring-binding` → `ring-accent`.
  - Line 18: `bg-binding/15` → `bg-accent/15`.
  - Line 41: `bg-binding text-page hover:bg-binding-hover` → `bg-accent text-page hover:bg-accent-hover`.

- [ ] **Step 6.2:** Delete the `.shelf`, `.spine`, `.spine-title`, `.empty-shelf`, `.empty-shelf .ghost-spine` rules and the `@media (prefers-reduced-motion: reduce) { .spine ... }` block — lines 48–161 of the original file.

  After deletion, the file ends after the `@layer components { ... }` block.

- [ ] **Step 6.3:** Verify.

  ```powershell
  Select-String -Path frontend/src/index.css -Pattern "binding|gilt|moss|\.shelf|\.spine|\.empty-shelf|ghost-spine"
  ```

  Expected: no matches.

---

## Task 7 — Update `Home.test.jsx` (red, then green via Tasks 8–9)

This is the test-driven gate. We rewrite the assertions FIRST so the rewrite of `Home.jsx` has a target.

**File:** `frontend/src/pages/Home.test.jsx`

- [ ] **Step 7.1:** Replace the entire file with:

  ```jsx
  import { describe, expect, it } from 'vitest';
  import { render, screen, waitFor, within } from '@testing-library/react';
  import { MemoryRouter } from 'react-router-dom';
  import Home from './Home.jsx';
  import { server } from '../test/setup.js';
  import { okBooks } from '../test/handlers.js';

  function renderHome() {
    return render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );
  }

  // The stats block is the section that contains the "Library at a glance" heading.
  const statsRegion = () => {
    const heading = screen.getByRole('heading', { name: /library at a glance/i });
    const region = heading.closest('section');
    if (!region) throw new Error('stats region not found');
    return within(region);
  };

  describe('Home', () => {
    it('renders the hero', async () => {
      renderHome();
      expect(screen.getByText(/a personal library/i)).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { level: 1, name: /every book you own/i }),
      ).toBeInTheDocument();
      const ctas = screen.getAllByRole('link', { name: /catalogue a new volume/i });
      expect(ctas.length).toBeGreaterThanOrEqual(1);
    });

    it('shows zero stats and the empty-chart hint when no books exist', async () => {
      server.use(okBooks([]));
      renderHome();
      await waitFor(() => {
        const s = statsRegion();
        // Three metrics rendered: Volumes, % Read, Genres. All zero.
        const zeros = s.getAllByText(/^(0|0%)$/);
        expect(zeros.length).toBeGreaterThanOrEqual(3);
      });
      expect(
        screen.getByText(/add a book and mark it read to start seeing your reading patterns/i),
      ).toBeInTheDocument();
      expect(screen.queryByText(/NaN/i)).toBeNull();
    });

    it('reflects the mocked /books response in the stats block + bar chart', async () => {
      server.use(
        okBooks([
          {
            id: 1,
            book_name: 'Atomic Habits',
            author: 'James Clear',
            genre: 'Self Help',
            status: 'Read',
            created_at: '2026-01-01T00:00:00Z',
          },
          {
            id: 2,
            book_name: 'Deep Work',
            author: 'Cal Newport',
            genre: 'Self Help',
            status: 'Read',
            created_at: '2026-01-02T00:00:00Z',
          },
          {
            id: 3,
            book_name: 'The Atomic Café',
            author: 'Jane Doe',
            genre: 'History',
            status: 'Unread',
            created_at: '2026-01-03T00:00:00Z',
          },
        ]),
      );

      renderHome();
      await waitFor(() => {
        const s = statsRegion();
        // total=3, %read = round(2/3*100) = 67, genres=2
        expect(s.getByText('3')).toBeInTheDocument();
        expect(s.getByText('67%')).toBeInTheDocument();
        expect(s.getByText('2')).toBeInTheDocument();
      });

      // Bar chart: Self Help (2 reads) appears as a labeled row.
      const chart = screen.getByRole('list', { name: /reads by genre/i });
      expect(within(chart).getByText(/self help/i)).toBeInTheDocument();
    });

    it('has no horizontal scroll at 360px', async () => {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: 360 });
      window.dispatchEvent(new Event('resize'));
      renderHome();
      await waitFor(() => {
        expect(document.body.scrollWidth).toBeLessThanOrEqual(360);
      });
    });
  });
  ```

- [ ] **Step 7.2:** Run the Home tests; expect 3 of 4 to fail (red) because `Home.jsx` still has the old structure.

  ```powershell
  cd frontend; npm test -- --run src/pages/Home.test.jsx; cd ..
  ```

  Expected: the first and last tests pass; the two middle tests fail with selectors not finding `Library at a glance` heading.

---

## Task 8 — Rewrite `BookCard.jsx`

**File:** `frontend/src/components/BookCard.jsx`

- [ ] **Step 8.1:** Replace the entire file with:

  ```jsx
  import { Link } from 'react-router-dom';

  export function BookCard({ book, onEdit, onDelete }) {
    const isRead = book.status === 'Read';
    return (
      <article
        className={`group relative flex h-full min-h-[180px] flex-col rounded-md border border-hairline bg-card p-5 transition-shadow hover:shadow-md border-l-2 ${
          isRead ? 'border-l-accent' : 'border-l-hairline'
        }`}
      >
        <span className="sr-only">{isRead ? 'Read' : 'Queued'}</span>
        <h3 className="font-body text-h2 font-semibold leading-snug text-ink line-clamp-3">
          {book.book_name}
        </h3>
        <p className="mt-1 text-small text-mute">{book.author}</p>
        <p className="mt-2 text-caption uppercase tracking-[0.08em] text-mute">{book.genre}</p>
        <div className="mt-auto flex items-center justify-end gap-4 pt-4">
          <Link
            to={`/edit/${book.id}`}
            className="text-small text-mute transition-colors hover:text-accent"
            onClick={onEdit}
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={() => onDelete?.(book)}
            className="text-small font-medium text-danger transition-colors hover:underline"
          >
            Delete
          </button>
        </div>
      </article>
    );
  }
  ```

- [ ] **Step 8.2:** Verify the file no longer imports `spineColorFor` and no longer defines `StatusBadge`.

  ```powershell
  Select-String -Path frontend/src/components/BookCard.jsx -Pattern "spineColorFor|StatusBadge"
  ```

  Expected: no matches.

---

## Task 9 — Rewrite `Home.jsx`

**File:** `frontend/src/pages/Home.jsx`

- [ ] **Step 9.1:** Replace the entire file with:

  ```jsx
  import { useEffect, useState } from 'react';
  import { Link } from 'react-router-dom';
  import { getBooks } from '../services/api.js';

  const FEATURES = [
    {
      eyebrow: 'I',
      title: 'Catalogue with care',
      body: 'Four fields per book — title, author, genre, status. No padding, no busywork.',
    },
    {
      eyebrow: 'II',
      title: 'Find a volume in a beat',
      body: 'Search by title or author; filter by author, genre, or reading status.',
    },
    {
      eyebrow: 'III',
      title: 'Browse your shelf',
      body: 'Every book on a single page, the way you arranged it last.',
    },
    {
      eyebrow: 'IV',
      title: 'Track the read pile',
      body: 'Mark a book Read or Unread. The shelf shows you what is queued.',
    },
  ];

  function StatsBlock({ books }) {
    const loading = books === null;
    const list = books ?? [];
    const total = list.length;
    const read = list.filter((b) => b.status === 'Read').length;
    const pctRead = total === 0 ? 0 : Math.round((read / total) * 100);
    const genres = new Set(list.map((b) => b.genre).filter(Boolean)).size;

    // Reads-by-genre — only books marked Read, descending count.
    const readsByGenre = (() => {
      const counts = new Map();
      for (const b of list) {
        if (b.status !== 'Read' || !b.genre) continue;
        counts.set(b.genre, (counts.get(b.genre) ?? 0) + 1);
      }
      const rows = [...counts.entries()]
        .map(([genre, count]) => ({ genre, count }))
        .sort((a, b) => b.count - a.count);
      return rows;
    })();

    const maxCount = readsByGenre.reduce((m, r) => Math.max(m, r.count), 0);
    const visible = readsByGenre.slice(0, 6);
    const overflow = Math.max(0, readsByGenre.length - visible.length);
    const showEmptyHint = !loading && (total === 0 || readsByGenre.length === 0);

    const Number = ({ children }) => (
      <p className="font-display text-display-2 font-bold leading-none text-ink tabular-nums">
        {children}
      </p>
    );

    return (
      <section className="container-page mt-16">
        <h2 className="sr-only">Library at a glance</h2>
        <div className="rounded-lg border border-hairline bg-card p-8 md:p-10">
          {/* Row 1 — three big metrics */}
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <Number>{loading ? '—' : total}</Number>
              <p className="mt-2 text-caption uppercase tracking-[0.08em] text-mute">Volumes</p>
            </div>
            <div>
              <Number>{loading ? '—' : `${pctRead}%`}</Number>
              <p className="mt-2 text-caption uppercase tracking-[0.08em] text-mute">Read</p>
            </div>
            <div>
              <Number>{loading ? '—' : genres}</Number>
              <p className="mt-2 text-caption uppercase tracking-[0.08em] text-mute">Genres</p>
            </div>
          </div>

          {/* Row 2 — reads-by-genre bar chart */}
          <div className="mt-8 border-t border-hairline pt-8">
            <p className="text-caption uppercase tracking-[0.08em] text-mute">Reads by genre</p>
            {loading ? (
              <p className="mt-4 text-small text-mute">Loading library…</p>
            ) : showEmptyHint ? (
              <p className="mt-4 text-small text-mute">
                Add a book and mark it Read to start seeing your reading patterns.
              </p>
            ) : (
              <ul className="mt-4 space-y-3" aria-label="Reads by genre">
                {visible.map((row) => {
                  const widthPct = Math.max(8, (row.count / maxCount) * 100);
                  return (
                    <li key={row.genre} className="flex items-center gap-4">
                      <span className="w-28 shrink-0 text-small text-ink">{row.genre}</span>
                      <span
                        className="relative h-2 flex-1 overflow-hidden rounded-sm bg-accent-soft"
                        aria-hidden="true"
                      >
                        <span
                          className="absolute inset-y-0 left-0 block rounded-sm bg-accent"
                          style={{ width: `${widthPct}%` }}
                        />
                      </span>
                      <span className="w-6 shrink-0 text-right text-small font-medium text-mute tabular-nums">
                        {row.count}
                      </span>
                    </li>
                  );
                })}
                {overflow > 0 && (
                  <li className="text-small text-mute">+ {overflow} more</li>
                )}
              </ul>
            )}
          </div>
        </div>
      </section>
    );
  }

  export default function Home() {
    const [books, setBooks] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
      let cancelled = false;
      setError(null);
      getBooks()
        .then((data) => {
          if (!cancelled) setBooks(data);
        })
        .catch((err) => {
          if (!cancelled) {
            setBooks([]);
            setError(err.message ?? 'Could not reach the library.');
          }
        });
      return () => {
        cancelled = true;
      };
    }, []);

    return (
      <>
        {/* Hero */}
        <section className="container-page pt-16 md:pt-24">
          <p className="eyebrow">A personal library</p>
          <h1 className="mt-4 font-display text-display-1 font-bold leading-[1.02] tracking-[-0.02em] text-ink">
            Every book you own,
            <br />
            <em className="font-display italic font-normal text-ink">on one quiet shelf.</em>
          </h1>
          <p className="mt-6 max-w-[44ch] text-body text-ink/75">
            Catalogue a volume in seconds, mark it read or unread, then find it again
            the next time someone asks you what you&apos;ve been reading.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/add" className="btn-primary">
              Catalogue a new volume
            </Link>
            <Link to="/books" className="btn-secondary">
              View the shelf
            </Link>
          </div>
          {error && (
            <p className="mt-6 text-small text-danger" role="status">
              {error} (start the backend, then refresh.)
            </p>
          )}
        </section>

        {/* Stats block */}
        <StatsBlock books={books} />

        {/* Features I–IV */}
        <section className="container-page mt-24">
          <p className="eyebrow">What the library knows how to do</p>
          <div className="mt-6 grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <article key={f.eyebrow} className="border-t border-ink pt-5">
                <p className="font-display text-h3 font-bold text-accent">{f.eyebrow}</p>
                <h3 className="mt-2 font-display text-h2 font-bold text-ink">{f.title}</h3>
                <p className="mt-2 text-small text-ink/70">{f.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="container-page my-24">
          <div className="rounded-lg border border-hairline bg-card p-8 md:p-12">
            <div className="grid items-center gap-6 md:grid-cols-12">
              <div className="md:col-span-8">
                <p className="eyebrow">Begin</p>
                <h2 className="mt-3 font-display text-h1 font-bold text-ink">
                  The first volume is the hardest. The rest catalogue themselves.
                </h2>
              </div>
              <div className="md:col-span-4 md:text-right">
                <Link to="/add" className="btn-primary">
                  Catalogue a new volume
                </Link>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }
  ```

- [ ] **Step 9.2:** Verify the file no longer references removed identifiers.

  ```powershell
  Select-String -Path frontend/src/pages/Home.jsx -Pattern "Spine|EmptyShelf|StatCard|spineColorFor|Library card|By the numbers|binding|gilt|moss"
  ```

  Expected: no matches.

---

## Task 10 — Verify all green

- [ ] **Step 10.1:** Run the full vitest suite.

  ```powershell
  cd frontend; npm test -- --run; cd ..
  ```

  Expected: `Tests  35 passed (35)`. If anything fails, diagnose using `systematic-debugging` skill rules — do not patch over.

- [ ] **Step 10.2:** Lint.

  ```powershell
  cd frontend; npm run lint; cd ..
  ```

  Expected: exits 0 with no output (max-warnings 0).

- [ ] **Step 10.3:** Build.

  ```powershell
  cd frontend; npm run build; cd ..
  ```

  Expected: exits 0; printed JS gzip within ±10 KB of 80.74 KB.

- [ ] **Step 10.4:** No raw hex in JSX.

  ```powershell
  Select-String -Path frontend/src -Pattern "#[0-9a-fA-F]{3,8}" -Include "*.jsx" -Recurse
  ```

  Expected: no matches.

- [ ] **Step 10.5:** No `binding`/`gilt`/`moss` anywhere in `frontend/src`.

  ```powershell
  Select-String -Path frontend/src -Pattern "binding|gilt|moss" -Recurse
  ```

  Expected: no matches (the only legitimate place was tokens.js + Tailwind config, and those are now updated).

If any check fails, fix and re-run that check before moving on.

---

## Task 11 — D9 supersession banner

**File:** `docs/product/D9-DESIGN-SPEC.md`

- [ ] **Step 11.1:** Insert this banner immediately below the `# D9 — Design System & Visual Spec` heading (or whatever the H1 currently reads):

  ```markdown
  > **Status (2026-06-30):** §3 Color, §3 Typography, §6 Home, and §6 BookCard are **superseded** by `docs/superpowers/specs/2026-06-29-frontend-redesign-design.md` (implemented in packet S-014). All other sections — §4 Responsive, §5 Motion, §accessibility, §spacing — remain authoritative.
  ```

  No other edits to D9.

---

## Task 12 — Manual live smoke (AC-13)

- [ ] **Step 12.1:** Start backend in one terminal (PowerShell):

  ```powershell
  backend/.venv/Scripts/python.exe -m uvicorn backend.main:app --reload --port 8000
  ```

- [ ] **Step 12.2:** Start frontend in another:

  ```powershell
  cd frontend; npm run dev
  ```

- [ ] **Step 12.3:** Open `http://localhost:5173` in a browser. Confirm:
  - Hero headline renders in Tinos 700.
  - Stats block shows 3 metrics (volumes / read / genres) and a bar chart with ≥1 row (since `books_dev` has `Atomic Habits` Read).
  - `/books`: each `BookCard` shows a 2-px left border — indigo if Read, light grey otherwise.
  - `/add`: form CTA is indigo; focus rings on inputs are indigo.
  - Resize browser to 360 px — no horizontal scroll, stats block stacks.

- [ ] **Step 12.4:** Take a screenshot of the Home page in browser. Attach to `Evidence.md` under AC-13.

---

## Task 13 — Evidence

- [ ] **Step 13.1:** Populate `packets/S-014-frontend-redesign/Evidence.md` per the template at the end of `ENG-QA_prompt.md`. Verdict GREEN only if every AC passes.

- [ ] **Step 13.2:** Update `CLAUDE.md` §5 packet table row for S-014.

- [ ] **Step 13.3:** Update `Project_Progress_Tracker.xlsx` if accessible; if not, leave a note in Evidence that it needs manual update.

---

## Commit policy

Frequent small commits. Suggested boundaries:

1. After Task 2 — "S-014: fonts → Tinos + Poppins"
2. After Task 4 — "S-014: tokens + Tailwind config to indigo accent"
3. After Task 5 — "S-014: sweep binding→accent / moss→success across components"
4. After Task 6 — "S-014: index.css — drop spine-shelf rules; ring/selection → accent"
5. After Task 7 — "S-014: Home.test.jsx — assertions for new stats block"
6. After Task 9 — "S-014: BookCard + Home redesigned"
7. After Task 10 — "S-014: tests green; lint clean; build clean"
8. After Task 11 — "S-014: D9 supersession banner"
9. After Task 13 — "S-014: GREEN — Evidence written"

Do not push until Task 10 is green.

---

**End of BUILD prompt.**
