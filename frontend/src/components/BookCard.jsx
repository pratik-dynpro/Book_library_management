import { Link } from 'react-router-dom';
import { spineColorFor } from '../design/tokens.js';

function StatusBadge({ status }) {
  if (status === 'Read') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-sm border border-gilt/40 bg-gilt/10 px-2 py-0.5 text-caption uppercase tracking-[0.18em] text-gilt">
        <span aria-hidden="true" className="h-[2px] w-3 bg-gilt" />
        Read
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-sm border border-dashed border-ink/30 px-2 py-0.5 text-caption uppercase tracking-[0.18em] text-ink/60">
      Queued
    </span>
  );
}

export function BookCard({ book, onEdit, onDelete }) {
  const stripe = spineColorFor(`${book.author}|${book.book_name}`);
  return (
    <article
      className="group relative flex h-full min-h-[180px] flex-col overflow-hidden rounded-md border border-hairline bg-card pl-5 pr-4 py-4 transition-shadow hover:shadow-md"
    >
      {/* spine stripe — matches the home shelf color for the same book */}
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1.5"
        style={{ background: stripe }}
      />

      <header className="flex items-start justify-between gap-3">
        <h3 className="font-display text-h3 leading-snug text-ink line-clamp-3">
          {book.book_name}
        </h3>
        <StatusBadge status={book.status} />
      </header>

      <p className="mt-1 text-small text-ink/75">{book.author}</p>
      <p className="mt-2 text-caption uppercase tracking-[0.18em] text-mute">{book.genre}</p>

      <div className="mt-auto flex items-center justify-end gap-4 pt-4">
        <Link
          to={`/edit/${book.id}`}
          className="text-small text-ink/80 transition-colors hover:text-binding"
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
