// FadeInWrapper.jsx
// Smoothly fades in and rises elements as they scroll into view.

import { motion } from 'framer-motion';

export function FadeInWrapper({ children, delay = 0, y = 44, className = '' }) {
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

// Backward-compatible alias
export { FadeInWrapper as FadeIn };
