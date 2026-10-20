// Landing — the whole marketing page, top to bottom.
// Flow: smooth scrolling turns on → the aurora backdrop sits fixed behind
// everything → NavBar, hero, marquee, then the chapters in the owner's order:
// What is Coach Connect? → FAQs → Subscription → Waitlist. The For Trainers /
// For Clients chapters moved off this page (they're becoming their own pages;
// the components still live in ui/Sections.jsx as seed content).
// Also handled here: arriving from another page with a hash in the URL
// ("/#act-faqs" from the nav) glides to that section once the page renders.
// The 3D scene and its scroll-driven camera were removed earlier at the
// owner's request; the old scene code still sits in src/scene/, unused.
// Used by: App.js at "/".

import { useEffect } from 'react';
import Lenis from 'lenis';
import { useLocation } from 'react-router-dom';
import Seo from '../ui/Seo';
import { NavBar } from '../navbar/NavBar';
import { usePrefersReducedMotion } from '../hooks/useLanding';
import { scrollToSection } from '../ui/scrollToHash';
import {
  TopSection,
  ScrollingTextStrip,
  WhatIsSection,
  FaqSection,
  BenefitsBento,
  JoinNowFooter,
} from '../ui/Sections';

// ===== NAMED CONSTANTS =====

// Manipulate here: how buttery the page scroll feels. Higher duration = slower glide.
const SMOOTH_SCROLL_DURATION = 1.1;
// Manipulate here: how far one touch flick travels. Higher = touch scrolls faster.
const TOUCH_SCROLL_MULTIPLIER = 1.15;
// Manipulate here: how long to wait before gliding to a URL-hash section, so
// the chapters (and Lenis) exist first. Too short and the glide misses.
const HASH_GLIDE_DELAY_MS = 350;

// ===== MAIN FUNCTION =====

/**
 * The landing page. Also the only page that gets Lenis smooth scrolling —
 * it is created here and destroyed when this page unmounts.
 * @returns {JSX.Element}
 */
export default function Landing() {
  const userPrefersReducedMotion = usePrefersReducedMotion();
  const currentLocation = useLocation();

  // vocab: Lenis = the smooth-scroll library. autoRaf = it runs its own
  // animation loop, so nothing else has to feed it frames.
  useEffect(() => {
    // 1. Reduced motion on? Leave scrolling completely native. Done.
    if (userPrefersReducedMotion) return undefined;

    // 2. Create the smooth scroller with the feel settings above.
    // vocab: syncTouch = touch devices get the same smoothed scroll as the wheel
    const smoothScroller = new Lenis({
      duration: SMOOTH_SCROLL_DURATION,
      smoothWheel: true,
      syncTouch: true,
      touchMultiplier: TOUCH_SCROLL_MULTIPLIER,
      autoRaf: true,
    });

    // 3. Store it on window so the nav bar and CTA links can ask it to glide
    // to a section (see ui/scrollToHash.js).
    window.smoothScroller = smoothScroller;

    // 4. Leaving this page tears it down and clears the stored copy.
    return () => {
      smoothScroller.destroy();
      window.smoothScroller = undefined;
    };
  }, [userPrefersReducedMotion]);

  // Arriving with a hash in the URL (the nav sends people here from the
  // /for-trainers and /for-clients pages): wait a beat for the chapters to
  // render, then glide to the named section.
  useEffect(() => {
    // 1. No hash in the URL? Nothing to do.
    if (!currentLocation.hash) return undefined;

    // 2. Glide once everything below exists.
    const glideTimer = setTimeout(() => scrollToSection(currentLocation.hash), HASH_GLIDE_DELAY_MS);
    return () => clearTimeout(glideTimer);
  }, [currentLocation.hash]);

  return (
    <div className="relative min-h-screen bg-void" data-testid="landing">
      <Seo />

      {/* The static gradient backdrop that replaced the old WebGL canvas */}
      <div className="aurora-static" data-testid="aurora-fallback" aria-hidden />

      <div className="relative z-10">
        <NavBar />
        <TopSection />
        <ScrollingTextStrip />
        <WhatIsSection />
        <FaqSection />
        <BenefitsBento />
        <JoinNowFooter />
      </div>
    </div>
  );
}
