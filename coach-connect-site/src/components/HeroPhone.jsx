// HeroPhone.jsx — the homepage hero's iPhone, ported from the first landing site.
// Plays the client side, then the trainer side, with story-style progress
// segments and a "currently playing" caption above the phone. Pauses off-screen;
// reduced motion shows the poster only.
// Styling: styles/hero.css (.ccp-* and .hero-phone-*).
import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from './hooks';

const PHONE_VIDEOS = [
  {
    side: 'client',
    titleLead: 'The',
    titleAccent: 'client side',
    titleGradient: 'linear-gradient(90deg, #FF6B9D, #F97316)',
    sub: 'Your whole day in one place: workouts, water, and what is on today.',
    videoUrl: 'videos/app-client-side.mp4',
    posterUrl: 'videos/app-client-side.jpg',
  },
  {
    side: 'trainer',
    titleLead: 'The',
    titleAccent: 'trainer side',
    titleGradient: 'linear-gradient(90deg, #C084FC, #06B6D4)',
    sub: 'Every client in one place: requests, weekly reports, and quick actions.',
    videoUrl: 'videos/app-trainer-side.mp4',
    posterUrl: 'videos/app-trainer-side.jpg',
  },
];

/**
 * @returns {JSX.Element}
 */
export function HeroPhone() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPhoneOnScreen, setIsPhoneOnScreen] = useState(true);
  const videoElementRef = useRef(null);
  const phoneStageRef = useRef(null);
  const segmentFillRefs = useRef([]);
  const currentVideo = PHONE_VIDEOS[currentVideoIndex];

  // 1. Pause when the hero scrolls away.
  useEffect(() => {
    const phoneStage = phoneStageRef.current;
    if (!phoneStage) return undefined;
    const observer = new IntersectionObserver((entries) => setIsPhoneOnScreen(entries[0].isIntersecting), { threshold: 0.25 });
    observer.observe(phoneStage);
    return () => observer.disconnect();
  }, []);

  const tryPlayVideo = () => {
    const videoElement = videoElementRef.current;
    if (!videoElement || prefersReducedMotion || !isPhoneOnScreen) return;
    videoElement.muted = true;
    videoElement.play().catch(() => {});
  };

  // 2. Play or pause whenever visibility, motion preference or clip changes.
  useEffect(() => {
    const videoElement = videoElementRef.current;
    if (!videoElement) return;
    if (isPhoneOnScreen && !prefersReducedMotion) tryPlayVideo();
    else videoElement.pause();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPhoneOnScreen, prefersReducedMotion, currentVideoIndex]);

  // 3. A finished clip hands over to the other side.
  const handleVideoEnded = () => setCurrentVideoIndex((previousIndex) => (previousIndex + 1) % PHONE_VIDEOS.length);

  // vocab: writing the width straight onto the bar skips a React render per frame
  const handleVideoTimeUpdate = () => {
    const videoElement = videoElementRef.current;
    const fillElement = segmentFillRefs.current[currentVideoIndex];
    if (!videoElement || !fillElement || !videoElement.duration) return;
    fillElement.style.width = `${(videoElement.currentTime / videoElement.duration) * 100}%`;
  };

  const jumpToVideo = (videoIndex) => {
    segmentFillRefs.current.forEach((fill) => {
      if (fill) fill.style.width = '0%';
    });
    setCurrentVideoIndex(videoIndex);
  };

  return (
    <div ref={phoneStageRef}>
      <div className="ccp-caption-wrap">
        <div className="hero-phone-segments" role="tablist" aria-label="App side playing">
          {PHONE_VIDEOS.map((phoneVideo, videoIndex) => (
            <button
              key={phoneVideo.side}
              type="button"
              role="tab"
              aria-selected={videoIndex === currentVideoIndex}
              aria-label={`Play the ${phoneVideo.side} side`}
              className="hero-phone-segment-button"
              onClick={() => jumpToVideo(videoIndex)}
            >
              <span className="hero-phone-segment-track">
                <span
                  ref={(element) => {
                    segmentFillRefs.current[videoIndex] = element;
                  }}
                  className="hero-phone-segment-fill"
                  style={{ width: videoIndex < currentVideoIndex ? '100%' : '0%' }}
                />
              </span>
            </button>
          ))}
        </div>

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
            <span className="hero-phone-title-gradient" style={{ backgroundImage: currentVideo.titleGradient }}>
              {currentVideo.titleAccent}
            </span>
          </p>
          <p className="ccp-caption-sub hero-phone-subtitle">{currentVideo.sub}</p>
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
              ref={videoElementRef}
              key={currentVideo.side}
              className="ccp-video"
              src={currentVideo.videoUrl}
              poster={currentVideo.posterUrl}
              autoPlay={!prefersReducedMotion}
              muted
              playsInline
              preload="auto"
              onCanPlay={tryPlayVideo}
              onEnded={handleVideoEnded}
              onTimeUpdate={handleVideoTimeUpdate}
              aria-label={`Screen recording of the Coach Connect app, ${currentVideo.side} side`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
