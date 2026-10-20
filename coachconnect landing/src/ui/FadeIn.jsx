// FadeIn — the one scroll-reveal animation every section uses.
// Flow: start invisible and pushed down → the first time the element scrolls into
// view it rises into place once and stays. The motion values are Devora's, unchanged.
// Used by: ui/Sections.jsx everywhere. Do not re-implement per section.

import { motion } from 'framer-motion';

// ===== MAIN FUNCTION =====

/**
 * Wrap anything that should fade-and-rise the first time it scrolls into view.
 * @param {Object} props
 * @param {React.ReactNode} props.children - what gets revealed
 * @param {number} [props.delay] - seconds to wait before rising (for staggering)
 * @param {number} [props.y] - how far below it starts, in pixels
 * @param {string} [props.className] - classes for the wrapping element
 * @returns {JSX.Element}
 */
export function FadeIn({ children, delay = 0, y = 44, className = '' }) {
  // vocab: whileInView = framer-motion prop: animate when scrolled into view (not on mount)
  // vocab: viewport margin "-80px" = the trigger area is shrunk 80px, so reveals fire
  // a beat after the element is properly on screen, not the instant its edge peeks in
  // Manipulate here: y 44 = rise distance; 0.9s + this easing curve = the signature settle
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
