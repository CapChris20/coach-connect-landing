// useLanding — two small hooks the landing page reads from the browser.
// usePrefersReducedMotion: is the visitor's OS "reduce motion" setting on?
// useScrollProgress: how far down the page are we, as 0 to 1, without re-rendering.
// Used by: pages/Landing.jsx (reduced motion only, today).

import { useEffect, useRef, useState } from 'react';

// ===== HELPER FUNCTIONS =====

/**
 * Watch the OS "reduce motion" setting and hand back the current answer.
 * Landing uses it to turn Lenis smooth scroll off for people who ask for less motion.
 * vocab: matchMedia = the browser API that checks CSS-style questions like
 * "(prefers-reduced-motion: reduce)" from JavaScript, and reports when they change
 * @returns {boolean} true when the visitor wants reduced motion
 */
export function usePrefersReducedMotion() {
  const [doesUserPreferReducedMotion, setDoesUserPreferReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const reducedMotionSetting = window.matchMedia('(prefers-reduced-motion: reduce)');
    const saveNewSetting = () => setDoesUserPreferReducedMotion(reducedMotionSetting.matches);
    reducedMotionSetting.addEventListener('change', saveNewSetting);
    return () => reducedMotionSetting.removeEventListener('change', saveNewSetting);
  }, []);

  return doesUserPreferReducedMotion;
}

// ===== MAIN FUNCTION =====

/**
 * Track scroll progress as a number from 0 (top) to 1 (bottom) in a ref.
 * A ref, not state: writing it never re-renders React, which is what keeps
 * scrolling at 60fps. Nothing reads this today (it drove the old 3D camera) —
 * kept because the next design will likely want scroll-driven motion again.
 * vocab: useRef = a box whose .current can change without re-rendering anything
 * vocab: requestAnimationFrame = "run this right before the next screen refresh";
 * many scroll events in one frame collapse into a single measurement
 * @returns {{ current: number }} the shared progress box
 */
export function useScrollProgress() {
  const scrollProgress = useRef(0);

  useEffect(() => {
    let scheduledFrameId = 0;
    let isStillMounted = true;

    const saveScrollProgress = () => {
      scheduledFrameId = 0;
      if (!isStillMounted) return;
      // Manipulate here: clamped to [0, 1] — 0 = top of page, 1 = very bottom
      const scrollableDistance = document.documentElement.scrollHeight - window.innerHeight;
      const rawProgress = scrollableDistance > 0 ? window.scrollY / scrollableDistance : 0;
      scrollProgress.current = Math.min(1, Math.max(0, rawProgress));
    };

    // Scroll and resize can fire many times per frame; measure at most once per frame.
    const scheduleMeasureOnNextFrame = () => {
      if (scheduledFrameId) return;
      scheduledFrameId = requestAnimationFrame(saveScrollProgress);
    };

    // Measure once right away so the number is right before any scrolling happens.
    saveScrollProgress();
    window.addEventListener('scroll', scheduleMeasureOnNextFrame, { passive: true });
    window.addEventListener('resize', scheduleMeasureOnNextFrame, { passive: true });

    return () => {
      isStillMounted = false;
      if (scheduledFrameId) cancelAnimationFrame(scheduledFrameId);
      window.removeEventListener('scroll', scheduleMeasureOnNextFrame);
      window.removeEventListener('resize', scheduleMeasureOnNextFrame);
    };
  }, []);

  return scrollProgress;
}
