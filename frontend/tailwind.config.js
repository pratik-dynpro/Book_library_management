import { palette, type, scale } from './src/design/tokens.js';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        page: palette.page,
        card: palette.card,
        ink: palette.ink,
        mute: palette.mute,
        hairline: palette.hairline,
        accent: {
          DEFAULT: palette.accent,
          hover: palette.accentHover,
          soft: palette.accentSoft,
        },
        danger: palette.danger,
        success: palette.success,
        warning: palette.warning,
      },
      fontFamily: {
        display: type.display.split(',').map((s) => s.trim().replace(/^"|"$/g, '')),
        body: type.body.split(',').map((s) => s.trim().replace(/^"|"$/g, '')),
      },
      fontSize: {
        'display-1': [scale.display1, { lineHeight: '1.02', letterSpacing: '-0.02em' }],
        'display-2': [scale.display2, { lineHeight: '1.05', letterSpacing: '-0.01em' }],
        h1: [scale.h1, { lineHeight: '1.15' }],
        h2: [scale.h2, { lineHeight: '1.25' }],
        h3: [scale.h3, { lineHeight: '1.35' }],
        body: [scale.body, { lineHeight: '1.6' }],
        small: [scale.small, { lineHeight: '1.5' }],
        caption: [scale.caption, { lineHeight: '1.4', letterSpacing: '0.08em' }],
      },
      borderRadius: {
        sm: scale.radiusSm,
        md: scale.radiusMd,
        lg: scale.radiusLg,
      },
      maxWidth: {
        page: '76rem',
      },
    },
  },
  plugins: [],
};
