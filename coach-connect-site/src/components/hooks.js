// hooks.js — two small browser hooks the motion rules lean on (DESIGN.md section 9).
// usePrefersReducedMotion: true when the OS asks for less motion.
// useInView: true while an element is on screen, so video and WebGL can pause off-screen.
import { useEffect, useState } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Live answer to "does this visitor want reduced motion?".
 * @returns {boolean}
 */
export function usePrefersReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(() => window.matchMedia(REDUCED_MOTION_QUERY).matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    const update = () => setPrefersReduced(mediaQuery.matches);
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  return prefersReduced;
}

/**
 * True while the element behind `elementRef` is at least `threshold` visible.
 * @param {{ current: Element | null }} elementRef
 * @param {number} [threshold]
 * @returns {boolean}
 */
export function useInView(elementRef, threshold = 0.25) {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return undefined;
    const observer = new IntersectionObserver(([entry]) => setIsInView(entry.isIntersecting), { threshold });
    observer.observe(element);
    return () => observer.disconnect();
  }, [elementRef, threshold]);

  return isInView;
}
