import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const ToastContext = createContext(null);

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timeouts = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
    const handle = timeouts.current.get(id);
    if (handle) {
      clearTimeout(handle);
      timeouts.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (variant, message) => {
      const id = nextId++;
      setToasts((t) => [...t, { id, variant, message }]);
      const handle = setTimeout(() => dismiss(id), 3500);
      timeouts.current.set(id, handle);
      return id;
    },
    [dismiss],
  );

  useEffect(
    () => () => {
      for (const h of timeouts.current.values()) clearTimeout(h);
      timeouts.current.clear();
    },
    [],
  );

  const value = useMemo(
    () => ({
      success: (m) => push('success', m),
      error: (m) => push('error', m),
      info: (m) => push('info', m),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastViewport({ toasts, onDismiss }) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex flex-col items-center gap-2 px-4"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <Toast key={t.id} {...t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
}

function Toast({ variant, message, onDismiss }) {
  const tone =
    variant === 'success'
      ? 'border-success/40 bg-success text-page'
      : variant === 'error'
        ? 'border-danger/40 bg-danger text-page'
        : 'border-ink/30 bg-ink text-page';
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      className={`pointer-events-auto inline-flex max-w-[34rem] items-center gap-3 rounded-md border px-4 py-3 text-small shadow-md ${tone}`}
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="ml-2 text-page/80 hover:text-page"
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}
