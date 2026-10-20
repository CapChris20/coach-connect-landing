// Tailwind theme for Coach Connect landing — brand colors + Devora type system.
// Flow: content globs scan src → utilities generated for the colors/fonts below.
// Type roles (from Devora): Unbounded = display/headlines, Space Mono = body/UI,
// Press Start 2P = pixel chapter labels. Legacy `syne`/`jakarta` keys are aliases
// so older classNames keep working — they now point at the Devora fonts.
// Manipulate here: change a font stack once here and the whole page follows.
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        void: '#0A0A0F',
        elevated: '#141419',
        pink: '#FF6B9D',
        purple: '#C084FC',
        cyan: '#06B6D4',
        'cyan-bright': '#64D2FF',
        orange: '#F97316',
        green: '#10B981',
        'green-bright': '#34D399',
      },
      // Devora mapping verbatim: utilities point at the CSS font-role variables
      // (defined on html in index.css), so swapping a font = editing one var.
      fontFamily: {
        sans: ['var(--font-mono)', 'monospace'],
        mono: ['var(--font-mono)', 'monospace'],
        display: ['var(--font-display)', 'sans-serif'],
        pixel: ['var(--font-pixel)', 'monospace'],
        // Back-compat aliases — same Devora fonts, old class names
        syne: ['var(--font-display)', 'sans-serif'],
        jakarta: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};
