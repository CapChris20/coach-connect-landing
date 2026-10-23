// MouseGridBackground — wraps a section and paints the pointer-reactive grid behind it.
// Flow: the mouse moves over the section → we write --grid-x / --grid-y (pixels inside
// the section) onto the element → the CSS glow layer in index.css (.interactive-grid-bg)
// lights up around the cursor → .is-hovering fades that layer in, leaving fades it out.
// All the drawing is CSS; this file only tracks the pointer.
// Used by: nearly every section in ui/Sections.jsx, and the marquee strip.

import { useCallback, useRef, useState } from 'react';

// ===== MAIN FUNCTION =====

/**
 * A section (or div) with the mouse-follow grid glow behind its children.
 * @param {Object} props
 * @param {React.ReactNode} props.children - the section's real content
 * @param {string} [props.className] - extra classes, usually the .landing-section sizing
 * @param {string} [props.id] - anchor id nav links glide to, like "act-pricing"
 * @param {string} [props.as] - "section" (default) or "div" for non-chapter strips
 * @returns {JSX.Element}
 */
export default function MouseGridBackground({ children, className = '', id, as = 'section' }) {
  const [isHovering, setIsHovering] = useState(false);
  const sectionElementRef = useRef(null);
  const divElementRef = useRef(null);

  // Write where the cursor is, in pixels from the section's own top-left corner.
  // vocab: getBoundingClientRect = the element's box on screen; subtracting it from
  // clientX / clientY turns viewport coordinates into inside-this-section coordinates
  const handleMouseMove = useCallback((e) => {
    const wrappingElement = sectionElementRef.current ?? divElementRef.current;
    if (!wrappingElement) return;

    const wrappingBox = wrappingElement.getBoundingClientRect();
    wrappingElement.style.setProperty('--grid-x', `${e.clientX - wrappingBox.left}px`);
    wrappingElement.style.setProperty('--grid-y', `${e.clientY - wrappingBox.top}px`);
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
  }, []);

  const hoveringClass = isHovering ? 'is-hovering' : '';
  const fullClassName = `interactive-grid-section relative ${hoveringClass} ${className}`;

  // Where the glow sits before the mouse ever moves: the middle of the section.
  // vocab: CSS custom properties in an inline style = plain values the CSS can read
  const glowPositionBeforeFirstMove = { '--grid-x': '50%', '--grid-y': '50%' };

  // The two-layer stack every section gets: glow grid behind, real content above it.
  // pointer-events-none + aria-hidden: the grid is decoration — never clickable,
  // never read out loud by screen readers.
  const layeredContent = (
    <>
      <div className="interactive-grid-bg pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="landing-section-body relative z-[1]">{children}</div>
    </>
  );

  if (as === 'div') {
    return (
      <div
        id={id}
        ref={divElementRef}
        className={fullClassName}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={glowPositionBeforeFirstMove}
      >
        {layeredContent}
      </div>
    );
  }

  return (
    <section
      id={id}
      ref={sectionElementRef}
      className={fullClassName}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={glowPositionBeforeFirstMove}
    >
      {layeredContent}
    </section>
  );
}
