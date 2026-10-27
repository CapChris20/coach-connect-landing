// HeroSignature.jsx — the homepage's one signature moment (DESIGN.md section 9):
// the dumbbell-rack film, with a slow light sweep and a gentle scroll parallax.
// Flow: poster paints first → the muted loop fades in once it can play → it
// pauses whenever the hero leaves the screen. Reduced motion keeps the poster
// as a single still frame, no sweep, no parallax. Always aria-hidden.
import { useEffect, useRef, useState } from 'react';
import { useInView, usePrefersReducedMotion } from './hooks';

const POSTER_URL = '/videos/dumbbell-glide-poster.jpg';
const WEBM_URL = '/videos/dumbbell-glide.webm';
const MP4_URL = '/videos/dumbbell-glide.mp4';

// Manipulate here: how far the film drifts per pixel scrolled. 0.18 reads as
// depth; past 0.3 it starts to feel like the page is sliding.
const PARALLAX_RATE = 0.18;

/**
 * Full-bleed film behind the hero, plus the scrim that keeps the headline legible.
 * @returns {JSX.Element}
 */
export function HeroSignature() {
  const stageRef = useRef(null);
  const videoRef = useRef(null);
  const filmRef = useRef(null);
  const [canPlay, setCanPlay] = useState(false);
  const isInView = useInView(stageRef, 0);
  const prefersReducedMotion = usePrefersReducedMotion();

  // 1. Play on screen, pause off it.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isInView) video.play().catch(() => {});
    else video.pause();
  }, [isInView]);

  // 2. Parallax: translate the film a fraction of the scroll, once per frame.
  useEffect(() => {
    if (prefersReducedMotion || !isInView) return undefined;
    let frameId = 0;
    const moveFilm = () => {
      frameId = 0;
      if (filmRef.current) filmRef.current.style.transform = `translate3d(0, ${window.scrollY * PARALLAX_RATE}px, 0) scale(1.06)`;
    };
    const onScroll = () => {
      if (!frameId) frameId = requestAnimationFrame(moveFilm);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    moveFilm();
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frameId);
    };
  }, [prefersReducedMotion, isInView]);

  return (
    <div ref={stageRef} className="hero-film" aria-hidden="true">
      <div ref={filmRef} className="hero-film-layer">
        <img src={POSTER_URL} alt="" className="hero-film-media" />
        {!prefersReducedMotion && (
          <video
            ref={videoRef}
            className={`hero-film-media hero-film-video ${canPlay ? 'is-ready' : ''}`}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={POSTER_URL}
            onCanPlay={() => setCanPlay(true)}
          >
            <source src={WEBM_URL} type="video/webm" />
            <source src={MP4_URL} type="video/mp4" />
          </video>
        )}
      </div>
      {!prefersReducedMotion && <div className="hero-film-sweep" />}
      <div className="hero-film-scrim" />
    </div>
  );
}
