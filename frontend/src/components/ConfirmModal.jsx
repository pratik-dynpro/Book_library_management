import { useEffect, useRef } from 'react';

/**
 * Accessible confirm modal.
 *  - role="dialog" aria-modal="true"
 *  - focus is moved into the dialog on open and restored on close
 *  - ESC dismisses; click-outside dismisses
 *  - Tab cycles within the dialog (focus trap)
 */
export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  destructive = false,
}) {
  const dialogRef = useRef(null);
  const prevFocus = useRef(null);

  useEffect(() => {
    if (!open) return;
    prevFocus.current = document.activeElement;
    // Move focus into the dialog (first focusable button)
    const focusables = dialogRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusables?.[0]?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (!loading) onCancel?.();
        return;
      }
      if (e.key === 'Tab' && focusables && focusables.length > 0) {
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (prevFocus.current && prevFocus.current.focus) prevFocus.current.focus();
    };
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center px-4"
      role="presentation"
    >
      {/* scrim */}
      <button
        type="button"
        aria-label="Dismiss dialog"
        onClick={() => !loading && onCancel?.()}
        className="absolute inset-0 bg-black/55"
      />
      {/* dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby={description ? 'confirm-desc' : undefined}
        className="relative w-full max-w-md rounded-lg border border-hairline bg-card p-6 shadow-xl"
      >
        <h2 id="confirm-title" className="font-display text-h2 text-ink">
          {title}
        </h2>
        {description && (
          <p id="confirm-desc" className="mt-3 text-body text-ink/75">
            {description}
          </p>
        )}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="btn-secondary disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`btn inline-flex items-center gap-2 ${
              destructive
                ? 'bg-danger text-page hover:bg-danger/90'
                : 'bg-binding text-page hover:bg-binding-hover'
            } disabled:opacity-60`}
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
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
