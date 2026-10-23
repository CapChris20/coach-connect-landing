// Landing — the whole marketing page, top to bottom.
// Flow: the startup curtain lifts (ui/StartupIntro.jsx) → smooth scrolling
// turns on → the aurora backdrop sits fixed behind
// everything → NavBar, hero, marquee, then the chapters in the owner's order:
// What is Coach Connect? → Subscription → Waitlist. The For Trainers /
// For Clients / FAQs chapters moved off this page to their own pages
// (the FAQ component still lives in ui/Sections.jsx; /faqs renders it).
// Also handled here: arriving from another page with a hash in the URL
// ("/#act-finale" from the nav) glides to that section once the page renders.
// Without a hash, the page always starts at the top: browsers restore the
// last scroll spot on reload, and React Router keeps it on route changes,
// which used to drop returning visitors at the waitlist form.
// The 3D scene and its scroll-driven camera were removed earlier at the
// owner's request; the old scene code still sits in src/scene/, unused.
// Used by: App.js at "/".

import { useEffect } from 'react';
import Lenis from 'lenis';
import { useLocation } from 'react-router-dom';
import Seo from '../app-settings-and-helpers/seoMetaTags';
import { StartupIntro } from './StartupIntroAnimation';
import { NavigationBar as NavBar } from '../app-header-and-nav/NavigationBar';
import { usePrefersReducedMotion } from '../app-settings-and-helpers/useScreenSizeAndMotion';
import { scrollToSection } from '../app-settings-and-helpers/smoothScrollHelper';
import {
  TopSection,
  ScrollingTextStrip,
  WhatIsSection,
  BenefitsBento,
  JoinNowFooter,
} from './LandingPageSections';
import './landing-page.css';

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

  // Start at the hero on any plain visit. Runs after the Lenis effect
  // above, so the smooth scroller exists and can be snapped too.
  //vocab: scrollRestoration "manual" = the browser stops restoring the
  // last scroll spot on reload; this page decides where loads land.
  useEffect(() => {
    // 1. A hash in the URL means a section was asked for — the glide
    // effect below owns that visit; stay out of its way.
    if (currentLocation.hash) return;

    // 2. Take scroll restoration away from the browser, then snap
    // both the window and the smooth scroller to the very top (no
    // glide: "immediate" lands at the hero before the visitor sees
    // anything else).
    window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    window.smoothScroller?.scrollTo(0, { immediate: true });
    // Run once on mount only — location changes are the hash effect's job.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <StartupIntro />

      {/* The static gradient backdrop that replaced the old WebGL canvas */}
      <div className="aurora-static" data-testid="aurora-fallback" aria-hidden />

      <div className="relative z-10">
        <NavBar />
        <TopSection />
        <ScrollingTextStrip />
        <WhatIsSection />
        <BenefitsBento />
        <JoinNowFooter />
      </div>
    </div>
  );
}
