/**
 * Loading skeleton for the EditBook page — mirrors BookForm's vertical rhythm
 * pixel-for-pixel so the swap to the real form does not cause a layout jump.
 *
 * Design notes (from frontend-design + ui-ux-pro-max in S-011):
 *  - Content-shaped bars, not shimmer. Subtle opacity pulse only.
 *  - Bar color is `bg-hairline` — calmest non-white token.
 *  - `motion-reduce:animate-none` honours prefers-reduced-motion.
 *  - role=status + aria-busy + sr-only label, so screen readers announce
 *    "Loading book…" exactly once when the page mounts.
 */
const bar = 'rounded-md bg-hairline animate-pulse motion-reduce:animate-none';

function FieldBlock({ labelWidth = 'w-24' }) {
  return (
    <div>
      <div className={`${bar} h-3.5 ${labelWidth}`} />
      <div className={`${bar} mt-1.5 h-[42px] w-full`} />
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading book…"
      className="max-w-xl"
    >
      <span className="sr-only">Loading book…</span>

      <div className="grid gap-5">
        <FieldBlock labelWidth="w-24" />
        <FieldBlock labelWidth="w-16" />
        <FieldBlock labelWidth="w-20" />

        <div>
          <div className={`${bar} h-3.5 w-14`} />
          <div className="mt-2 flex gap-6">
            <div className="inline-flex items-center gap-2">
              <div className={`${bar} h-4 w-4 rounded-full`} />
              <div className={`${bar} h-3.5 w-12`} />
            </div>
            <div className="inline-flex items-center gap-2">
              <div className={`${bar} h-4 w-4 rounded-full`} />
              <div className={`${bar} h-3.5 w-16`} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-end gap-3">
        <div className={`${bar} h-[42px] w-20`} />
        <div className={`${bar} h-[42px] w-28`} />
      </div>
    </div>
  );
}
