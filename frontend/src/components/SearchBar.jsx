import { useEffect, useRef, useState } from 'react';

const DEBOUNCE_MS = 250;

export function SearchBar({ value, onChange, inputId = 'filter-search' }) {
  const [text, setText] = useState(value ?? '');
  const timerRef = useRef(null);
  const lastEmittedRef = useRef(value ?? '');

  // Mirror committed (URL) value when it changes outside (e.g. back navigation, ×).
  useEffect(() => {
    setText(value ?? '');
    lastEmittedRef.current = value ?? '';
  }, [value]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const emit = (next) => {
    if (next === lastEmittedRef.current) return;
    lastEmittedRef.current = next;
    onChange(next);
  };

  const onInput = (e) => {
    const next = e.target.value;
    setText(next);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => emit(next), DEBOUNCE_MS);
  };

  const clear = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setText('');
    emit('');
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape' && text) {
      e.preventDefault();
      clear();
    }
  };

  return (
    <div className="relative flex items-center">
      <input
        id={inputId}
        type="search"
        value={text}
        onChange={onInput}
        onKeyDown={onKeyDown}
        placeholder="Title or author"
        enterKeyHint="search"
        autoComplete="off"
        aria-label="Search"
        className="w-full border-0 bg-transparent pr-12 text-body text-ink outline-none placeholder:text-mute/80 focus:outline-none focus-visible:outline-none"
      />
      {text && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={clear}
          className="absolute right-0 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-sm text-mute transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <path
              d="M3 3 L13 13 M13 3 L3 13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
