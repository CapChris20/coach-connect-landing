// SectionPhonePlayer — a phone-framed video player for the audience
// pages (/for-clients, /for-trainers). Each section can supply an
// array of clips; the player cycles through them, showing progress-
// bar segments and a "currently playing" caption above the phone —
// exactly the same UX as the HeroPhone on the landing page.
// When only one clip is supplied the segment bar and counter are
// hidden (nothing to jump between). When no clips are supplied at all
// the component falls back to the PhoneModelRoom placeholder so the
// section layout never breaks.
// Used by: ui/AudienceSkeleton.jsx.

// ===== IMPORTS =====

import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../../app-settings-and-helpers/useScreenSizeAndMotion';
import './audience-pages.css';

// ===== NAMED CONSTANTS =====

// Minimum percentage of the phone player that must be visible in viewport to trigger playback
const INTERSECTION_VISIBILITY_THRESHOLD = 0.2;

// Multiplier used to calculate progress bar width percentage from currentTime / duration
const PROGRESS_PERCENTAGE_MULTIPLIER = 100;

// CSS percentage values for segment progress bar widths
const SEGMENT_FILL_FULL_PERCENT = '100%';
const SEGMENT_FILL_EMPTY_PERCENT = '0%';

// Center coordinates for radial accent glow positioned relative to phone alignment
const RADIAL_GLOW_POSITION_LEFT = '30% 30%';
const RADIAL_GLOW_POSITION_RIGHT = '70% 30%';

// Default index of the opening clip
const INITIAL_CLIP_INDEX = 0;

// ===== HELPER FUNCTIONS =====

/**
 * Fallback empty phone frame rendered when a section does not have recordings yet.
 * Keeps identical proportions and dimensions so the layout never jumps when clips load.
 * @param {Object} props
 * @param {'left'|'right'} props.phoneSide - Side of the section where phone sits
 * @returns {JSX.Element}
 */
function PhoneModelRoom({ phoneSide }) {
  return (
    <div
      className="relative mx-auto w-full max-w-[300px] sm:max-w-[340px]"
      data-testid="skeleton-phone-room"
      data-side={phoneSide}
    >
      <div
        className="absolute -inset-8 rounded-full bg-[radial-gradient(circle_at_50%_35%,rgba(255,107,157,0.20),rgba(249,115,22,0.09)_45%,transparent_70%)] blur-2xl"
        aria-hidden="true"
      />
      <div className="relative aspect-[9/19] rounded-[2.6rem] border border-white/25 bg-transparent p-2">
        <div className="flex h-full flex-col items-center justify-center gap-3 rounded-[2.1rem] border border-dashed border-white/20 bg-transparent px-4 text-center">
          <span className="h-1.5 w-14 rounded-full border border-white/25 bg-transparent" aria-hidden="true" />
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-white/45">Phone model</p>
          <p className="font-mono text-[11px] leading-relaxed text-white/30">Space reserved</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Active phone player with video playback, segment tabs, and live captions.
 * @param {Object} props
 * @param {Array<Object>} props.clips
 * @param {'left'|'right'} props.phoneSide
 * @returns {JSX.Element}
 */
function PhonePlayerInner({ clips, phoneSide }) {
  const doesUserPreferReducedMotion = usePrefersReducedMotion();
  const [currentClipIndex, setCurrentClipIndex] = useState(INITIAL_CLIP_INDEX);
  const [isPhoneVisibleOnScreen, setIsPhoneVisibleOnScreen] = useState(false);
  const videoRef = useRef(null);
  const stageRef = useRef(null);
  const segmentFillRefs = useRef([]);
  const currentClip = clips[currentClipIndex];
  const hasMultipleClips = clips.length > 1;

  // Track on-screen visibility to play only when the phone is in view
  useEffect(() => {
    const stageElement = stageRef.current;
    if (!stageElement) {
      return undefined;
    }

    const visibilityObserver = new IntersectionObserver(
      (intersectionEntries) => setIsPhoneVisibleOnScreen(intersectionEntries[0].isIntersecting),
      { threshold: INTERSECTION_VISIBILITY_THRESHOLD },
    );

    visibilityObserver.observe(stageElement);
    return () => visibilityObserver.disconnect();
  }, []);

  const attemptVideoPlayback = () => {
    const videoElement = videoRef.current;
    if (!videoElement || doesUserPreferReducedMotion || !isPhoneVisibleOnScreen) {
      return;
    }
    videoElement.muted = true;
    videoElement.play().catch(() => {});
  };

  // Synchronize play/pause state with user visibility and reduced motion preferences
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) {
      return;
    }

    if (isPhoneVisibleOnScreen && !doesUserPreferReducedMotion) {
      attemptVideoPlayback();
    } else {
      videoElement.pause();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPhoneVisibleOnScreen, doesUserPreferReducedMotion, currentClipIndex]);

  const advanceToNextClip = () => {
    setCurrentClipIndex((previousClipIndex) => (previousClipIndex + 1) % clips.length);
  };

  // Directly update width to prevent React state re-rendering overhead on every tick
  const updateProgressBarFill = () => {
    const videoElement = videoRef.current;
    const segmentFillElement = segmentFillRefs.current[currentClipIndex];
    if (!videoElement || !segmentFillElement || !videoElement.duration) {
      return;
    }
    const currentProgressPercent = (videoElement.currentTime / videoElement.duration) * PROGRESS_PERCENTAGE_MULTIPLIER;
    segmentFillElement.style.width = `${currentProgressPercent}%`;
  };

  const selectClipByIndex = (targetClipIndex) => {
    segmentFillRefs.current.forEach((fillElement) => {
      if (fillElement) {
        fillElement.style.width = SEGMENT_FILL_EMPTY_PERCENT;
      }
    });
    setCurrentClipIndex(targetClipIndex);
  };

  const glowPosition = phoneSide === 'left' ? RADIAL_GLOW_POSITION_LEFT : RADIAL_GLOW_POSITION_RIGHT;

  return (
    <div
      ref={stageRef}
      className="relative mx-auto w-full max-w-[300px] sm:max-w-[340px]"
      data-testid="section-phone-player"
    >
      <div
        className="absolute -inset-8 rounded-full blur-2xl"
        style={{
          background: `radial-gradient(circle at ${glowPosition}, rgba(255,107,157,0.22), rgba(249,115,22,0.10) 45%, transparent 70%)`,
        }}
        aria-hidden="true"
      />

      <div className="ccp-caption-wrap">
        {hasMultipleClips && (
          <div className="flex gap-1.5" role="tablist" aria-label="App clip playing">
            {clips.map((clip, clipIndex) => (
              <button
                key={clip.label}
                type="button"
                role="tab"
                aria-selected={clipIndex === currentClipIndex}
                aria-label={`Play: ${clip.label}`}
                className="h-5 flex-1 cursor-pointer"
                onClick={() => selectClipByIndex(clipIndex)}
              >
                <span className="block h-[3px] overflow-hidden rounded-full bg-white/[0.14]">
                  <span
                    ref={(segmentElement) => {
                      segmentFillRefs.current[clipIndex] = segmentElement;
                    }}
                    className="block h-full rounded-full bg-white transition-none"
                    style={{
                      width: clipIndex < currentClipIndex ? SEGMENT_FILL_FULL_PERCENT : SEGMENT_FILL_EMPTY_PERCENT,
                    }}
                  />
                </span>
              </button>
            ))}
          </div>
        )}

        <div key={currentClip.label} className="ccp-caption">
          <p className="flex items-center justify-center gap-2 font-mono text-[0.62rem] font-bold uppercase tracking-[0.24em] text-white/45">
            <span className="ccp-live-dot" aria-hidden="true" />
            Currently playing
            {hasMultipleClips && (
              <span className="text-white/25">
                {String(currentClipIndex + 1).padStart(2, '0')} / {String(clips.length).padStart(2, '0')}
              </span>
            )}
          </p>
          <p className="mt-1.5 font-display text-[1.08rem] font-extrabold leading-tight text-white">
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: currentClip.gradient }}
            >
              {currentClip.label}
            </span>
          </p>
          <p className="ccp-caption-sub mx-auto mt-1 max-w-[19rem] font-mono text-[0.68rem] leading-snug text-white/50">
            {currentClip.sub}
          </p>
        </div>
      </div>

      <div className="ccp-wrap">
        <div className="ccp-phone">
          <div className="ccp-btn ccp-btn-silent" aria-hidden="true" />
          <div className="ccp-btn ccp-btn-volume-up" aria-hidden="true" />
          <div className="ccp-btn ccp-btn-volume-down" aria-hidden="true" />
          <div className="ccp-btn ccp-btn-power" aria-hidden="true" />
          <div className="ccp-screen">
            <video
              ref={videoRef}
              key={currentClip.videoUrl}
              className="ccp-video"
              src={currentClip.videoUrl}
              autoPlay={!doesUserPreferReducedMotion}
              muted
              playsInline
              preload="auto"
              onCanPlay={attemptVideoPlayback}
              onEnded={advanceToNextClip}
              onTimeUpdate={updateProgressBarFill}
              data-testid="section-phone-video"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== MAIN COMPONENT =====

/**
 * A phone-framed video player that cycles through a list of clips and
 * shows a "currently playing" caption with progress segments above it.
 * Falls back to the placeholder outline when `clips` is empty.
 *
 * @param {Object} props
 * @param {Array<{
 *   label: string,
 *   sub: string,
 *   videoUrl: string,
 *   gradient: string,
 * }>} [props.clips] - The clips to play, in order
 * @param {'left'|'right'} [props.phoneSide='left'] - Which side the phone is on (for glow direction)
 * @returns {JSX.Element}
 */
export function SectionPhonePlayer({ clips = [], phoneSide = 'left' }) {
  if (!clips || clips.length === 0) {
    return <PhoneModelRoom phoneSide={phoneSide} />;
  }

  return <PhonePlayerInner clips={clips} phoneSide={phoneSide} />;
}

export { SectionPhonePlayer as FeaturePhoneVideoPlayer };

