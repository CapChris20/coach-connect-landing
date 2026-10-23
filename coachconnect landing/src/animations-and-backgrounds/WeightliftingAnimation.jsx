// WeightliftingAnimation — the lifter that sits left of "What is Coach Connect?".
// Flow: hand the Lottie JSON to the player → loop it → hold the first frame
// when the visitor has asked the OS for less motion.
// Used by: ui/Sections.jsx (WhatIsSection).

import { LottieSvg } from 'lottie-react';
import { usePrefersReducedMotion } from '../app-settings-and-helpers/useScreenSizeAndMotion';
import weightliftingCompetition from './weightlifting-competition.json';

// ===== MAIN FUNCTION =====

/**
 * The weightlifting competition animation. Decorative: the chapter text next
 * to it is what a screen reader should hear, so this box is hidden from them.
 * @returns {JSX.Element}
 */
export function WeightliftingAnimation() {
  const userPrefersReducedMotion = usePrefersReducedMotion();
  // Reduced motion keeps the opening pose. Everyone else gets the loop.
  const shouldKeepPlaying = !userPrefersReducedMotion;

  return (
    <LottieSvg
      // vocab: src = the parsed Lottie file (frames, shapes). The player draws it as SVG.
      // vocab: Lottie = a JSON animation format. This one is a lifter, 1020×800, 6 seconds.
      src={weightliftingCompetition}
      loop={shouldKeepPlaying}
      autoplay={shouldKeepPlaying}
      className="what-is-lottie"
      data-testid="what-is-lottie"
      aria-hidden="true"
    />
  );
}
