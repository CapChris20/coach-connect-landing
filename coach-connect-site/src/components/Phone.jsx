// Phone.jsx — the CSS iPhone frame that plays the real app recordings.
// Flow: a parent picks which clip is showing → this frame plays it while on
// screen → when the clip ends it tells the parent (onEnded), which decides
// whether to move on. Reduced motion shows the clip's first frame, no autoplay.
// Used by: FeatureExplorer, the homepage, /nutrition.
import { useEffect, useRef } from 'react';
import { useInView, usePrefersReducedMotion } from './hooks';

/**
 * @param {Object} props
 * @param {{ src: string, poster?: string, label?: string, title?: string }} props.clip - what to play
 * @param {() => void} [props.onEnded] - called once when the clip finishes
 * @param {(fraction: number) => void} [props.onProgress] - 0 to 1 while playing
 * @param {boolean} [props.loop] - loop forever instead of ending
 * @param {string} [props.className]
 * @returns {JSX.Element}
 */
export function Phone({ clip, onEnded, onProgress, loop = false, className = '' }) {
  const frameRef = useRef(null);
  const videoRef = useRef(null);
  const isInView = useInView(frameRef, 0.35);
  const prefersReducedMotion = usePrefersReducedMotion();

  // 1. Play only while on screen and motion is welcome; otherwise hold still.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isInView && !prefersReducedMotion) {
      video.muted = true;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isInView, prefersReducedMotion, clip.src]);

  const reportProgress = () => {
    const video = videoRef.current;
    if (!onProgress || !video || !video.duration) return;
    onProgress(video.currentTime / video.duration);
  };

  return (
    <div ref={frameRef} className={`phone ${className}`}>
      <span className="phone-btn phone-btn-silent" aria-hidden="true" />
      <span className="phone-btn phone-btn-up" aria-hidden="true" />
      <span className="phone-btn phone-btn-down" aria-hidden="true" />
      <span className="phone-btn phone-btn-power" aria-hidden="true" />
      <div className="phone-screen">
        <video
          ref={videoRef}
          key={clip.src}
          className="phone-video"
          src={clip.src}
          poster={clip.poster}
          muted
          playsInline
          loop={loop}
          preload="metadata"
          onEnded={onEnded}
          onTimeUpdate={reportProgress}
          aria-label={`Screen recording of the Coach Connect app: ${clip.label || clip.title}`}
        />
      </div>
    </div>
  );
}
