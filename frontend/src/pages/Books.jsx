import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookCard } from '../components/BookCard.jsx';
import { ConfirmModal } from '../components/ConfirmModal.jsx';
import { FilterDropdown } from '../components/FilterDropdown.jsx';
import { SearchBar } from '../components/SearchBar.jsx';
import { useToast } from '../components/ToastProvider.jsx';
import { deleteBook, getBooks } from '../services/api.js';

const FILTER_KEYS = ['search', 'author', 'genre', 'status'];

function readParams(sp) {
  const out = {};
  for (const k of FILTER_KEYS) {
    const v = sp.get(k);
    if (v != null && v !== '') out[k] = v;
  }
  return out;
}

function uniqueSorted(values) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' }),
  );
}

function EmptyState({ filtered }) {
  if (filtered) {
    return (
      <div className="mx-auto max-w-xl rounded-lg border border-dashed border-hairline bg-card p-10 text-center">
        <p className="eyebrow">No matches</p>
        <h2 className="mt-3 font-display text-h1 text-ink">Nothing on this shelf</h2>
        <p className="mt-3 text-body text-ink/70">
          Try a different search term or clear a filter to see more volumes.
        </p>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-xl rounded-lg border border-dashed border-hairline bg-card p-10 text-center">
      <p className="eyebrow">Your shelf is empty</p>
      <h2 className="mt-3 font-display text-h1 text-ink">Catalogue your first volume</h2>
      <p className="mt-3 text-body text-ink/70">
        Add a book and it&apos;ll appear here. You can mark it Read or leave it queued for later.
      </p>
      <div className="mt-6">
        <Link to="/add" className="btn-primary">
          Catalogue a new volume
        </Link>
      </div>
    </div>
  );
}

function LoadError({ message, onRetry }) {
  return (
    <div className="mx-auto max-w-xl rounded-lg border border-danger/30 bg-danger/10 p-6 text-center" role="alert">
      <p className="eyebrow text-danger">Couldn&apos;t load the shelf</p>
      <p className="mt-2 text-small text-ink/80">{message}</p>
      <button type="button" onClick={onRetry} className="btn-secondary mt-4">
        Try again
      </button>
    </div>
  );
}

export default function Books() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState(null);
  const [error, setError] = useState(null);
  const [target, setTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  const searchKey = searchParams.toString();

  const load = useCallback(() => {
    setError(null);
    setBooks(null);
    const params = readParams(new URLSearchParams(searchKey));
    getBooks(params)
      .then(setBooks)
      .catch((err) => {
        setError(err.message ?? 'Network error.');
        setBooks([]);
      });
  }, [searchKey]);

  useEffect(() => {
    load();
  }, [load]);

  const onConfirmDelete = async () => {
    if (!target) return;
    setDeleting(true);
    try {
      await deleteBook(target.id);
      setBooks((current) => (current ?? []).filter((b) => b.id !== target.id));
      toast.success(`Removed “${target.book_name}”.`);
      setTarget(null);
    } catch (err) {
      const detail = err?.response?.data?.detail ?? "Couldn't delete the book.";
      toast.error(typeof detail === 'string' ? detail : "Couldn't delete the book.");
    } finally {
      setDeleting(false);
    }
  };

  const setParam = useCallback(
    (key, value) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (!value) next.delete(key);
          else next.set(key, value);
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const currentParams = useMemo(() => readParams(searchParams), [searchParams]);
  const authorOptions = useMemo(
    () => uniqueSorted((books ?? []).map((b) => b.author)),
    [books],
  );
  const genreOptions = useMemo(
    () => uniqueSorted((books ?? []).map((b) => b.genre)),
    [books],
  );

  const search = currentParams.search ?? '';
  const author = currentParams.author ?? '';
  const genre = currentParams.genre ?? '';
  const status = currentParams.status ?? '';
  const searchActive = search !== '';
  const filterCount = FILTER_KEYS.filter((k) => currentParams[k]).length;

  const loading = books === null;
  const empty = !loading && books.length === 0 && !error;

  return (
    <section className="container-page py-12">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Shelf</p>
          <h1 className="mt-3 font-display text-display-2 text-ink">Every volume on hand</h1>
        </div>
        <Link to="/add" className="btn-primary">
          Catalogue a new volume
        </Link>
      </header>

      {/*
        Filter bar — designed in S-012 via frontend-design + ui-ux-pro-max.
        Pattern: a single bordered catalogue-card divided by hairlines into 4 cells
        (FIND / AUTHOR / GENRE / STATUS). Each cell carries its own eyebrow label
        that flips text-mute → text-accent with a leading • when its value is
        non-default — two-channel indicator (color + glyph), so the AC8 rule on
        color-only meaning is respected.
      */}
      <div
        className="sticky top-0 z-20 mb-8 rounded-md border border-hairline bg-card/95 backdrop-blur-sm"
        aria-label="Filters"
      >
        <div className="border-b border-hairline p-4">
          <label
            htmlFor="filter-search"
            className={`block text-caption font-medium uppercase tracking-[0.06em] ${
              searchActive ? 'text-accent' : 'text-mute'
            }`}
          >
            {searchActive ? '• Find' : 'Find'}
          </label>
          <div className="mt-2">
            <SearchBar
              inputId="filter-search"
              value={search}
              onChange={(v) => setParam('search', v)}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 divide-y divide-hairline md:grid-cols-3 md:divide-x md:divide-y-0">
          <div className="p-4">
            <FilterDropdown
              label="Author"
              anyLabel="Any author"
              options={authorOptions}
              value={author}
              onChange={(v) => setParam('author', v)}
            />
          </div>
          <div className="p-4">
            <FilterDropdown
              label="Genre"
              anyLabel="Any genre"
              options={genreOptions}
              value={genre}
              onChange={(v) => setParam('genre', v)}
            />
          </div>
          <div className="p-4">
            <FilterDropdown
              label="Status"
              anyLabel="Any"
              options={['Read', 'Unread']}
              value={status}
              onChange={(v) => setParam('status', v)}
            />
          </div>
        </div>
      </div>

      {loading && (
        <ul
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          aria-label="Loading shelf"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <li
              key={i}
              className="h-[180px] animate-pulse rounded-md border border-hairline bg-card"
            />
          ))}
        </ul>
      )}

      {!loading && error && books.length === 0 && (
        <LoadError message={error} onRetry={load} />
      )}

      {empty && <EmptyState filtered={filterCount > 0} />}

      {!loading && books.length > 0 && (
        <ul
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          aria-label="Books on the shelf"
        >
          {books.map((b) => (
            <li key={b.id}>
              <BookCard book={b} onDelete={(book) => setTarget(book)} />
            </li>
          ))}
        </ul>
      )}

      <ConfirmModal
        open={target !== null}
        title="Remove this volume?"
        description={
          target
            ? `“${target.book_name}” by ${target.author} will be removed from your library. This can't be undone.`
            : ''
        }
        confirmLabel={deleting ? 'Removing…' : 'Remove'}
        cancelLabel="Keep"
        destructive
        loading={deleting}
        onConfirm={onConfirmDelete}
        onCancel={() => (deleting ? null : setTarget(null))}
      />
    </section>
  );
}
