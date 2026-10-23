// AudienceSkeleton — the shared layout for the audience pages
// (/for-trainers, /for-clients, /for-both). Every page renders this
// frame: nav, a page header, the page's sections IN ORDER as filled
// feature boards, and a waitlist finale that already works. Each
// section opens with a real header (giant number, feature name, and
// the plain description set as a lede beside it — never as a
// paragraph dumped at the top of a card), then its board: a header
// band naming what is inside, the feature's first part promoted to
// lead capability, and the remaining parts as an ordered editorial
// list. That ranking is the design research in one move (Stripe /
// Linear feature pages, checked 2026-10-21): size and order say
// what matters, four identical tiles say nothing. Every feature and
// part is real, written from the app itself — no invented features.
// Every section also reserves room for a phone model, alternating
// sides down the page: odd sections (1st, 3rd, …) put the phone on
// the left, even sections (2nd, 4th, …) put it on the right. The
// reserved room is only an outline and a soft gradient glow — no
// solid color fills — and the owner's recordings drop into it later
// without moving anything around it.
// Flow: header → numbered feature sections → finale → footer.
// Used by: pages/ForTrainers.jsx, pages/ForClients.jsx, pages/ForBoth.jsx.

// ===== IMPORTS =====

import { Link } from 'react-router-dom';
import { NavigationBar as NavBar } from '../../app-header-and-nav/NavigationBar';
import { FeaturePhoneVideoPlayer as SectionPhonePlayer } from './FeaturePhoneVideoPlayer';
import './audience-pages.css';

// ===== NAMED CONSTANTS =====

// Gradient pairs cycled down the sections, one per card: the glow in
// the card's corner, its top rule, and its point numbers all wear the
// section's pair. Pink→orange is the brand pair; the others keep a
// long page from reading as one flat color.
const CONTENT_ACCENT_PAIRS = [
  ['#FF6B9D', '#F97316'],
  ['#C084FC', '#06B6D4'],
  ['#F97316', '#FFD166'],
  ['#34D399', '#06B6D4'],
];

// String padding length for two-digit numbers (e.g., '01', '02')
const SECTION_NUMBER_PAD_LENGTH = 2;

// Indices for extracting lead and supporting capabilities from points array
const LEAD_POINT_INDEX = 0;
const SUPPORTING_POINTS_START_INDEX = 1;
const FIRST_WORD_INDEX = 0;

// Alternate sides every 2 sections
const SECTION_ALTERNATION_DIVISOR = 2;

// ===== HELPER FUNCTIONS =====

/**
 * Format a zero-based index as a two-digit display string ('01', '02').
 * @param {number} zeroBasedIndex
 * @returns {string} Two-digit display string
 */
function formatNumberWithLeadingZero(zeroBasedIndex) {
  return String(zeroBasedIndex + 1).padStart(SECTION_NUMBER_PAD_LENGTH, '0');
}

/**
 * Build the radial gradient glow CSS string for a section card corner.
 * @param {string[]} accentPair
 * @returns {string} Radial gradient CSS
 */
function createCornerGlowGradient(accentPair) {
  return `radial-gradient(circle at 88% 0%, ${accentPair[0]}33, ${accentPair[1]}14 42%, transparent 68%)`;
}

/**
 * Build the linear gradient CSS string for rules and text clips.
 * @param {string[]} accentPair
 * @returns {string} Linear gradient CSS
 */
function createLinearAccentGradient(accentPair) {
  return `linear-gradient(90deg, ${accentPair[0]}, ${accentPair[1]})`;
}

/**
 * One filled feature board: a header band, the feature's first part
 * promoted to lead capability, then the remaining parts as an
 * ordered editorial list.
 * @param {Object} props
 * @param {{ title: string, description: string, points: { label: string, text: string }[] }} props.section
 * @param {number} props.sectionIndex
 * @param {string[]} props.accentPair
 * @returns {JSX.Element}
 */
function SectionContentCard({ section, sectionIndex, accentPair }) {
  const leadCapabilityPoint = section.points[LEAD_POINT_INDEX];
  const supportingCapabilityPoints = section.points.slice(SUPPORTING_POINTS_START_INDEX);
  const accentGradientStyle = createLinearAccentGradient(accentPair);
  const cornerGlowStyle = createCornerGlowGradient(accentPair);
  const leadGhostWordText = leadCapabilityPoint.label.split(' ')[FIRST_WORD_INDEX].toUpperCase();

  return (
    <div
      className="relative overflow-hidden rounded-[2rem] border border-white/[0.12] bg-[linear-gradient(160deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02)_48%,rgba(255,255,255,0.01))]"
      data-testid="audience-content-card"
    >
      <div className="pointer-events-none absolute inset-0" style={{ background: cornerGlowStyle }} aria-hidden="true" />

      <div className="relative flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-white/[0.08] px-6 py-4 sm:px-8">
        <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em]" style={{ color: accentPair[0] }}>
          Inside {section.title}
        </p>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-white/35">
          {String(section.points.length).padStart(SECTION_NUMBER_PAD_LENGTH, '0')} parts · lead first
        </p>
      </div>

      <div className="relative overflow-hidden px-6 pt-6 sm:px-8 sm:pt-7">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-2 -top-3 select-none font-display text-[5rem] font-black uppercase leading-none text-transparent sm:text-[6.5rem]"
          style={{ WebkitTextStroke: '1px rgba(255,255,255,0.08)' }}
        >
          {leadGhostWordText}
        </span>
        <p
          className="relative bg-clip-text font-pixel text-[0.6rem] uppercase leading-relaxed text-transparent"
          style={{ backgroundImage: accentGradientStyle }}
        >
          01 · Lead capability
        </p>
        <h3 className="relative mt-3 font-display text-2xl font-extrabold leading-tight text-white sm:text-3xl">
          {leadCapabilityPoint.label}
        </h3>
        <p className="relative mt-2 max-w-xl font-mono text-sm leading-relaxed text-white/60">
          {leadCapabilityPoint.text}
        </p>
        <span
          className="relative mt-5 block h-[3px] w-16 rounded-full"
          style={{ background: accentGradientStyle }}
          aria-hidden="true"
        />
      </div>

      <ol className="relative mt-2 list-none px-3 pb-4 sm:px-4">
        {supportingCapabilityPoints.map((point, supportingPointIndex) => (
          <li
            key={point.label}
            className="grid grid-cols-[2.75rem_minmax(0,1fr)] items-baseline gap-x-4 border-t border-white/[0.06] px-3 py-4 transition-colors duration-200 first:border-t-0 hover:bg-white/[0.04] sm:grid-cols-[3.25rem_minmax(0,11rem)_minmax(0,1fr)] sm:rounded-2xl sm:px-4"
          >
            <span
              className="bg-clip-text font-display text-lg font-extrabold leading-none text-transparent"
              style={{ backgroundImage: accentGradientStyle }}
            >
              {String(supportingPointIndex + 2).padStart(SECTION_NUMBER_PAD_LENGTH, '0')}
            </span>
            <h4 className="font-display text-base font-bold leading-snug text-white">{point.label}</h4>
            <p className="col-start-2 mt-1 text-sm leading-relaxed text-white/55 sm:col-start-auto sm:mt-0">
              {point.text}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * One numbered section: the feature name, the filled content card,
 * and the phone player (alternating sides).
 * @param {Object} props
 * @param {{ title: string, description: string, points: { label: string, text: string }[], videos?: Array }} props.section
 * @param {number} props.sectionIndex
 * @returns {JSX.Element}
 */
function SkeletonSection({ section, sectionIndex }) {
  const sectionNumberText = formatNumberWithLeadingZero(sectionIndex);
  const isPhoneOnLeft = sectionIndex % SECTION_ALTERNATION_DIVISOR === 0;
  const phoneSide = isPhoneOnLeft ? 'left' : 'right';
  const accentPair = CONTENT_ACCENT_PAIRS[sectionIndex % CONTENT_ACCENT_PAIRS.length];
  const sectionGridClassName = isPhoneOnLeft
    ? 'mt-8 grid items-center gap-8 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-12'
    : 'mt-8 grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:gap-12';

  const sectionContentCardElement = (
    <SectionContentCard section={section} sectionIndex={sectionIndex} accentPair={accentPair} />
  );
  const phonePlayerElement = <SectionPhonePlayer clips={section.videos} phoneSide={phoneSide} />;

  return (
    <section
      id={`feature-${sectionNumberText}`}
      className="scroll-mt-32 border-t border-white/[0.08] py-10 sm:py-12"
      data-testid="skeleton-section"
    >
      <div className="flex flex-wrap items-end gap-x-8 gap-y-5">
        <div className="flex items-end gap-5">
          <span
            aria-hidden="true"
            className="bg-clip-text font-display text-6xl font-black leading-[0.85] text-transparent sm:text-7xl"
            style={{ backgroundImage: `linear-gradient(120deg, ${accentPair[0]}, ${accentPair[1]})` }}
          >
            {sectionNumberText}
          </span>
          <h2 className="font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl">{section.title}</h2>
        </div>
        <p
          className="min-w-[16rem] max-w-md flex-1 border-l-2 pl-5 font-mono text-sm leading-relaxed text-white/60"
          style={{ borderColor: accentPair[0] }}
        >
          {section.description}
        </p>
      </div>

      <div className={sectionGridClassName}>
        {isPhoneOnLeft ? (
          <>
            {phonePlayerElement}
            {sectionContentCardElement}
          </>
        ) : (
          <>
            <div className="order-2 lg:order-1">{sectionContentCardElement}</div>
            <div className="order-1 lg:order-2">{phonePlayerElement}</div>
          </>
        )}
      </div>
    </section>
  );
}

// ===== MAIN COMPONENT =====

/**
 * Audience page layout: header, navigation chips, ordered sections with phone player,
 * working waitlist action card, and footer.
 *
 * @param {Object} props
 * @param {string} props.eyebrow - Pixel font category label above headline
 * @param {string} props.title - Main display heading for the audience page
 * @param {string} props.intro - Explanatory subtitle paragraph
 * @param {Array<{ title: string, description: string, points: Array<{ label: string, text: string }>, videos?: Array }>} props.sections - Feature sections in sequence
 * @param {string} props.testId - Test ID attribute for automated test suites
 * @returns {JSX.Element}
 */
export function AudienceSkeleton({ eyebrow, title, intro, sections, testId }) {
  return (
    <div className="relative min-h-screen bg-void" data-testid={testId}>
      <div className="aurora-static" aria-hidden />

      <div className="relative z-10">
        <NavBar />

        <main className="mx-auto w-full max-w-6xl px-5 pb-20 pt-32 sm:pt-36">
          <header>
            <p className="font-pixel text-[0.6rem] uppercase leading-relaxed text-purple">{eyebrow}</p>
            <h1 className="display-extrude mt-4 max-w-3xl font-display text-4xl font-extrabold leading-[1.05] text-white sm:text-5xl">
              {title}
            </h1>
            <p className="mt-5 max-w-2xl font-mono text-sm leading-relaxed text-white/60">{intro}</p>
            <p className="mt-3 font-mono text-xs uppercase tracking-[0.18em] text-white/30">
              Live app recordings play beside each section — tap any segment to jump between clips.
            </p>

            <nav aria-label="On this page" className="mt-8 flex flex-wrap gap-2">
              {sections.map((section, sectionIndex) => (
                <a
                  key={section.title}
                  href={`#feature-${formatNumberWithLeadingZero(sectionIndex)}`}
                  className="rounded-full border border-white/[0.12] px-3.5 py-1.5 font-mono text-[0.68rem] text-white/55 transition-colors duration-200 hover:border-white/35 hover:text-white"
                >
                  <span className="mr-2 font-bold text-white/35">{formatNumberWithLeadingZero(sectionIndex)}</span>
                  {section.title}
                </a>
              ))}
            </nav>
          </header>

          <div className="mt-14">
            {sections.map((section, sectionIndex) => (
              <SkeletonSection key={section.title} section={section} sectionIndex={sectionIndex} />
            ))}
          </div>

          <section className="what-is-panel mt-4 rounded-[2rem] p-8 text-center sm:p-10" data-testid="skeleton-finale">
            <h2 className="font-display text-2xl font-extrabold text-white sm:text-3xl">Join the waitlist</h2>
            <p className="mx-auto mt-3 max-w-xl font-mono text-sm leading-relaxed text-white/60">
              Join the waitlist now; founding trainers and their clients are first through the door.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link to="/#act-finale" className="cta-primary hero-action hero-action-primary">
                Join the waitlist
              </Link>
              <Link to="/" className="cta-ghost hero-action">
                Back to home
              </Link>
            </div>
          </section>
        </main>

        <footer className="relative z-10 border-t border-white/[0.08] px-5 py-8">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-white/40">© 2026 Coach Connect</p>
            <Link to="/" className="text-xs text-white/45 transition-colors hover:text-white">
              coachconnect.app
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}

export { AudienceSkeleton as AudiencePageTemplate };

