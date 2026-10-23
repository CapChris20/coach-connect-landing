// HeroPhoneAppPlayer.jsx
// Phone mockup in the hero section displaying real Coach Connect app screen recordings.

import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../app-settings-and-helpers/useScreenSizeAndMotion';
import './hero-section.css';

// The two demo video clips: client experience and trainer experience
const PHONE_VIDEOS = [
  {
    side: 'client',
    titleLead: 'The',
    titleAccent: 'client side',
    titleGradient: 'linear-gradient(90deg, #FF6B9D, #F97316)',
    sub: 'Your whole day in one place — workouts, water, and what is on today.',
    videoUrl: '/videos/app-client-side.mp4',
    posterUrl: '/videos/app-client-side.jpg',
  },
  {
    side: 'trainer',
    titleLead: 'The',
    titleAccent: 'trainer side',
    titleGradient: 'linear-gradient(90deg, #C084FC, #06B6D4)',
    sub: 'Every client in one place — requests, weekly reports, and quick actions.',
    videoUrl: '/videos/app-trainer-side.mp4',
    posterUrl: '/videos/app-trainer-side.jpg',
  },
];

export function HeroPhoneAppPlayer() {
  const userPrefersReducedMotion = usePrefersReducedMotion();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPhoneOnScreen, setIsPhoneOnScreen] = useState(true);
  const videoElementRef = useRef(null);
  const phoneStageRef = useRef(null);
  const segmentFillRefs = useRef([]);
  const currentVideo = PHONE_VIDEOS[currentVideoIndex];

  // Pause playback when user scrolls away from the hero section
  useEffect(() => {
    const phoneStage = phoneStageRef.current;
    if (!phoneStage) return undefined;

    const observer = new IntersectionObserver(
      (entries) => setIsPhoneOnScreen(entries[0].isIntersecting),
      { threshold: 0.25 }
    );

    observer.observe(phoneStage);
    return () => observer.disconnect();
  }, []);

  // Safe helper to play video with muted sound enabled
  const tryPlayVideo = () => {
    const videoElement = videoElementRef.current;
    if (!videoElement || userPrefersReducedMotion || !isPhoneOnScreen) return;
    videoElement.muted = true;
    videoElement.play().catch(() => {});
  };

  useEffect(() => {
    const videoElement = videoElementRef.current;
    if (!videoElement) return;

    if (isPhoneOnScreen && !userPrefersReducedMotion) {
      tryPlayVideo();
    } else {
      videoElement.pause();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPhoneOnScreen, userPrefersReducedMotion, currentVideoIndex]);

  // When a video finishes, advance to the other clip
  const handleVideoEnded = () => {
    setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % PHONE_VIDEOS.length);
  };

  // Update progress bar width as the video plays
  const handleVideoTimeUpdate = () => {
    const videoElement = videoElementRef.current;
    const fillElement = segmentFillRefs.current[currentVideoIndex];
    if (!videoElement || !fillElement || !videoElement.duration) return;

    const percent = (videoElement.currentTime / videoElement.duration) * 100;
    fillElement.style.width = `${percent}%`;
  };

  // Jump to a specific clip when clicking its progress segment
  const jumpToVideo = (videoIndex) => {
    segmentFillRefs.current.forEach((fill) => {
      if (fill) fill.style.width = '0%';
    });
    setCurrentVideoIndex(videoIndex);
  };

  return (
    <div ref={phoneStageRef} data-testid="hero-phone">
      {/* Top caption: Shows which app side is currently playing */}
      <div className="ccp-caption-wrap">
        {/* Story progress segments */}
        <div className="hero-phone-segments" role="tablist" aria-label="App side playing">
          {PHONE_VIDEOS.map((phoneVideo, videoIndex) => (
            <button
              key={phoneVideo.side}
              type="button"
              role="tab"
              aria-selected={videoIndex === currentVideoIndex}
              aria-label={`Play the ${phoneVideo.side} side`}
              data-testid={`hero-phone-segment-${phoneVideo.side}`}
              className="hero-phone-segment-button"
              onClick={() => jumpToVideo(videoIndex)}
            >
              <span className="hero-phone-segment-track">
                <span
                  ref={(el) => {
                    segmentFillRefs.current[videoIndex] = el;
                  }}
                  className="hero-phone-segment-fill"
                  style={{ width: videoIndex < currentVideoIndex ? '100%' : '0%' }}
                />
              </span>
            </button>
          ))}
        </div>

        {/* Title and subtitle text for current clip */}
        <div key={currentVideo.side} className="ccp-caption">
          <p className="hero-phone-now-playing-label">
            <span className="ccp-live-dot" aria-hidden="true" />
            Currently playing
            <span className="hero-phone-counter">
              {String(currentVideoIndex + 1).padStart(2, '0')} / {String(PHONE_VIDEOS.length).padStart(2, '0')}
            </span>
          </p>

          <p className="hero-phone-title">
            {currentVideo.titleLead}{' '}
            <span
              className="hero-phone-title-gradient"
              style={{ backgroundImage: currentVideo.titleGradient }}
            >
              {currentVideo.titleAccent}
            </span>
          </p>

          <p className="ccp-caption-sub hero-phone-subtitle">{currentVideo.sub}</p>
        </div>
      </div>

      {/* Phone container */}
      <div className="ccp-wrap">
        <div className="ccp-phone">
          {/* Hardware side buttons */}
          <div className="ccp-btn ccp-btn-silent" aria-hidden="true" />
          <div className="ccp-btn ccp-btn-volume-up" aria-hidden="true" />
          <div className="ccp-btn ccp-btn-volume-down" aria-hidden="true" />
          <div className="ccp-btn ccp-btn-power" aria-hidden="true" />

          {/* Screen area with video */}
          <div className="ccp-screen">
            <video
              ref={videoElementRef}
              key={currentVideo.side}
              className="ccp-video"
              src={currentVideo.videoUrl}
              poster={currentVideo.posterUrl}
              autoPlay={!userPrefersReducedMotion}
              muted
              playsInline
              preload="auto"
              onCanPlay={tryPlayVideo}
              onEnded={handleVideoEnded}
              onTimeUpdate={handleVideoTimeUpdate}
              data-testid="hero-phone-video"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Backward-compatible alias
export { HeroPhoneAppPlayer as HeroPhone };
