/**
 * Design tokens — produced by frontend-design + ui-ux-pro-max in packet S-008.
 *
 * Direction: "Editorial Modernism, Personal Library Edition"
 *   Base style:    Swiss Modernism 2.0 (grid + mathematical spacing)
 *   Mood:          Personal library / cloth bindings — bookish without cliché
 *   Anti-templates: avoided cream + serif + terracotta cluster
 *
 * Single source of truth for color + type. All components import from here.
 */

export const palette = {
  /* Surfaces */
  page: '#F2EFE7', // warm stone (not the AI-default cream)
  card: '#FAF8F2', // a half-shade brighter than page for cards
  ink: '#1A1A1C', // near-black, neutral tint
  mute: '#A8A29E', // taupe for borders + captions
  hairline: '#D8D3C7', // subtle dividing line

  /* Cloth-binding accents (the bookish signature, kept restrained) */
  binding: '#7A1F2A', // deep burgundy (primary accent)
  bindingHover: '#5A1620',
  bindingSoft: '#F2D6D8', // a wash of binding for chips / hover backgrounds
  gilt: '#8B6914', // antique brass (read-status mark, used sparingly)
  moss: '#3A5A3B', // bottle green (second binding color)

  /* Functional */
  danger: '#9A2A2A',
  success: '#3A5A3B',
};

export const type = {
  display: '"Newsreader", "Iowan Old Style", "Georgia", serif',
  body: '"DM Sans", "Inter", system-ui, -apple-system, sans-serif',
  // For numerals in stats we keep DM Sans tabular figures — no third family
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

  // spacing scale follows Tailwind defaults (4/8 grid)
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

/**
 * Helper: each book gets a deterministic binding color from a small palette
 * so the spine shelf is varied without being random across renders.
 */
export const spineColors = [
  '#7A1F2A', // binding burgundy
  '#3A5A3B', // moss
  '#2A3E60', // navy cloth
  '#5A3B22', // saddle
  '#4A3B66', // aubergine
  '#8B6914', // brass / mustard
  '#7A4A1F', // tan leather
];

export function spineColorFor(seed) {
  if (!seed) return spineColors[0];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return spineColors[h % spineColors.length];
}
