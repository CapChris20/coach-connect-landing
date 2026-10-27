// Watch.jsx — the Coach Connect watch face, ported from the first landing site.
// Flow: a CSS-built watch (case, crown, lugs, sport band) around a black OLED
// face: live clock, three daily-loop rings, and the app's eight features.
// The picker under it swaps band and case metal (user action only).
// Recoloured to the brand palette; copy rewritten to DESIGN.md section 13.
// Styling: styles/watch.css (.ccw-* classes). Used by: /clients.

import { useEffect, useState } from 'react';

// ===== NAMED CONSTANTS =====

// The bands the exterior picker offers. id is the name the CSS
// listens for (data-band on .ccw-watch in styles/watch.css); swatch paints
// the picker's dot.
// Manipulate here: add a band by adding a row here AND a matching
// [data-band="..."] block in styles/watch.css — one without the other does
// nothing. Alpine is the woven one; the rest are smooth sport bands.
const BAND_STYLES = [
  { id: 'sport-light', label: 'Starlight sport band', swatch: 'linear-gradient(135deg, #F3F4F6, #D9DDE3)' },
  { id: 'midnight', label: 'Midnight sport band', swatch: 'linear-gradient(135deg, #2B2B31, #0C0C10)' },
  { id: 'sunset', label: 'Sunset sport band', swatch: 'linear-gradient(135deg, #C03C98, #F59A33)' },
  { id: 'alpine', label: 'Alpine woven band', swatch: 'repeating-linear-gradient(45deg, #F97316 0 3px, #7C2D12 3px 6px)' },
];

// The case metals the exterior picker offers, Ultra-style: natural
// titanium, gold titanium, slate titanium. id works exactly like the
// bands' — the CSS hangs each metal off [data-case="..."].
// Manipulate here: same rule as the bands — a row here plus its
// [data-case="..."] block in styles/watch.css, or the dot changes nothing.
const CASE_FINISHES = [
  { id: 'natural', label: 'Natural titanium case', swatch: 'linear-gradient(135deg, #E8E4DC, #8A857C)' },
  { id: 'gold', label: 'Gold titanium case', swatch: 'linear-gradient(135deg, #F3D9A4, #A87B2D)' },
  { id: 'slate', label: 'Slate titanium case', swatch: 'linear-gradient(135deg, #55565C, #17181C)' },
];

// The three rings, outside in. percent is how full the ring draws;
// display is the legend's spoken value. Colors are the watchOS way —
// one hue per ring — in the brand palette.
// Manipulate here: percent fills the ring; keep the three hues
// distinct or the rings blur into one donut at a glance.
const FACE_RINGS = [
  { label: 'Train', display: '38 of 45 min', percent: 84, color: '#C03C98', radius: 66 },
  { label: 'Meals logged', display: '3 of 4', percent: 75, color: '#7B3CF5', radius: 51 },
  { label: 'Water', display: '5 of 8 glasses', percent: 62, color: '#F59A33', radius: 36 },
];

// The eight features on the face's right side — the same rows the
// watch has always carried (label is the feature, sub is its one-line
// proof). Each row's icon is hand-drawn below and sits in a gradient
// app tile, the way watchOS apps sit on a real watch: gradient holds
// the two tile colors, light end first.
// Manipulate here: keep subs under ~30 characters or they wrap at
// the column's ~200px width; swap gradient pairs to recolor a tile.
const COOL = ['#5B16F0', '#C03C98'];
const WARM = ['#C03C98', '#F59A33'];
const WATCH_ROWS = [
  { icon: FindTrainersIcon, gradient: WARM, label: 'Find trainers', sub: 'Search the marketplace' },
  { icon: TrackProgressIcon, gradient: COOL, label: 'Track progress', sub: 'Check-ins + history' },
  { icon: ExerciseHelpIcon, gradient: WARM, label: 'Exercise help', sub: 'Video library + plans' },
  { icon: LogNutritionIcon, gradient: COOL, label: 'Log nutrition', sub: 'Barcode + food search' },
  { icon: MessagingIcon, gradient: WARM, label: 'Messaging', sub: 'Message your coach' },
  { icon: InAppPaymentsIcon, gradient: COOL, label: 'In-app payments', sub: 'Through Stripe' },
  { icon: SchedulingIcon, gradient: WARM, label: 'Scheduling', sub: 'Book sessions' },
  { icon: AiCoachIcon, gradient: COOL, label: 'AI Coach', sub: 'Logs for you, asks first' },
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

/**
 * The exterior picker: two rows of swatch dots floating under the
 * watch — bands on the left, case metals on the right. It lives
 * OUTSIDE the screen on purpose (the visitor is dressing the watch,
 * not using an app), and it only ever changes data-band / data-case
 * on .ccw-watch; every color it can pick is CSS hanging off those
 * two names in styles/watch.css.
 * vocab: aria-pressed = how a screen reader hears a picker dot —
 * "pressed" is the one currently on the watch.
 * @param {Object} props
 * @param {string} props.selectedBandId - the band currently on the watch
 * @param {string} props.selectedCaseId - the case metal currently on the watch
 * @param {(bandId: string) => void} props.chooseBand - put a band on the watch
 * @param {(caseId: string) => void} props.chooseCaseFinish - put a case metal on the watch
 * @returns {JSX.Element}
 */
function WatchExteriorPicker({ selectedBandId, selectedCaseId, chooseBand, chooseCaseFinish }) {
  return (
    <div className="ccw-customizer" data-testid="hero-watch-customizer">
      <div className="ccw-customizer-group" role="group" aria-label="Watch band">
        <span className="ccw-customizer-label" aria-hidden="true">
          Band
        </span>
        {BAND_STYLES.map((bandStyle) => (
          <button
            key={bandStyle.id}
            type="button"
            className="ccw-swatch"
            style={{ background: bandStyle.swatch }}
            aria-label={bandStyle.label}
            aria-pressed={bandStyle.id === selectedBandId}
            title={bandStyle.label}
            onClick={() => chooseBand(bandStyle.id)}
          />
        ))}
      </div>
      <span className="ccw-customizer-divider" aria-hidden="true" />
      <div className="ccw-customizer-group" role="group" aria-label="Case finish">
        <span className="ccw-customizer-label" aria-hidden="true">
          Case
        </span>
        {CASE_FINISHES.map((caseFinish) => (
          <button
            key={caseFinish.id}
            type="button"
            className="ccw-swatch"
            style={{ background: caseFinish.swatch }}
            aria-label={caseFinish.label}
            aria-pressed={caseFinish.id === selectedCaseId}
            title={caseFinish.label}
            onClick={() => chooseCaseFinish(caseFinish.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ===== MAIN FUNCTION =====

/**
 * The hero's Apple Watch card. The exterior is customizable (band
 * and case picker under the watch, branded hardware details in CSS);
 * the screen inside is a living watch face — real time, rings that
 * draw on load, and the app's eight features listed the way a watch
 * lists apps. Picking a band or a case never touches the screen.
 * The whole watch is sized and positioned by the .ccw-* classes in
 * styles/watch.css.
 * @returns {JSX.Element}
 */
export function Watch() {
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

  // 4. The exterior the visitor dresses: which band is strapped on
  // and which metal the case is cut from. These two names are the
  // whole contract with styles/watch.css — data-band and data-case on
  // .ccw-watch restyle the straps, keeper, lugs, crown, and case,
  // and nothing on the screen reads them.
  const [selectedBandId, setSelectedBandId] = useState('midnight');
  const [selectedCaseId, setSelectedCaseId] = useState(CASE_FINISHES[0].id);
  const chooseBand = (bandId) => setSelectedBandId(bandId);
  const chooseCaseFinish = (caseId) => setSelectedCaseId(caseId);

  return (
    // vocab: .ccw-wrap = the stage that centers the watch and crops the
    // straps (they run 970px past the case, top and bottom, so the band
    // spans the full hero height — see styles/watch.css)
    <div className="ccw-wrap" data-testid="watch">
      {/* vocab: data-band / data-case = the two names the picker below
          rewrites; every strap and metal color in styles/watch.css hangs off
          them, so this one line is where the exterior changes. */}
      <div className="ccw-watch" data-band={selectedBandId} data-case={selectedCaseId}>
        {/* The band, branded: the name runs down the top strap and a
            brand stripe rides its edge (the stripe is a child because
            both strap pseudos already carry the pin, keeper, holes) */}
        <div className="ccw-strap ccw-strap-top">
          <span className="ccw-strap-stripe" aria-hidden="true" />
          <span className="ccw-strap-brand" aria-hidden="true">
            COACH CONNECT
          </span>
        </div>
        <div className="ccw-strap ccw-strap-bottom">
          <span className="ccw-strap-stripe" aria-hidden="true" />
        </div>
        <div className="ccw-case">
          {/* The hardware bumps around the case edge — wells sit under the
              buttons they hold, exactly like the original component */}
          <div className="ccw-crown-well" />
          <div className="ccw-crown" />
          {/* The crown guards: the two raised shoulders a real Ultra
              case wraps around its crown, above and below the dial */}
          <div className="ccw-crown-guard ccw-crown-guard-top" />
          <div className="ccw-crown-guard ccw-crown-guard-bottom" />
          <div className="ccw-side-btn-well" />
          <div className="ccw-side-btn" />
          <div className="ccw-action-btn-well" />
          <div className="ccw-action-btn" />
          {/* The speaker slots cut into the left case edge, under the
              action button — drawn as one slotted strip in styles/watch.css */}
          <div className="ccw-speaker" aria-hidden="true" />
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
              <p className="ccw-face-title" data-testid="hero-watch-title">
                Your day in Coach Connect
              </p>
              <ul className="ccw-face-list">
                {WATCH_ROWS.map((watchRow) => {
                  const WatchRowIcon = watchRow.icon;
                  const tileStyle = {
                    background: `linear-gradient(135deg, ${watchRow.gradient[0]}, ${watchRow.gradient[1]})`,
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

      {/* 7. The exterior picker, floating over the lower strap —
          dressing the watch happens out here, never on its screen. */}
      <WatchExteriorPicker
        selectedBandId={selectedBandId}
        selectedCaseId={selectedCaseId}
        chooseBand={chooseBand}
        chooseCaseFinish={chooseCaseFinish}
      />
    </div>
  );
}


