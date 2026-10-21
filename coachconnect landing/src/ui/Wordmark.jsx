// Wordmark — the COACH CONNECT logo lockup, shared by the nav bar, hero, and footer.
// Flow: render two lines (stacked or side by side); CONNECT gets the
// pink-to-orange gradient from the .wordmark-connect class in index.css.
// Used by: navbar/NavBar.jsx and ui/Sections.jsx.

// ===== MAIN FUNCTION =====

/**
 * The COACH CONNECT logo.
 * @param {Object} props
 * @param {string} [props.className] - extra classes from the caller
 * @param {boolean} [props.stacked] - true = COACH over CONNECT; false = one line
 * @param {string} [props.size] - "hero" (big, fluid), "nav", or "footer"
 * @returns {JSX.Element}
 */
export function Wordmark({ className = '', stacked = true, size = 'hero' }) {
  // Hero sizing MUST be fluid, not breakpoint steps: a fixed large size made
  // "CONNECT" overflow its column at tablet widths and the final T looked cut off.
  // Unbounded is a WIDE font, so this clamp runs smaller than you'd expect — deliberate.
  // vocab: clamp(min, preferred, max) = grow with the viewport, never past either bound
  // Manipulate here: 5.8vw = growth rate; 4rem = desktop ceiling
  let wordmarkSizeClass = 'text-[11px] leading-tight';
  if (size === 'hero') {
    wordmarkSizeClass = 'text-[clamp(1.7rem,5.8vw,4rem)] leading-[1.05]';
  }
  // One-line hero lockup (the hero's h1): the same phrase on a single line
  // needs a fluid size, or "COACH CONNECT" outgrows its column.
  // Manipulate here: 5vw = growth rate; 4rem = desktop ceiling. Raise the
  // ceiling and the line starts crowding the sun in the middle of the hero.
  if (size === 'hero' && !stacked) {
    wordmarkSizeClass = 'text-[clamp(1.9rem,5vw,4rem)] leading-[1.05]';
  }
  if (size === 'nav') {
    wordmarkSizeClass = 'text-[13px] leading-tight';
  }

  const stackedOrInlineClass = stacked ? 'flex flex-col' : 'flex gap-1.5';
  // The lit face and the extrusion only fit the hero size. On the nav and
  // footer the letters are ~13px, and the shadow turns them muddy.
  const heroDepthClass = size === 'hero' ? 'display-extrude' : '';
  const coachFaceClass = size === 'hero' ? 'display-face' : 'text-white';

  return (
    <div
      className={`font-display font-extrabold tracking-tight ${stackedOrInlineClass} ${wordmarkSizeClass} ${heroDepthClass} ${className}`}
      data-testid="wordmark"
    >
      {/* whitespace-nowrap: never wrap mid-word; the clamp above guarantees it fits */}
      <span className={`whitespace-nowrap ${coachFaceClass}`}>COACH</span>
      <span className="wordmark-connect whitespace-nowrap">CONNECT</span>
    </div>
  );
}
