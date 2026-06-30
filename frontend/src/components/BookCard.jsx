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
