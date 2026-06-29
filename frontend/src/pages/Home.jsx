import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getBooks } from '../services/api.js';
import { spineColorFor } from '../design/tokens.js';

function Spine({ book }) {
  const color = spineColorFor(`${book.author}|${book.book_name}`);
  return (
    <div
      className="spine"
      style={{ background: color }}
      data-status={book.status}
      title={`${book.book_name} — ${book.author} · ${book.status}`}
    >
      <span className="spine-title">{book.book_name}</span>
    </div>
  );
}

function EmptyShelf() {
  return (
    <div className="empty-shelf" aria-hidden="true">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="ghost-spine" />
      ))}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border border-hairline bg-card px-5 py-6">
      <p className="eyebrow">{label}</p>
      <p className="mt-3 font-display text-display-2 leading-none text-ink tabular-nums">
        {value}
      </p>
    </div>
  );
}

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

  const stats = useMemo(() => {
    const list = books ?? [];
    const read = list.filter((b) => b.status === 'Read').length;
    const unread = list.length - read;
    const genres = new Set(list.map((b) => b.genre)).size;
    return { total: list.length, read, unread, genres };
  }, [books]);

  const shelf = (books ?? []).slice(0, 14);

  return (
    <>
      {/* Hero */}
      <section className="container-page pt-16 md:pt-24">
        <div className="grid items-end gap-10 md:grid-cols-12">
          <header className="md:col-span-8">
            <p className="eyebrow">A personal library</p>
            <h1 className="mt-4 font-display text-display-1 leading-[1.02] tracking-[-0.02em] text-ink">
              Every book you own,
              <br />
              <em className="font-display italic text-binding">on one quiet shelf.</em>
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
          </header>

          {/* Index card — small editorial flourish */}
          <aside className="md:col-span-4">
            <div className="rounded-md border border-hairline bg-card p-5">
              <p className="eyebrow">Library card · No. 001</p>
              <dl className="mt-4 space-y-2 text-small text-ink/80">
                <div className="flex justify-between border-b border-dashed border-hairline pb-2">
                  <dt className="text-mute">Volumes</dt>
                  <dd className="tabular-nums">{stats.total}</dd>
                </div>
                <div className="flex justify-between border-b border-dashed border-hairline pb-2">
                  <dt className="text-mute">Read</dt>
                  <dd className="tabular-nums">{stats.read}</dd>
                </div>
                <div className="flex justify-between border-b border-dashed border-hairline pb-2">
                  <dt className="text-mute">Queued</dt>
                  <dd className="tabular-nums">{stats.unread}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-mute">Genres</dt>
                  <dd className="tabular-nums">{stats.genres}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>

        {/* The shelf — signature element */}
        <div className="mt-14">
          <div className="mb-3 flex items-baseline justify-between">
            <p className="eyebrow">Your shelf · most recent first</p>
            {stats.total > shelf.length && (
              <Link to="/books" className="text-small text-binding hover:underline">
                see all {stats.total}
              </Link>
            )}
          </div>
          {books === null ? (
            <EmptyShelf />
          ) : shelf.length === 0 ? (
            <div className="empty-shelf">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="ghost-spine" />
              ))}
            </div>
          ) : (
            <div className="shelf" role="list" aria-label="Books on the shelf">
              {shelf.map((b) => (
                <div role="listitem" key={b.id}>
                  <Spine book={b} />
                </div>
              ))}
            </div>
          )}
          {error && (
            <p className="mt-3 text-small text-danger" role="status">
              {error} (showing zero books — start the backend, then refresh.)
            </p>
          )}
        </div>
      </section>

      {/* Stats grid */}
      <section className="container-page mt-20">
        <p className="eyebrow">By the numbers</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total volumes" value={stats.total} />
          <StatCard label="Read" value={stats.read} />
          <StatCard label="Queued" value={stats.unread} />
          <StatCard label="Genres" value={stats.genres} />
        </div>
      </section>

      {/* Features — numbered I–IV (Roman numerals fit the editorial frame) */}
      <section className="container-page mt-24">
        <p className="eyebrow">What the library knows how to do</p>
        <div className="mt-6 grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <article key={f.eyebrow} className="border-t border-ink pt-5">
              <p className="font-display text-h3 text-binding">{f.eyebrow}</p>
              <h3 className="mt-2 font-display text-h2 text-ink">{f.title}</h3>
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
              <h2 className="mt-3 font-display text-h1 text-ink">
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
