// StartupIntro — the site's opening beat: a dark curtain with the
// wordmark rising in and a thin brand-gradient line sweeping under it,
// then the whole curtain lifts away and the hero choreographs in
// behind it (TopSection's entrance delays are timed to the lift).
// Total on-screen time is under two seconds; it never replays within
// the page, and reduced-motion visitors never see it at all.
// Flow: mount covered → wordmark + line animate → hold timer ends →
// curtain slides up → component removes itself from the page.
// Used by: pages/Landing.jsx (rendered first, above everything).

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../hooks/useLanding';
import { Wordmark } from './Wordmark';

// ===== NAMED CONSTANTS =====

// Manipulate here: how long the wordmark holds before the curtain lifts.
// 1000 = one beat to read the name. The hero's entrance delays in
// ui/Sections.jsx (TopSection) start just before this ends.
const INTRO_HOLD_MS = 1000;

// Manipulate here: how fast the curtain lifts. Lower = snappier exit.
const INTRO_LIFT_SECONDS = 0.65;

// The signature settle the whole site rises with (same curve as FadeIn).
const INTRO_EASE = [0.16, 1, 0.3, 1];

// ===== MAIN FUNCTION =====

/**
 * The startup curtain. Decorative: it blocks nothing once lifted, and
 * unmounts itself so it never sits in the accessibility tree.
 * @returns {JSX.Element|null}
 */
export function StartupIntro() {
  const [isCurtainUp, setIsCurtainUp] = useState(true);
  const userPrefersReducedMotion = usePrefersReducedMotion();

  // 1. Start the hold timer on mount; when it ends, the curtain lifts.
  useEffect(() => {
    const liftTimer = setTimeout(() => setIsCurtainUp(false), INTRO_HOLD_MS);

    // 2. Leaving the page mid-intro clears the timer with the component.
    return () => clearTimeout(liftTimer);
  }, []);

  // 3. Reduced motion: no curtain, no wait — the page is simply there.
  if (userPrefersReducedMotion) return null;

  return (
    // vocab: AnimatePresence = framer-motion wrapper that keeps an
    // element alive long enough to play its exit animation on removal.
    <AnimatePresence>
      {isCurtainUp && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#07060a]"
          initial={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: INTRO_LIFT_SECONDS, ease: [0.76, 0, 0.24, 1] }}
          aria-hidden="true"
          data-testid="startup-intro"
        >
          {/* The wordmark rises out of a soft blur, the way the hero's
              own wordmark will a beat later. */}
          <motion.div
            initial={{ opacity: 0, y: 26, scale: 0.96, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.7, ease: INTRO_EASE }}
          >
            <Wordmark stacked={false} className="items-center" />
          </motion.div>

          {/* The loading line: a hairline that sweeps to full width in
              the brand gradient while the wordmark holds. */}
          <motion.div
            className="mt-6 h-[2px] w-44 origin-left rounded-full bg-gradient-to-r from-pink via-purple to-orange"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.85, delay: 0.15, ease: INTRO_EASE }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
