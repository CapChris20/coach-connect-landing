// HeroVideoBackground — the hero's background video: the camera glides
// along a dumbbell rack in a dark neon gym for 15 seconds, then loops.
// The owner supplied the clip as HEVC .mov (Safari-only on the web), so
// it was converted once with ffmpeg and the results live in
// public/videos/ — H.264 MP4 (461K) + VP9 WebM (475K), audio stripped.
// Re-convert with: ffmpeg -i dumbbell-glide.mov -an -c:v libx264 -crf 27
// -pix_fmt yuv420p -movflags +faststart dumbbell-glide.mp4 (WebM: swap in
// libvpx-vp9 -b:v 0 -crf 34). Never import these into the JS bundle —
// public/ paths keep them streamed, cached, and out of the build.
// Flow: poster still paints instantly → the muted looping video fades in
// over it → an IntersectionObserver pauses it off-screen → reduced
// motion never renders the video at all, just the poster.
// PARKED: was the hero background until the owner put the mouse-follow
// grid back (MouseGridBackground). One import swap in ui/Sections.jsx
// (TopSection) brings it back; the clips stay in public/videos/.

import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../hooks/useLanding';

// ===== NAMED CONSTANTS =====

// The three files in public/videos/. WebM is listed first in the JSX:
// browsers pick the first source they can play. MP4 is the fallback
// every browser can play (including Safari).
const HERO_VIDEO_WEBM_URL = '/videos/dumbbell-glide.webm';
const HERO_VIDEO_MP4_URL = '/videos/dumbbell-glide.mp4';
const HERO_VIDEO_POSTER_URL = '/videos/dumbbell-glide-poster.jpg';

// ===== MAIN FUNCTION =====

/**
 * The hero's dumbbell-rack video background. Decorative only: it does
 * not take clicks, and screen readers skip it. The clip is dark gym
 * footage, and a dark overlay (in index.css) keeps the white hero text
 * readable over its brightest bokeh highlights.
 * @returns {JSX.Element}
 */
export function HeroVideoBackground() {
  const backgroundRef = useRef(null);
  const videoRef = useRef(null);
  const [hasVideoStartedPlaying, setHasVideoStartedPlaying] = useState(false);
  const userPrefersReducedMotion = usePrefersReducedMotion();

  // Pause the video when the hero scrolls off-screen, resume on return.
  // vocab: IntersectionObserver = browser API that reports when an element
  // enters or leaves the visible viewport, without scroll-event math.
  useEffect(() => {
    const backgroundElement = backgroundRef.current;
    const videoElement = videoRef.current;
    if (!backgroundElement || !videoElement) return undefined;

    // 1. Watch the hero background's visibility.
    const visibilityObserver = new IntersectionObserver((entries) => {
      const latestEntry = entries[entries.length - 1];

      // 2. On-screen: play. Off-screen: pause, so a hidden video never
      // burns battery or competes with the sections being read.
      // vocab: play() returns a promise — a browser refusing autoplay
      // rejects it, and catching keeps that refusal out of the console.
      if (latestEntry.isIntersecting) {
        videoElement.play().catch(() => {});
      } else {
        videoElement.pause();
      }
    });
    visibilityObserver.observe(backgroundElement);

    // 3. Cleanup: stop watching on unmount. The video element itself is
    // removed with the JSX, so there is nothing else to tear down.
    return () => {
      visibilityObserver.disconnect();
    };
  }, [userPrefersReducedMotion]);

  // Named before the JSX so the fade decision reads as a sentence.
  // Manipulate here: the fade itself is the opacity transition on
  // .hero-video-background video in index.css.
  const videoClassName = hasVideoStartedPlaying ? 'hero-video-is-playing' : '';

  return (
    <div ref={backgroundRef} className="hero-video-background" data-testid="hero-video-background" aria-hidden="true">
      {/* 1. The poster still. It paints instantly (29K) so the hero is
          never a black box while the video streams, and it is also the
          entire background for reduced-motion visitors. */}
      <img src={HERO_VIDEO_POSTER_URL} alt="" className="hero-video-poster" />

      {/* 2. The looping video, over the poster. No audio track exists in
          the files, and muted + playsInline are what let browsers
          autoplay it without user interaction.
          vocab: playsInline = on iPhones, play inside the page instead
          of hijacking the full-screen player. */}
      {!userPrefersReducedMotion && (
        <video
          ref={videoRef}
          className={videoClassName}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={HERO_VIDEO_POSTER_URL}
          onCanPlay={() => setHasVideoStartedPlaying(true)}
        >
          <source src={HERO_VIDEO_WEBM_URL} type="video/webm" />
          <source src={HERO_VIDEO_MP4_URL} type="video/mp4" />
        </video>
      )}

      {/* 3. The dark overlay. This gradient (styled in index.css) keeps
          white text readable over the clip's brightest highlights and
          deepens the bottom edge into the next section. */}
      <div className="hero-video-overlay" />
    </div>
  );
}
