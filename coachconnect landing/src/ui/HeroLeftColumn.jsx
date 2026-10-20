// Hero left column — the copy under the hero tagline, all left-aligned.
// Flow: budget headline → the three matching points. That is all:
// no promise paragraph, no trainer/client pills, nothing waitlist-related
// in the hero. The headline carries the hook and the three points carry
// the how (matching factors, budget, less searching). The 3D logo used
// to sit under these points; it now stands big in the middle of the
// hero (TopSection renders it there) after review feedback that the
// hero's center should sell the brand, not just the sunset.
// Used by: ui/Sections.jsx (TopSection), in the hero's left column.

import { Award, Compass, Wallet } from 'lucide-react';

// ===== NAMED CONSTANTS =====

// Manipulate here: partner headline, split so "budget." can wear the
// brand gradient (same .wordmark-connect treatment as "Day One.").
const HERO_BUDGET_HEADLINE_LEAD = 'The right trainer shouldn’t be out of your';
const HERO_BUDGET_HEADLINE_ACCENT = 'budget.';

// The partner top block, split into three points. title = their bold line,
// verbatim. body = their explanation, trimmed to one line each:
//   1. matching factors + "not how big their social following is"
//   2. "rates based on qualifications, experience, and previous earnings"
//   3. "without spending hours comparing profiles across different platforms"
// color → gradientTo is each disc's gradient pair (never a flat fill),
// the same card-system language as the rest of the page.
const HERO_MATCHING_POINTS = [
  {
    icon: Award,
    color: '#FF6B9D',
    gradientTo: '#F97316',
    title: 'Experience over followers.',
    body: 'Expertise, experience, training style, and reviews—not a social following.',
  },
  {
    icon: Wallet,
    color: '#C084FC',
    gradientTo: '#FF6B9D',
    title: 'Your budget matters.',
    body: 'Qualifications, experience, and previous earnings set the rate.',
  },
  {
    icon: Compass,
    color: '#06B6D4',
    gradientTo: '#C084FC',
    title: 'Less searching. More starting.',
    body: 'Trainers suited to you, without hours comparing profiles.',
  },
];

// ===== HELPER FUNCTIONS =====

/**
 * One matching point as a quiet dark-glass card. Only the icon disc
 * carries the accent color — the card itself stays near-black glass so
 * it sits calmly on the sunset instead of fighting it. The accent pair
 * lives on the card so the disc (which inherits the vars) matches.
 * @param {Object} props
 * @param {{ icon: React.ElementType, color: string, gradientTo: string, title: string, body: string }} props.point
 * @returns {JSX.Element}
 */
function MatchingPoint({ point }) {
  const PointIcon = point.icon;

  return (
    <li
      className="hero-point"
      style={{ '--card-accent': point.color, '--grad-to': point.gradientTo }}
    >
      <span className="cc-icon-disc hero-point-disc" aria-hidden="true">
        <PointIcon size={17} strokeWidth={2.2} />
      </span>
      <span className="hero-point-text">
        <span className="hero-point-title">{point.title}</span>
        <span className="hero-point-body">{point.body}</span>
      </span>
    </li>
  );
}

// ===== MAIN FUNCTION =====

/**
 * Everything under the tagline in the hero's left column: the budget
 * headline (gradient on "budget."), then the three matching points —
 * left-aligned, in normal flow, high enough to see without scrolling.
 * @returns {JSX.Element}
 */
export function HeroLeftColumn() {
  return (
    <>
      <p className="hero-budget-headline" data-testid="hero-budget-headline">
        {HERO_BUDGET_HEADLINE_LEAD}{' '}
        <span className="display-extrude inline-block">
          <span className="wordmark-connect">{HERO_BUDGET_HEADLINE_ACCENT}</span>
        </span>
      </p>

      {/* The three points. The logo is not here anymore — it stands in
          the middle of the hero now (see TopSection). */}
      <ul className="hero-points" data-testid="hero-matching-points">
        {HERO_MATCHING_POINTS.map((point) => (
          <MatchingPoint key={point.title} point={point} />
        ))}
      </ul>
    </>
  );
}
