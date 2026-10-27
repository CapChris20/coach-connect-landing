// HomeHero.jsx — the homepage hero, rebuilt to match the first site's hero.
// Flow: title card (COACHCONNECT + "official website" line) on top → three
// zones under it: the phone playing the app (left), the 3D CC logo (center),
// the watch (right) → the Scroll pill at the bottom. The grid behind lights up
// around the pointer. Stacks phone, logo, watch on smaller screens.
import { lazy, Suspense, useCallback, useRef, useState } from 'react';
import { HeroPhone } from './HeroPhone';
import { Watch } from './Watch';
import '../styles/hero.css';
import '../styles/watch.css';

const Logo3D = lazy(() => import('./Logo3D'));

// Where the Scroll pill takes you: the first section under the hero.
const SCROLL_TARGET_ID = 'what-is';

/**
 * @returns {JSX.Element}
 */
export function HomeHero() {
  const heroRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  // Write the pointer position (pixels inside the hero) for the grid glow.
  const trackPointer = useCallback((pointerEvent) => {
    const hero = heroRef.current;
    if (!hero) return;
    const heroBox = hero.getBoundingClientRect();
    hero.style.setProperty('--grid-x', `${pointerEvent.clientX - heroBox.left}px`);
    hero.style.setProperty('--grid-y', `${pointerEvent.clientY - heroBox.top}px`);
    setIsHovering(true);
  }, []);

  const scrollToNextSection = (clickEvent) => {
    clickEvent.preventDefault();
    document.getElementById(SCROLL_TARGET_ID)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      ref={heroRef}
      className={`home-hero ${isHovering ? 'is-hovering' : ''}`}
      aria-labelledby="hero-title"
      onPointerMove={trackPointer}
      onPointerLeave={() => setIsHovering(false)}
    >
      <div className="hero-grid-bg" aria-hidden="true" />
      <div className="home-hero-body">
        <div className="hero-title-card hero-rise">
          <h1 id="hero-title" className="hero-wordmark">
            <span className="hero-wordmark-coach">COACH</span>
            <span className="wordmark-connect">CONNECT</span>
          </h1>
          <p className="hero-app-line">
            The official website for the <span className="wordmark-connect">Coach Connect</span> mobile app.
          </p>
        </div>

        <div className="hero-zones">
          <div className="hero-zone-phone hero-rise">
            <HeroPhone />
          </div>
          <div className="hero-zone-logo hero-rise" aria-hidden="true">
            <Suspense fallback={<div className="logo-model-stage" />}>
              <Logo3D sway className="logo-model-stage" />
            </Suspense>
          </div>
          <div className="hero-zone-watch hero-middle-watch hero-rise">
            <Watch />
          </div>
        </div>
      </div>

      <a href={`#${SCROLL_TARGET_ID}`} className="hero-scroll-hint" onClick={scrollToNextSection}>
        Scroll
        <span className="hero-scroll-hint-chevrons" aria-hidden="true">
          <svg className="hero-scroll-hint-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
          <svg className="hero-scroll-hint-chevron hero-scroll-hint-chevron-delay" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </a>
    </section>
  );
}
