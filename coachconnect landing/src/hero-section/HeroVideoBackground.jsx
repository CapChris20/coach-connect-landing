// HeroVideoBackground.jsx
// Background video for the hero section: gym dumbbells with soft lighting.

import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../app-settings-and-helpers/useScreenSizeAndMotion';

const HERO_VIDEO_WEBM_URL = '/videos/dumbbell-glide.webm';
const HERO_VIDEO_MP4_URL = '/videos/dumbbell-glide.mp4';
const HERO_VIDEO_POSTER_URL = '/videos/dumbbell-glide-poster.jpg';

export function HeroVideoBackground() {
  const backgroundRef = useRef(null);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const userPrefersReducedMotion = usePrefersReducedMotion();

  // Pause video when scrolled out of view to save battery and performance
  useEffect(() => {
    const backgroundElement = backgroundRef.current;
    const videoElement = videoRef.current;
    if (!backgroundElement || !videoElement) return undefined;

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1];
      if (entry.isIntersecting) {
        videoElement.play().catch(() => {});
      } else {
        videoElement.pause();
      }
    });

    observer.observe(backgroundElement);
    return () => observer.disconnect();
  }, [userPrefersReducedMotion]);

  return (
    <div ref={backgroundRef} className="hero-video-background" data-testid="hero-video-background" aria-hidden="true">
      {/* Fallback image shown while loading or if reduced motion is enabled */}
      <img src={HERO_VIDEO_POSTER_URL} alt="" className="hero-video-poster" />

      {/* Looping muted background video */}
      {!userPrefersReducedMotion && (
        <video
          ref={videoRef}
          className={isPlaying ? 'hero-video-is-playing' : ''}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={HERO_VIDEO_POSTER_URL}
          onCanPlay={() => setIsPlaying(true)}
        >
          <source src={HERO_VIDEO_WEBM_URL} type="video/webm" />
          <source src={HERO_VIDEO_MP4_URL} type="video/mp4" />
        </video>
      )}

      {/* Dark gradient overlay to keep white text readable */}
      <div className="hero-video-overlay" />
    </div>
  );
}
