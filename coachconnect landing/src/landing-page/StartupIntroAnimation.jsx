// StartupIntroAnimation.jsx
// A quick introductory curtain animation when the site first opens.
// It displays the Coach Connect logo with a thin gradient bar before lifting up.

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../app-settings-and-helpers/useScreenSizeAndMotion';
import { CoachConnectTextLogo } from '../app-header-and-nav/CoachConnectTextLogo';
import './landing-page.css';

const INTRO_HOLD_MS = 1000;
const INTRO_LIFT_SECONDS = 0.65;
const INTRO_EASE = [0.16, 1, 0.3, 1];

export function StartupIntroAnimation() {
  const [isCurtainUp, setIsCurtainUp] = useState(true);
  const userPrefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const timer = setTimeout(() => setIsCurtainUp(false), INTRO_HOLD_MS);
    return () => clearTimeout(timer);
  }, []);

  // Skip animation for users with reduced motion enabled
  if (userPrefersReducedMotion) return null;

  return (
    <AnimatePresence>
      {isCurtainUp && (
        <motion.div
          className="startup-intro-curtain"
          initial={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: INTRO_LIFT_SECONDS, ease: [0.76, 0, 0.24, 1] }}
          aria-hidden="true"
          data-testid="startup-intro"
        >
          {/* Logo reveals with soft fade-in */}
          <motion.div
            initial={{ opacity: 0, y: 26, scale: 0.96, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.7, ease: INTRO_EASE }}
          >
            <CoachConnectTextLogo stacked={false} />
          </motion.div>

          {/* Glowing gradient underline sweeps across */}
          <motion.div
            className="startup-intro-line"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.85, delay: 0.15, ease: INTRO_EASE }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Backward-compatible alias
export { StartupIntroAnimation as StartupIntro };
