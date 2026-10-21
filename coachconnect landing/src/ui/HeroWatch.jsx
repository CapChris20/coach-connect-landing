// HeroWatch — the Apple Watch-style card filling the hero's right cell.
// Flow: straps + titanium case, lugs, crown/buttons (pure CSS shapes,
// exterior ported from Cult UI's Apple Watch Ultra frame) → a true
// watchOS-style face on a black OLED screen. Top: live clock and date
// beside three activity rings (training, meal logging, water — the
// app's real daily loops). Below: the same eight app features the
// watch has always listed, in two columns at watch-list size, each
// wearing a hand-drawn icon in a gradient app tile (drawn below, no
// icon library) — the redesign changed the design, never the words.
// All styling lives in index.css under .ccw-* classes.
// Used by: ui/Sections.jsx (TopSection).

import { useEffect, useState } from 'react';

// ===== NAMED CONSTANTS =====

// The three rings, outside in. percent is how full the ring draws;
// display is the legend's spoken value. Colors are the watchOS way —
// one hue per ring — in the brand palette.
// Manipulate here: percent fills the ring; keep the three hues
// distinct or the rings blur into one donut at a glance.
const FACE_RINGS = [
  { label: 'Train', display: '38 of 45 min', percent: 84, color: '#FF6B9D', radius: 66 },
  { label: 'Meals logged', display: '3 of 4', percent: 75, color: '#C084FC', radius: 51 },
  { label: 'Water', display: '5 of 8 glasses', percent: 62, color: '#06B6D4', radius: 36 },
];

// The eight features on the face's right side — the same rows the
// watch has always carried (label is the feature, sub is its one-line
// proof). Each row's icon is hand-drawn below and sits in a gradient
// app tile, the way watchOS apps sit on a real watch: gradient holds
// the two tile colors, light end first.
// Manipulate here: keep subs under ~30 characters or they wrap at
// the column's ~200px width; swap gradient pairs to recolor a tile.
const WATCH_ROWS = [
  { icon: FindTrainersIcon, gradient: ['#FF6B9D', '#F97316'], label: 'Find trainers', sub: 'In the marketplace' },
  { icon: TrackProgressIcon, gradient: ['#06B6D4', '#C084FC'], label: 'Track progress', sub: 'Via client dashboard + AI Coach' },
  { icon: ExerciseHelpIcon, gradient: ['#C084FC', '#FF6B9D'], label: 'Exercise help', sub: 'Video Exercise Library +Plans + AI Coach' },
  { icon: LogNutritionIcon, gradient: ['#34D399', '#06B6D4'], label: 'Log nutrition', sub: 'Barcode · Food Search + History' },
  { icon: MessagingIcon, gradient: ['#F97316', '#FF6B9D'], label: 'Messaging', sub: 'Message your coach' },
  { icon: InAppPaymentsIcon, gradient: ['#FF6B9D', '#C084FC'], label: 'In-app payments', sub: 'Through Stripe' },
  { icon: SchedulingIcon, gradient: ['#2DD4BF', '#06B6D4'], label: 'Scheduling', sub: 'Book sessions' },
  { icon: AiCoachIcon, gradient: ['#F97316', '#FFC24B'], label: 'AI Coach', sub: 'Guide you through your journey' },
];

// ===== HELPER FUNCTIONS =====

// The eight app glyphs, hand-drawn for this face — no icon library.
// Each tells its feature's story in one mark (a person inside the
// search lens, a pulse that climbs, a scanner framing an apple), and
// each renders in currentColor so the tile behind it owns the color.
// vocab: viewBox = the icon's private 24×24 drawing grid; the tile's
// CSS scales the finished drawing down to fit.
// Manipulate here: strokeWidth 2 is the glyphs' weight — thinner
// reads delicate, thicker reads chunky at this tiny size.

/**
 * Find trainers: a person standing inside a magnifier lens.
 * @returns {JSX.Element}
 */
function FindTrainersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="10" cy="10" r="6.4" />
      <path d="M14.9 14.9 20 20" />
      <circle cx="10" cy="8.4" r="1.7" fill="currentColor" stroke="none" />
      <path d="M7.5 13.5c.5-1.4 1.4-2 2.5-2s2 .6 2.5 2" />
    </svg>
  );
}

/**
 * Track progress: a pulse line that turns into a climb, arrow at top.
 * @returns {JSX.Element}
 */
function TrackProgressIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 17.5h2.8l1.7-4 2.3 5.8 1.7-3.8h3L21 7" />
      <path d="M16.8 7H21v4.2" />
    </svg>
  );
}

/**
 * Exercise help: a chunky dumbbell, plates filled solid, tipped at
 * an angle like it's mid-lift.
 * @returns {JSX.Element}
 */
function ExerciseHelpIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <g transform="rotate(-28 12 12)">
        <rect x="2.4" y="9" width="3" height="6" rx="1.1" />
        <rect x="5.4" y="7.2" width="3.1" height="9.6" rx="1.1" />
        <rect x="15.5" y="7.2" width="3.1" height="9.6" rx="1.1" />
        <rect x="18.6" y="9" width="3" height="6" rx="1.1" />
        <rect x="8" y="10.6" width="8" height="2.8" rx="1.4" />
      </g>
    </svg>
  );
}

/**
 * Log nutrition: scanner corners (the barcode scanner) framing an apple.
 * @returns {JSX.Element}
 */
function LogNutritionIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M4 8.5v-2A2.5 2.5 0 0 1 6.5 4h2M15.5 4h2A2.5 2.5 0 0 1 20 6.5v2M20 15.5v2a2.5 2.5 0 0 1-2.5 2.5h-2M8.5 20h-2A2.5 2.5 0 0 1 4 17.5v-2" />
      <path
        d="M12 11.1c-.6 0-1-.3-1.8-.3-1.6 0-2.7 1.3-2.7 3.3 0 2.9 2 5.9 4.5 5.9.6 0 .8-.2 1-.2s.4.2 1 .2c2.5 0 4.5-3 4.5-5.9 0-2-1.1-3.3-2.7-3.3-.8 0-1.2.3-1.8.3Z"
        fill="currentColor"
        stroke="none"
      />
      <path d="M12.2 10.2c.1-1.4.8-2.4 2-2.8.1 1.3-.7 2.5-2 2.8Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * Messaging: a chat bubble with a coaching pulse running through it.
 * @returns {JSX.Element}
 */
function MessagingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6.8A2.8 2.8 0 0 0 17.2 4H6.8A2.8 2.8 0 0 0 4 6.8v6.4A2.8 2.8 0 0 0 6.8 16h1.4v3.6L12.4 16h4.8a2.8 2.8 0 0 0 2.8-2.8Z" />
      <path d="M6.8 11h1.9l1.1-2.2 1.9 4.4 1.1-2.2h4.4" />
    </svg>
  );
}

/**
 * In-app payments: a card paying contactless — chip line plus waves.
 * @returns {JSX.Element}
 */
function InAppPaymentsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="M3 9.8h18" />
      <path d="M6.5 15h3.5" />
      <path d="M15.6 12.9a2.4 2.4 0 0 1 0 2.7M17.7 11.6a4.4 4.4 0 0 1 0 5.3" />
    </svg>
  );
}

/**
 * Scheduling: a calendar with chunky binder rings and a bold check.
 * @returns {JSX.Element}
 */
function SchedulingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="5.5" width="16" height="15" rx="2.5" />
      <path d="M4 10h16" />
      <path d="M8.2 3.5v4M15.8 3.5v4" />
      <path d="m9 15.2 2.1 2.1 4-4.3" strokeWidth="2.3" />
    </svg>
  );
}

/**
 * AI Coach: a four-point spark (the guide) with a small orbiting star.
 * @returns {JSX.Element}
 */
function AiCoachIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M10.6 3.2c.4 4.5 2.1 6.4 6.6 6.9-4.5.5-6.2 2.4-6.6 6.9-.4-4.5-2.1-6.4-6.6-6.9 4.5-.5 6.2-2.4 6.6-6.9Z" />
      <path d="M18.6 13.8l.8 2.1 2.1.8-2.1.8-.8 2.1-.8-2.1-2.1-.8 2.1-.8Z" />
      <circle cx="19.4" cy="5.4" r="1.1" />
    </svg>
  );
}

/**
 * One activity ring: an SVG circle whose stroke draws itself to the
 * ring's percent once the face mounts.
 * vocab: stroke-dashoffset = how much of the circle's stroke is
 * hidden; sliding it from full circumference to the remainder is
 * what makes the ring appear to draw.
 * @param {Object} props
 * @param {{ label: string, display: string, percent: number, color: string }} props.ring - one entry from FACE_RINGS
 * @param {number} props.radius - the circle's radius in the shared viewBox
 * @param {boolean} props.ringsHaveDrawn - false on first paint, true a beat later (starts the draw)
 * @returns {JSX.Element}
 */
function ActivityRing({ ring, radius, ringsHaveDrawn }) {
  const ringCircumference = 2 * Math.PI * radius;
  const hiddenLength = ringsHaveDrawn ? ringCircumference * (1 - ring.percent / 100) : ringCircumference;

  return (
    <circle
      className="ccw-ring-bar"
      cx="80"
      cy="80"
      r={radius}
      fill="none"
      stroke={ring.color}
      strokeWidth="11"
      strokeLinecap="round"
      strokeDasharray={ringCircumference}
      strokeDashoffset={hiddenLength}
      transform="rotate(-90 80 80)"
    />
  );
}

// ===== MAIN FUNCTION =====

/**
 * The hero's Apple Watch card. The case hardware (straps, crown,
 * buttons) is decorative CSS; the screen is a living watch face —
 * real time, rings that draw on load, and the app's eight features
 * listed the way a watch lists apps.
 * The whole watch is sized and positioned by the .ccw-* classes in
 * index.css.
 * @returns {JSX.Element}
 */
export function HeroWatch() {
  // 1. The live clock: tick every second so the face never shows a
  // stale minute. vocab: the interval is the tick; clearing it on
  // unmount stops a dead timer calling setState forever.
  const [currentMoment, setCurrentMoment] = useState(() => new Date());
  useEffect(() => {
    const clockTimer = setInterval(() => setCurrentMoment(new Date()), 1000);
    return () => clearInterval(clockTimer);
  }, []);

  // 2. The rings draw a beat after mount, not on first paint, so the
  // sweep is visible instead of already-finished.
  const [ringsHaveDrawn, setRingsHaveDrawn] = useState(false);
  useEffect(() => {
    const drawTimer = setTimeout(() => setRingsHaveDrawn(true), 350);
    return () => clearTimeout(drawTimer);
  }, []);

  // 3. Format the face's time and date the watchOS way: 9:41, TUE 20 OCT.
  const faceTime = currentMoment.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M/i, '');
  const faceDate = currentMoment
    .toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })
    .replace(',', '')
    .toUpperCase();

  return (
    // vocab: .ccw-wrap = the stage that centers the watch and crops the
    // straps (they run 970px past the case, top and bottom, so the band
    // spans the full hero height — see index.css)
    <div className="ccw-wrap" data-testid="hero-watch">
      <div className="ccw-watch">
        <div className="ccw-strap ccw-strap-top" />
        <div className="ccw-strap ccw-strap-bottom" />
        <div className="ccw-case">
          {/* The hardware bumps around the case edge — wells sit under the
              buttons they hold, exactly like the original component */}
          <div className="ccw-crown-well" />
          <div className="ccw-crown" />
          <div className="ccw-side-btn-well" />
          <div className="ccw-side-btn" />
          <div className="ccw-action-btn-well" />
          <div className="ccw-action-btn" />
          {/* The band lugs — titanium connectors where the straps meet the case */}
          <div className="ccw-lug ccw-lug-top" />
          <div className="ccw-lug ccw-lug-bottom" />
          <div className="ccw-display">
            <div className="ccw-screen">
              {/* 4. Top band: date and live time left, rings right. */}
              <div className="ccw-face-head">
                <div>
                  <p className="ccw-face-date">{faceDate}</p>
                  <p className="ccw-face-time" data-testid="hero-watch-time">
                    {faceTime}
                  </p>
                </div>
                <div className="ccw-face-rings">
                  <div className="ccw-rings" aria-hidden="true">
                    <svg viewBox="0 0 160 160" className="ccw-rings-svg">
                      {FACE_RINGS.map((ring) => (
                        <circle
                          key={`${ring.label}-track`}
                          cx="80"
                          cy="80"
                          r={ring.radius}
                          fill="none"
                          stroke={ring.color}
                          strokeOpacity="0.18"
                          strokeWidth="11"
                        />
                      ))}
                      {FACE_RINGS.map((ring) => (
                        <ActivityRing key={ring.label} ring={ring} radius={ring.radius} ringsHaveDrawn={ringsHaveDrawn} />
                      ))}
                    </svg>
                  </div>
                  <ul className="ccw-ring-legend">
                    {FACE_RINGS.map((ring) => (
                      <li key={ring.label} className="ccw-ring-legend-row">
                        <span className="ccw-ring-dot" style={{ backgroundColor: ring.color }} aria-hidden="true" />
                        <span className="ccw-ring-legend-label">{ring.label}</span>
                        <span className="ccw-ring-legend-value">{ring.display}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 5. The title and the eight features in two columns
                  across the full width — glyph, label, proof. */}
              <h2 className="ccw-face-title" data-testid="hero-watch-title">
                All in <span className="ccw-title-gradient">one app</span>
              </h2>
              <ul className="ccw-face-list">
                {WATCH_ROWS.map((watchRow) => {
                  const WatchRowIcon = watchRow.icon;
                  // vocab: --tile-glow = this row's private CSS variable;
                  // the tile's soft colored shadow in index.css reads it.
                  const tileStyle = {
                    background: `linear-gradient(135deg, ${watchRow.gradient[0]}, ${watchRow.gradient[1]})`,
                    '--tile-glow': `${watchRow.gradient[0]}59`,
                  };
                  return (
                    <li key={watchRow.label} className="ccw-face-row" data-testid="hero-watch-row">
                      <span className="ccw-app-tile" style={tileStyle} aria-hidden="true">
                        <WatchRowIcon />
                      </span>
                      <span>
                        <span className="ccw-face-row-label">{watchRow.label}</span>
                        <span className="ccw-face-row-sub">{watchRow.sub}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>

              {/* 6. The mini wordmark signs the face off like a splash screen */}
              <p className="ccw-footer-wordmark">COACH CONNECT</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
