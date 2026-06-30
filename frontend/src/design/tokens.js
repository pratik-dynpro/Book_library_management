/**
 * Design tokens — produced via frontend-design + ui-ux-pro-max in packet S-014.
 *
 * Direction: "Modern SaaS / Tech"
 *   Surfaces:   slate-50 page, white cards
 *   Accent:     indigo-600 single accent (CTAs, focus, Read-status)
 *   Type:       Tinos (display, weight 700) + Poppins (body)
 *
 * Single source of truth for color + type. All components import from here.
 */

export const palette = {
  /* Surfaces */
  page: '#F8FAFC', // slate-50 — app background
  card: '#FFFFFF', // surface above background
  ink: '#0F172A', // slate-900 — primary text
  mute: '#64748B', // slate-500 — secondary text, captions
  hairline: '#E2E8F0', // slate-200 — borders, dividers

  /* Accent */
  accent: '#4F46E5', // indigo-600 — primary CTA, Read status, focus rings
  accentHover: '#4338CA', // indigo-700 — hover state
  accentSoft: '#EEF2FF', // indigo-50 — tinted bg, chart bar track

  /* Functional */
  danger: '#DC2626', // red-600
  success: '#15803D', // emerald-700
  warning: '#B45309', // amber-700
};

export const type = {
  display: '"Tinos", "Times New Roman", serif',
  body: '"Poppins", system-ui, -apple-system, "Segoe UI", sans-serif',
};

export const scale = {
  // type scale (rem)
  display1: '4rem', // 64
  display2: '2.75rem', // 44
  h1: '2rem', // 32
  h2: '1.5rem', // 24
  h3: '1.125rem', // 18
  body: '1rem', // 16
  small: '0.875rem', // 14
  caption: '0.75rem', // 12

  // radii
  radiusSm: '4px',
  radiusMd: '8px',
  radiusLg: '14px',
};

export const motion = {
  fast: '150ms',
  base: '220ms',
  slow: '360ms',
  ease: 'cubic-bezier(0.2, 0.7, 0.2, 1)',
};
