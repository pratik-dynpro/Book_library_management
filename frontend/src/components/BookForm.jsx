import { useMemo, useState } from 'react';

const DEFAULTS = {
  book_name: '',
  author: '',
  genre: '',
  status: 'Unread',
};

const LIMITS = {
  book_name: 255,
  author: 255,
  genre: 100,
};

function Required() {
  return (
    <span aria-hidden="true" className="ml-0.5 text-binding">
      *
    </span>
  );
}

function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-small text-danger">
      {message}
    </p>
  );
}

function classNames(...xs) {
  return xs.filter(Boolean).join(' ');
}

/**
 * Shared add/edit form. The parent owns submit, loading, and server errors.
 *
 *   <BookForm
 *     initialValues={...}
 *     onSubmit={values => api.createBook(values)}
 *     submitLabel="Save"
 *     loading={loading}
 *     serverErrors={{ book_name: '...' }}
 *     onCancel={() => navigate('/books')}
 *   />
 */
export function BookForm({
  initialValues,
  onSubmit,
  submitLabel = 'Save',
  loading = false,
  serverErrors = {},
  onCancel,
}) {
  const initial = useMemo(() => ({ ...DEFAULTS, ...(initialValues ?? {}) }), [initialValues]);
  const [values, setValues] = useState(initial);
  const [clientErrors, setClientErrors] = useState({});

  function errorFor(field) {
    return clientErrors[field] ?? serverErrors[field] ?? '';
  }

  function setField(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
    if (clientErrors[field]) setClientErrors((e) => ({ ...e, [field]: '' }));
  }

  function validate() {
    const errs = {};
    for (const f of ['book_name', 'author', 'genre']) {
      const v = (values[f] ?? '').trim();
      if (!v) errs[f] = 'This field is required.';
      else if (v.length > LIMITS[f]) errs[f] = `Max ${LIMITS[f]} characters.`;
    }
    if (values.status !== 'Read' && values.status !== 'Unread') {
      errs.status = 'Pick Read or Unread.';
    }
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;
    const errs = validate();
    setClientErrors(errs);
    if (Object.keys(errs).length > 0) {
      // Focus the first invalid field so keyboard users land where the error is (WCAG focus-management).
      const firstField = Object.keys(errs)[0];
      const node = document.getElementById(`bf-${firstField}`);
      node?.focus();
      return;
    }
    await onSubmit?.({
      book_name: values.book_name.trim(),
      author: values.author.trim(),
      genre: values.genre.trim(),
      status: values.status,
    });
  }

  const inputClass = (field) =>
    classNames(
      'mt-1.5 w-full rounded-md border bg-page px-3 py-2.5 text-body text-ink',
      'placeholder:text-mute',
      'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-binding focus-visible:ring-offset-2 focus-visible:ring-offset-page',
      errorFor(field) ? 'border-danger' : 'border-hairline',
    );

  return (
    <form noValidate onSubmit={handleSubmit} className="max-w-xl">
      <div className="grid gap-5">
        <div>
          <label htmlFor="bf-book_name" className="block text-small font-medium text-ink">
            Book name<Required />
          </label>
          <input
            id="bf-book_name"
            name="book_name"
            type="text"
            value={values.book_name}
            onChange={(e) => setField('book_name', e.target.value)}
            aria-required="true"
            aria-invalid={Boolean(errorFor('book_name'))}
            aria-describedby={errorFor('book_name') ? 'bf-book_name-error' : undefined}
            maxLength={LIMITS.book_name + 10}
            className={inputClass('book_name')}
            disabled={loading}
          />
          <FieldError id="bf-book_name-error" message={errorFor('book_name')} />
        </div>

        <div>
          <label htmlFor="bf-author" className="block text-small font-medium text-ink">
            Author<Required />
          </label>
          <input
            id="bf-author"
            name="author"
            type="text"
            value={values.author}
            onChange={(e) => setField('author', e.target.value)}
            aria-required="true"
            aria-invalid={Boolean(errorFor('author'))}
            aria-describedby={errorFor('author') ? 'bf-author-error' : undefined}
            maxLength={LIMITS.author + 10}
            className={inputClass('author')}
            disabled={loading}
          />
          <FieldError id="bf-author-error" message={errorFor('author')} />
        </div>

        <div>
          <label htmlFor="bf-genre" className="block text-small font-medium text-ink">
            Genre<Required />
          </label>
          <input
            id="bf-genre"
            name="genre"
            type="text"
            value={values.genre}
            onChange={(e) => setField('genre', e.target.value)}
            aria-required="true"
            aria-invalid={Boolean(errorFor('genre'))}
            aria-describedby={errorFor('genre') ? 'bf-genre-error' : undefined}
            maxLength={LIMITS.genre + 10}
            className={inputClass('genre')}
            disabled={loading}
          />
          <FieldError id="bf-genre-error" message={errorFor('genre')} />
        </div>

        <fieldset disabled={loading} aria-describedby={errorFor('status') ? 'bf-status-error' : undefined}>
          <legend className="text-small font-medium text-ink">
            Status<Required />
          </legend>
          <div className="mt-2 flex gap-6">
            <label className="inline-flex cursor-pointer items-center gap-2 text-body text-ink">
              <input
                id="bf-status"
                name="status"
                type="radio"
                value="Read"
                checked={values.status === 'Read'}
                onChange={(e) => setField('status', e.target.value)}
                className="accent-binding"
              />
              Read
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 text-body text-ink">
              <input
                name="status"
                type="radio"
                value="Unread"
                checked={values.status === 'Unread'}
                onChange={(e) => setField('status', e.target.value)}
                className="accent-binding"
              />
              Unread
            </label>
          </div>
          <FieldError id="bf-status-error" message={errorFor('status')} />
        </fieldset>
      </div>

      <div className="mt-8 flex items-center justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="btn-secondary disabled:opacity-60"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary inline-flex items-center gap-2 disabled:opacity-70"
        >
          {loading && (
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-4 w-4 animate-spin"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          )}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
