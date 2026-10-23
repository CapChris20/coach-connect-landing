// useScreenSizeAndMotion.js
// Custom helper hooks that check user screen and motion settings.

import { useEffect, useRef, useState } from 'react';

// Checks if the user's computer or phone has "Reduce Motion" turned on.
// If true, we disable fast/spinning animations for accessibility.
export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateSetting = () => setPrefersReducedMotion(mediaQuery.matches);

    mediaQuery.addEventListener('change', updateSetting);
    return () => mediaQuery.removeEventListener('change', updateSetting);
  }, []);

  return prefersReducedMotion;
}

// Tracks how far down the page the user has scrolled (from 0 at the top to 1 at the bottom).
export function useScrollProgress() {
  const scrollProgress = useRef(0);

  useEffect(() => {
    let frameId = 0;
    let isMounted = true;

    const calculateScroll = () => {
      frameId = 0;
      if (!isMounted) return;

      const totalScrollableDistance = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalScrollableDistance > 0 ? window.scrollY / totalScrollableDistance : 0;

      // Keep the progress number between 0 and 1
      scrollProgress.current = Math.min(1, Math.max(0, progress));
    };

    const handleScrollOrResize = () => {
      if (frameId) return;
      frameId = requestAnimationFrame(calculateScroll);
    };

    calculateScroll();
    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize, { passive: true });

    return () => {
      isMounted = false;
      if (frameId) cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, []);

  return scrollProgress;
}
