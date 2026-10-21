// HeroPhone — the iPhone on the hero's left, playing the real app.
// Flow: titanium frame + side buttons (pure CSS shapes, .ccp-* in
// index.css) → the owner's own screen recordings of Coach Connect
// inside it, alternating on a loop: the client side empties first,
// then the trainer side. When a clip ends, the next one takes the
// screen, and the caption above the phone — story-style progress
// segments, a "currently playing" line, and the side's name — switches
// with it. Tapping a segment jumps straight to that side. The clips
// are the owner's recordings, transcoded for the web (H.264, no audio)
// into public/videos/.
// Used by: ui/Sections.jsx (TopSection).

import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../hooks/useLanding';

// ===== NAMED CONSTANTS =====

// The two clips, in play order. titleAccent wears the side's gradient
// (clients pink-to-orange, trainers purple-to-cyan — the same pairing
// as the audience blocks in chapter 01).
// Manipulate here: swap the order to open on the trainer side; the
// caption, segments, and counter all follow this list.
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

// ===== MAIN FUNCTION =====

/**
 * The hero's iPhone. The frame hardware is decorative CSS (.ccp-* in
 * index.css); the screen is a muted, looping playlist of the two app
 * recordings, and the caption under the phone always names the side
 * currently playing. Reduced-motion visitors get the posters instead
 * of autoplay — the segments still switch sides on tap.
 * @returns {JSX.Element}
 */
export function HeroPhone() {
  const userPrefersReducedMotion = usePrefersReducedMotion();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPhoneOnScreen, setIsPhoneOnScreen] = useState(true);
  const videoElementRef = useRef(null);
  const phoneStageRef = useRef(null);
  const segmentFillRefs = useRef([]);
  const currentVideo = PHONE_VIDEOS[currentVideoIndex];

  // 1. Play or pause with visibility: a hero video nobody is looking
  // at (scrolled past, or tab in the background of the page) should
  // not keep decoding. Reduced motion means never autoplay at all.
  // vocab: IntersectionObserver = "tell me when this box enters or
  // leaves the screen" — the browser watches, we just react.
  useEffect(() => {
    // Watch the STAGE, never the <video>: the video element is
    // remounted on every side switch (key change), and a watcher left
    // observing the dead element reported "off screen" forever —
    // which paused the trainer clip on arrival and blocked its play.
    const phoneStage = phoneStageRef.current;
    if (!phoneStage) return undefined;
    const visibilityWatcher = new IntersectionObserver(
      (watcherEntries) => setIsPhoneOnScreen(watcherEntries[0].isIntersecting),
      { threshold: 0.25 },
    );
    visibilityWatcher.observe(phoneStage);
    return () => visibilityWatcher.disconnect();
  }, []);

  // The one way a clip starts: sound off (set on the element itself —
  // the muted attribute alone does not always flip the property
  // browsers check), then play. Calling play() before the clip can
  // actually play gets the promise cancelled by the load, which used
  // to leave the trainer clip sitting paused forever; so this runs
  // from the canplay event below as well as from state changes, and
  // whichever attempt lands when the clip is ready is the one that
  // starts it.
  // vocab: canplay = the video element's "enough is loaded to start".
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

  // 2. A clip finished: hand the screen to the next side (and loop
  // back to the first after the last).
  const handleVideoEnded = () => {
    setCurrentVideoIndex((videoIndex) => (videoIndex + 1) % PHONE_VIDEOS.length);
  };

  // 3. Fill the playing segment straight from the playhead — writing
  // the width onto the node itself, so the bar moves every frame
  // without re-rendering the phone.
  // vocab: timeupdate = the video element's "the clock moved" event.
  const handleVideoTimeUpdate = () => {
    const videoElement = videoElementRef.current;
    const fillElement = segmentFillRefs.current[currentVideoIndex];
    if (!videoElement || !fillElement || !videoElement.duration) return;
    fillElement.style.width = `${(videoElement.currentTime / videoElement.duration) * 100}%`;
  };

  // 4. A segment tap jumps to that side (and restarts its bar).
  const jumpToVideo = (videoIndex) => {
    segmentFillRefs.current.forEach((fillElement) => {
      if (fillElement) fillElement.style.width = '0%';
    });
    setCurrentVideoIndex(videoIndex);
  };

  return (
    <div ref={phoneStageRef} data-testid="hero-phone">
      {/* The caption ABOVE the phone: which side is playing right now.
          It used to sit under the phone, where the hero's fold and the
          scroll hint crowded it out of view; up top it reads before
          the clip does. It re-mounts on every switch (key on the
          side), which is what replays its rise-in animation in
          index.css (.ccp-caption).
          Manipulate here: the lead/accent split is where the side's
          gradient lands — recolor in PHONE_VIDEOS above. */}
      <div className="ccp-caption-wrap">
        <div className="flex gap-1.5" role="tablist" aria-label="App side playing">
          {PHONE_VIDEOS.map((phoneVideo, videoIndex) => (
            <button
              key={phoneVideo.side}
              type="button"
              role="tab"
              aria-selected={videoIndex === currentVideoIndex}
              aria-label={`Play the ${phoneVideo.side} side`}
              data-testid={`hero-phone-segment-${phoneVideo.side}`}
              className="h-5 flex-1 cursor-pointer"
              onClick={() => jumpToVideo(videoIndex)}
            >
              <span className="block h-[3px] overflow-hidden rounded-full bg-white/[0.14]">
                <span
                  ref={(fillElement) => {
                    segmentFillRefs.current[videoIndex] = fillElement;
                  }}
                  className="block h-full rounded-full bg-white"
                  style={{ width: videoIndex < currentVideoIndex ? '100%' : '0%' }}
                />
              </span>
            </button>
          ))}
        </div>

        <div key={currentVideo.side} className="ccp-caption">
          <p className="flex items-center justify-center gap-2 font-mono text-[0.62rem] font-bold uppercase tracking-[0.24em] text-white/45">
            <span className="ccp-live-dot" aria-hidden="true" />
            Currently playing
            <span className="text-white/25">
              {String(currentVideoIndex + 1).padStart(2, '0')} / {String(PHONE_VIDEOS.length).padStart(2, '0')}
            </span>
          </p>
          <p className="mt-1.5 font-display text-[1.08rem] font-extrabold leading-tight text-white">
            {currentVideo.titleLead}{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: currentVideo.titleGradient }}
            >
              {currentVideo.titleAccent}
            </span>
          </p>
          <p className="ccp-caption-sub mx-auto mt-1 max-w-[19rem] font-mono text-[0.68rem] leading-snug text-white/50">{currentVideo.sub}</p>
        </div>
      </div>

      {/* vocab: .ccp-wrap = the stage holding the phone; it owns the
          float animation and the drop shadow, the phone owns the metal. */}
      <div className="ccp-wrap">
        <div className="ccp-phone">
          {/* Hardware: the side buttons on the rails */}
          <div className="ccp-btn ccp-btn-silent" aria-hidden="true" />
          <div className="ccp-btn ccp-btn-volume-up" aria-hidden="true" />
          <div className="ccp-btn ccp-btn-volume-down" aria-hidden="true" />
          <div className="ccp-btn ccp-btn-power" aria-hidden="true" />
          <div className="ccp-screen">
            {/* The recording fills the screen edge to edge. It carries
                its own status bar and island from the owner's iPhone,
                so the frame adds none of its own.
                vocab: object-cover = crop-to-fill (the frame and the
                recording share the same tall ratio, so nothing real
                is cropped); playsInline = never hijack to fullscreen
                on iOS; the poster shows until the first frame lands. */}
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
