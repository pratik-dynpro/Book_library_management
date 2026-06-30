function slugify(s) {
  return s.toLowerCase().replace(/\s+/g, '-');
}

export function FilterDropdown({ label, anyLabel, options, value, onChange }) {
  const id = `filter-${slugify(label)}`;
  const isActive = value !== '' && value != null;

  return (
    <div>
      <label
        htmlFor={id}
        className={`block text-caption font-medium uppercase tracking-[0.06em] ${
          isActive ? 'text-accent' : 'text-mute'
        }`}
      >
        {isActive ? `• ${label}` : label}
      </label>
      <div className="relative mt-2">
        <select
          id={id}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full cursor-pointer appearance-none border-0 bg-transparent pr-6 text-body text-ink outline-none focus:outline-none focus-visible:outline-none"
        >
          <option value="">{anyLabel}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 10 6"
          width="10"
          height="6"
          className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-mute"
        >
          <path
            d="M1 1 L5 5 L9 1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>
    </div>
  );
}
