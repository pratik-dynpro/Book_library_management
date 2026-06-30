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
  const counts = new Map();
  for (const b of list) {
    if (b.status !== 'Read' || !b.genre) continue;
    counts.set(b.genre, (counts.get(b.genre) ?? 0) + 1);
  }
  const readsByGenre = [...counts.entries()]
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count);

  const maxCount = readsByGenre.reduce((m, r) => Math.max(m, r.count), 0);
  const visible = readsByGenre.slice(0, 6);
  const overflow = Math.max(0, readsByGenre.length - visible.length);
  const showEmptyHint = !loading && (total === 0 || readsByGenre.length === 0);

  return (
    <section className="container-page mt-16">
      <h2 className="sr-only">Library at a glance</h2>
      <div className="rounded-lg border border-hairline bg-card p-8 md:p-10">
        {/* Row 1 — three big metrics */}
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="font-display text-display-2 font-bold leading-none text-ink tabular-nums">
              {loading ? '—' : total}
            </p>
            <p className="mt-2 text-caption uppercase tracking-[0.08em] text-mute">Volumes</p>
          </div>
          <div>
            <p className="font-display text-display-2 font-bold leading-none text-ink tabular-nums">
              {loading ? '—' : `${pctRead}%`}
            </p>
            <p className="mt-2 text-caption uppercase tracking-[0.08em] text-mute">Read</p>
          </div>
          <div>
            <p className="font-display text-display-2 font-bold leading-none text-ink tabular-nums">
              {loading ? '—' : genres}
            </p>
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
                const noun = row.count === 1 ? 'book' : 'books';
                return (
                  <li
                    key={row.genre}
                    className="flex items-center gap-4"
                    title={`${row.count} ${noun} read in ${row.genre}`}
                  >
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
              {overflow > 0 && <li className="text-small text-mute">+ {overflow} more</li>}
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
          Catalogue a volume in seconds, mark it read or unread, then find it again the next time
          someone asks you what you&apos;ve been reading.
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
