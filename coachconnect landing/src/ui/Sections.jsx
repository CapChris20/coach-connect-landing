// Sections — every visible chapter of the landing page, in page order.
// Flow: hero → marquee → what is Coach Connect → FAQs → subscription →
// waitlist + footer. (The for-clients / for-trainers / why chapters are parked
// further down this file — off the homepage, kept as seed content for the
// /for-clients and /for-trainers pages.) The nav bar above them lives in
// navbar/NavBar.jsx. The hero paints the sunset ocean shader behind its
// columns (SunsetOceanBackground). Under the tagline, HeroLeftColumn adds
// the support line, waitlist bar, audience pills, and proof chips.
// Every chapter after the hero is wrapped in
// the mouse-glow section (MouseGridBackground). Reveals all go through FadeIn,
// the rotating card through CardCycle, and anchor glides through scrollToHash.
// Locked strings (trial wording, fees, beta link) are imported from
// config/siteConfig.js — never hardcode those here.
// Used by: pages/Landing.jsx.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Apple,
  ArrowRight,
  ChevronDown,
  Calendar,
  ClipboardList,
  CreditCard,
  MessageCircle,
  Search,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { FadeIn } from './FadeIn';
import { WeightliftingAnimation } from './WeightliftingAnimation';
import { HeroWatch } from './HeroWatch';
import { SunsetOceanBackground } from './SunsetOceanBackground';
import { LogoModel } from './LogoModel';
import { HeroLeftColumn } from './HeroLeftColumn';
import MouseGridBackground from './MouseGridBackground';
import { CardCycle } from './CardCycle';
import { Wordmark } from './Wordmark';
import { scrollToHash } from './scrollToHash';
import { WaitlistForm } from '../waitlist/WaitlistForm';
// Locked copy (trial wording, savings, fee disclosure, beta link) lives in one
// config file so it can never drift between sections.
import { ANNUAL_SAVINGS_COPY, FEE_COPY, TRIAL_COPY } from '../config/siteConfig';

// ===== NAMED CONSTANTS =====

// Where the hero's scroll hint glides. The next real chapter after the hero
// (the marquee between them is just a ribbon, not a destination).
const HERO_SCROLL_TARGET = '#act-connection';

// Manipulate here: marquee copy — keep about 6 short phrases so the loop
// reads as one continuous ribbon
const MARQUEE_ITEMS = [
  'Find your coach',
  'Run your business',
  'One app',
  'No per-client fees',
  'AI that asks first',
  'Plans · Nutrition · Payments',
];

// Manipulate here: the FAQ questions, in order. Starter set written from
// facts already on this page — the owner replaces these with his real Q&A.
// Answers may reuse the locked strings (trial, savings, fees) imported above.
// color → gradientTo is each card's gradient pair (never a flat fill).
const FAQ_ITEMS = [
  {
    color: '#FF6B9D',
    gradientTo: '#F97316',
    question: 'When does Coach Connect launch?',
    answer:
      'Coach Connect is coming soon — we open late 2026, founding trainers first. Join the waitlist below and you will hear from us before the doors open.',
  },
  {
    color: '#C084FC',
    gradientTo: '#FF6B9D',
    question: 'How much does it cost?',
    answer: `Coach Connect Pro is $59.99/mo, or $49/mo billed annually at $588/yr (${ANNUAL_SAVINGS_COPY}). Every plan starts with a ${TRIAL_COPY}.`,
  },
  {
    color: '#F97316',
    gradientTo: '#FF6B9D',
    question: 'Is there a per-client fee?',
    answer: `No. One flat price covers your whole roster — there are no per-client fees as it grows. ${FEE_COPY}`,
  },
  {
    color: '#06B6D4',
    gradientTo: '#C084FC',
    question: "I'm a client — do I pay for the app?",
    answer:
      'The app is free for clients. You find your coach in the marketplace, follow your plan, log your nutrition, and pay your coach in the app.',
  },
  {
    color: '#10B981',
    gradientTo: '#06B6D4',
    question: 'What does the AI Coach do?',
    answer:
      'It can log a meal, water, sleep or steps for you, or edit a workout — and it asks you to confirm before anything changes.',
  },
  {
    color: '#FF6B9D',
    gradientTo: '#F97316',
    question: 'How do payments work?',
    answer:
      'Clients pay through Stripe right in the app. No payment links over DM, no separate invoicing tool — payouts are part of the same system as the coaching.',
  },
];

// The old "What is Coach Connect" paragraph, broken into pieces. Same facts,
// no new claims. area names the slot in .what-is-pieces (index.css).
// color → gradientTo is each disc's gradient pair — never a flat fill.
// Manipulate here: seven short rows. Adding a long body line makes the
// chapter taller than one screen.
const WHAT_IS_PIECES = [
  { area: 'find', icon: Search, color: '#FF6B9D', gradientTo: '#F97316', title: 'Find a trainer', body: 'In the marketplace.' },
  { area: 'plans', icon: ClipboardList, color: '#06B6D4', gradientTo: '#C084FC', title: 'Workout plans', body: 'Follow the plan.' },
  { area: 'scan', icon: Apple, color: '#10B981', gradientTo: '#06B6D4', title: 'Log nutrition', body: 'Barcode scan.' },
  { area: 'message', icon: MessageCircle, color: '#F97316', gradientTo: '#FF6B9D', title: 'Messaging', body: 'Message your coach.' },
  { area: 'book', icon: Calendar, color: '#C084FC', gradientTo: '#FF6B9D', title: 'Book sessions', body: 'Schedule in the app.' },
  { area: 'pay', icon: CreditCard, color: '#FF6B9D', gradientTo: '#F97316', title: 'Pay in the app', body: 'Pay your coach.' },
  { area: 'ai', icon: Zap, color: '#C084FC', gradientTo: '#06B6D4', title: 'AI Coach', body: 'Handles the day-to-day logging, and asks before it changes anything.' },
];

// Manipulate here: the three client feature cards (color → gradientTo =
// the card's gradient pair, never a flat fill)
const CLIENT_FEATURES = [
  {
    icon: Search,
    color: '#FF6B9D',
    gradientTo: '#F97316',
    title: 'Find your coach',
    body: 'Search the marketplace and match with a real human coach.',
  },
  {
    icon: ClipboardList,
    color: '#06B6D4',
    gradientTo: '#C084FC',
    title: 'Log everything',
    body: 'Log meals with a barcode scan, and track workouts, water, sleep and steps.',
  },
  {
    icon: Zap,
    color: '#C084FC',
    gradientTo: '#FF6B9D',
    title: 'AI Coach',
    body: 'Ask it to log a meal or edit a workout — it confirms with you before anything changes.',
  },
];

// Manipulate here: the four rotating trainer use cases (the card advances every 5.2s)
const TRAINER_USE_CASES = [
  {
    tag: 'Online coach',
    title: 'A roster in your pocket',
    body: 'Your roster, client history, plans and messages for a fully remote client list — in one app, not five.',
  },
  {
    tag: 'In-person PT',
    title: 'Sessions + homework, one thread',
    body: 'Schedule sessions, program the work between them, and see check-ins as they land — no more “did you go?” texts.',
  },
  {
    tag: 'Hybrid coach',
    title: 'Both lanes, one system',
    body: 'In-person and online clients share plans, messaging and scheduling. Clients pay you in the app through Stripe.',
  },
  {
    tag: 'Nutrition coach',
    title: 'Food logging clients finish',
    body: 'Barcode scanning makes logging fast, and the nutrition numbers are cross-checked across multiple databases.',
  },
];

// Manipulate here: the five reasons, IN ORDER — the order is part of the copy,
// do not shuffle. Every line is a verified app capability; add nothing unlisted.
const WHY_ITEMS = [
  { color: '#FF6B9D', text: 'One flat price, no per-client fees' },
  { color: '#C084FC', text: 'AI Coach with 15 actions, each behind a confirmation step' },
  { color: '#F97316', text: 'Nutrition numbers cross-checked across multiple databases, plus barcode scanning' },
  { color: '#06B6D4', text: 'Built-in document and spreadsheet editor for your coaching files' },
  { color: '#10B981', text: 'Weekly reports built from real check-ins, exportable to PDF' },
];

// Manipulate here: the bento tiles. Tile labels mirror PRICING_BENEFITS below —
// keep the two lists saying the same five things. color → gradientTo is the
// tile's gradient pair (never a flat fill; pairs cycle the brand palette).
const BENEFIT_TILES = [
  { icon: Users, color: '#FF6B9D', gradientTo: '#F97316', label: 'No per-client fees', body: 'One flat price as your roster grows.' },
  { icon: Zap, color: '#C084FC', gradientTo: '#FF6B9D', label: 'AI workout plans', body: 'Three AI-built plans included each month.' },
  { icon: Apple, color: '#10B981', gradientTo: '#06B6D4', label: 'Nutrition tracking', body: 'Cross-checked numbers, plus barcode scanning.' },
  { icon: TrendingUp, color: '#06B6D4', gradientTo: '#C084FC', label: 'Progress photos and history', body: 'Photos and history, kept in one place.' },
  { icon: MessageCircle, color: '#F97316', gradientTo: '#FF6B9D', label: 'Messaging', body: 'Client messaging beside plans and payments.' },
];

// The pricing panel's checklist. Price figures are brand-locked copy — do not edit numbers.
const PRICING_BENEFITS = [
  'No per-client fees',
  'AI workout plans (3 per month)',
  'Nutrition tracking',
  'Progress photos and history',
  'Messaging',
];

// ===== HELPER FUNCTIONS =====

/**
 * One pass of the marquee ribbon. It is rendered twice back to back so the
 * loop can wrap seamlessly (the CSS animation slides it exactly one pass).
 * @param {Object} props
 * @param {boolean} [props.hidden] - true for the duplicate pass (kept out of
 * the accessibility tree so screen readers only hear the ribbon once)
 * @returns {JSX.Element}
 */
function MarqueeRow({ hidden = false }) {
  return (
    <div className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {MARQUEE_ITEMS.map((marqueeItem) => (
        <span
          key={marqueeItem}
          className="flex items-center gap-6 pr-6 font-display text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-white/55"
        >
          {marqueeItem}
          <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-pink to-orange" />
        </span>
      ))}
    </div>
  );
}

/**
 * The chapter opener every section shares: small pixel eyebrow, big title,
 * one muted paragraph — all revealed with the same FadeIn.
 * @param {Object} props
 * @param {string} props.color - the eyebrow's accent color
 * @param {string} props.eyebrow - like "02 · For Clients"
 * @param {string} props.title - the chapter headline
 * @param {string} props.body - the paragraph under the title
 * @param {string} props.testId - prefix for the data-testid attributes
 * @returns {JSX.Element}
 */
function SectionHeader({ color, eyebrow, title, body, testId }) {
  return (
    <FadeIn className="mx-auto max-w-2xl text-center">
      <p className="mb-3 font-pixel text-[0.6rem] uppercase leading-relaxed" style={{ color }} data-testid={`${testId}-eyebrow`}>
        {eyebrow}
      </p>
      {/* display-extrude wraps the clipped face so the shadow follows the
          letters. The face itself is the quiet white bevel (.display-face). */}
      <h2 className="display-extrude mb-3 font-display text-[1.65rem] font-semibold leading-snug sm:text-4xl" data-testid={`${testId}-title`}>
        <span className="display-face">{title}</span>
      </h2>
      {/* font-mono, not the pixel face: a paragraph in Press Start 2P becomes
          a wall and pushes the section past one screen. */}
      <p className="font-mono text-sm leading-relaxed text-white/60 sm:text-base" data-testid={`${testId}-body`}>
        {body}
      </p>
    </FadeIn>
  );
}

/**
 * The bouncing "Scroll" control at the bottom of the hero. A real link, so a
 * click glides to the next chapter instead of only playing the animation.
 * The bounce itself lives in index.css (.hero-scroll-hint-chevron).
 * @returns {JSX.Element}
 */
function HeroScrollHint() {
  return (
    <a
      href={HERO_SCROLL_TARGET}
      onClick={(clickEvent) => scrollToHash(clickEvent, HERO_SCROLL_TARGET)}
      className="hero-scroll-hint"
      data-testid="hero-scroll-hint"
    >
      Scroll
      <span className="hero-scroll-hint-chevrons" aria-hidden="true">
        <ChevronDown className="hero-scroll-hint-chevron" strokeWidth={2.5} />
        <ChevronDown className="hero-scroll-hint-chevron hero-scroll-hint-chevron-delay" strokeWidth={2.5} />
      </span>
    </a>
  );
}

/**
 * One piece of the broken-apart "what it helps with" cluster.
 * @param {Object} props
 * @param {{ area: string, icon: React.ElementType, color: string, gradientTo: string, title: string, body: string }} props.piece
 * @returns {JSX.Element}
 */
function WhatIsPiece({ piece }) {
  const PieceIcon = piece.icon;

  return (
    <div
      className="what-is-piece cc-card cc-card-hover flex h-full items-center gap-4 rounded-2xl px-4 py-4"
      style={{ '--card-accent': piece.color, '--grad-to': piece.gradientTo }}
    >
      <span className="cc-icon-disc h-12 w-12">
        <PieceIcon size={22} strokeWidth={2.2} />
      </span>
      <div className="min-w-0">
        <h3 className="font-display text-base font-semibold leading-snug text-white">{piece.title}</h3>
        <p className="mt-0.5 font-mono text-sm leading-snug text-white/85">{piece.body}</p>
      </div>
    </div>
  );
}

// ===== MAIN FUNCTIONS (the sections, in page order) =====

/**
 * The hero, two columns on desktop: the left column groups the stacked
 * wordmark, the "One Day or Day One." catchphrase tagline, then the support
 * line, waitlist, pills, and proof chips (ui/HeroLeftColumn.jsx), then the
 * bouncing logo; the right column is the Apple Watch-style card
 * (ui/HeroWatch.jsx) whose band runs the full hero height, up toward
 * the nav. On smaller screens it stacks: identity first, watch underneath.
 * The headline, pitch, and buttons that used to sit here were cleared by
 * the owner — this layout is his replacement. The sunset shader sits behind
 * both columns and does not take clicks. The two groups sit on opposite
 * edges of the screen so the sunset's sun stays visible between them.
 * @returns {JSX.Element}
 */
export function TopSection() {
  return (
    <section id="act-arrival" className="landing-section relative isolate overflow-hidden">
      <SunsetOceanBackground />
      {/* Full width on purpose: a centered max-width box parked both groups
          on top of the sun. min-h calc(100dvh - 6.6rem) = viewport minus this
          section's own padding, so the watch band can run the whole hero.
          Manipulate here: lg:px-6 = how far the watch sits from the right edge.
          lg:pl-12 on the left group = extra nudge of the wordmark and
          tagline toward the sun. Raise pl to push them further right.
          The logo's upward nudge lives on .hero-logo-slot in index.css. */}
      <div className="landing-section-body relative z-[1] grid min-h-[calc(100dvh-6.6rem)] w-full grid-cols-1 px-5 lg:grid-cols-2 lg:px-6" data-testid="hero">
        {/* 1. Left column: wordmark, tagline, then the support line, waitlist,
            pills, chips, and logo. The wordmark is stacked (COACH over CONNECT)
            because the one-line version is too wide for a half-width column. */}
        <div className="flex min-w-0 flex-col items-center justify-center py-8 text-center lg:items-start lg:justify-self-start lg:pl-12 lg:text-left">
          <h1 data-testid="hero-wordmark">
            <Wordmark stacked className="items-center lg:items-start" />
          </h1>

          {/* "Day One" wears the lit brand gradient (.wordmark-connect, same
              as CONNECT). The extrusion sits on the wrapper so the shadow
              follows the letters. "One Day or" stays flat so one phrase
              isn't three effects. */}
          <p className="mt-6 font-display text-xl font-bold leading-snug sm:text-2xl" data-testid="hero-tagline">
            <span className="text-white">One Day </span>
            <span className="text-white/60">or </span>
            <span className="display-extrude inline-block">
              <span className="wordmark-connect">Day One.</span>
            </span>
          </p>

          {/* Sentence, waitlist, pills, chips, then the logo. The model
              itself is unchanged — only the slot around it moves. */}
          <HeroLeftColumn>
            <LogoModel />
          </HeroLeftColumn>
        </div>

        {/* 2. Right column: the watch, pinned to the right edge. h-full
            stretches the stage to the whole hero height so the band reaches
            from under the nav down to the fold. */}
        <FadeIn className="h-full w-full max-w-[560px] justify-self-center lg:justify-self-end">
          <HeroWatch />
        </FadeIn>
      </div>

      {/* Sits on top of the sun, centered, so it stays clickable over the shader. */}
      <HeroScrollHint />
    </section>
  );
}

/**
 * The scrolling ribbon between the hero and chapter 01.
 * The CSS animation lives in index.css (.marquee-track) and pauses on hover.
 * @returns {JSX.Element}
 */
export function ScrollingTextStrip() {
  return (
    <MouseGridBackground as="div" className="overflow-hidden border-y border-pink/25 py-5">
      <div data-testid="marquee">
        {/* Glow hairlines along the top and bottom edges of the strip */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-pink/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-orange/60 to-transparent" />
        <div className="marquee-track">
          <MarqueeRow />
          <MarqueeRow hidden />
        </div>
      </div>
    </MouseGridBackground>
  );
}

/**
 * Chapter 01 — what is Coach Connect. The question is centered on the page.
 * Under it, the lifter sits left and a short two-column strip of pieces sits
 * right, short enough that the whole chapter fits on one screen.
 * @returns {JSX.Element}
 */
export function WhatIsSection() {
  return (
    <MouseGridBackground id="act-connection" className="landing-section">
      <div className="mx-auto flex w-full max-w-6xl flex-col px-5" data-testid="caption-connection">
        {/* 1. The question, centered. Glass pill for the chapter number,
            brand gradient on the name, a short gradient rule, then the lead.
            The old stack was a flat purple pixel label, a white title, and
            a gray mono line — that is the block that looked unfinished. */}
        <FadeIn className="chapter-intro mx-auto max-w-3xl">
          <p className="chapter-kicker" data-testid="caption-connection-eyebrow">
            <span className="chapter-kicker-index">
              <span className="headline-grad">01</span>
            </span>
            What Is Coach Connect
          </p>
          <h2 className="display-extrude chapter-title font-display" data-testid="caption-connection-title">
            <span className="display-face">What is </span>
            <span className="headline-grad">Coach Connect?</span>
          </h2>
          <span className="chapter-rule" aria-hidden="true" />
          <p className="chapter-lead" data-testid="what-is-body">
            The all-in-one app for coaching. Trainers run their whole business from it — and
            clients get their coach, their plan, and their progress in one place.
          </p>
        </FadeIn>

        {/* 2. Lifter on the left, the pieces in a short grid on the right.
            Two columns of compact rows, so nothing hangs below the fold. */}
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-10">
          <WeightliftingAnimation />
          <div>
            <div className="what-is-pieces">
              {WHAT_IS_PIECES.map((piece, pieceIndex) => (
                <FadeIn key={piece.area} delay={pieceIndex * 0.04} className={piece.area === 'ai' ? 'what-is-piece-wide' : ''}>
                  <WhatIsPiece piece={piece} />
                </FadeIn>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap justify-center gap-3" data-testid="audience-pills">
              <Link to="/for-trainers" className="cta-primary hero-action hero-action-primary" data-testid="pill-trainers">
                For Trainers
                <ArrowRight size={16} />
              </Link>
              <Link to="/for-clients" className="cta-ghost hero-action" data-testid="pill-clients">
                For Clients
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MouseGridBackground>
  );
}

/**
 * Chapter 02 — FAQs: one card per question, tap to open the answer.
 * The open/close animation is pure CSS (.cc-faq-answer in index.css);
 * this component only tracks which card is open.
 * @returns {JSX.Element}
 */
export function FaqSection() {
  // Which question is open. -1 would mean none; the first starts open so
  // visitors see the cards are tappable.
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  return (
    <MouseGridBackground id="act-faqs" className="landing-section-alt">
      <div className="mx-auto w-full max-w-6xl px-5" data-testid="faq">
        <SectionHeader
          color="#C084FC"
          eyebrow="02 · FAQs"
          title="Questions, answered."
          body="The short version of everything people ask before joining the waitlist."
          testId="faq"
        />

        <div className="mx-auto mt-8 grid max-w-3xl gap-3" data-testid="faq-list">
          {FAQ_ITEMS.map((faqItem, i) => {
            const isFaqOpen = openFaqIndex === i;
            return (
              <FadeIn key={faqItem.question} delay={i * 0.06}>
                <div
                  className="cc-card cc-card-hover rounded-2xl"
                  style={{ '--card-accent': faqItem.color }}
                  data-testid="faq-item"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isFaqOpen ? -1 : i)}
                    aria-expanded={isFaqOpen}
                    className="flex w-full items-center gap-4 px-5 py-4 text-left sm:px-6"
                    data-testid="faq-question"
                  >
                    <span
                      className="cc-gradient-text font-display text-sm font-bold"
                      style={{ '--grad-from': faqItem.color, '--grad-to': faqItem.gradientTo }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="flex-1 font-display text-[0.95rem] font-semibold leading-snug text-white">
                      {faqItem.question}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 transition-transform duration-300 ${isFaqOpen ? 'rotate-180' : ''}`}
                      style={{ color: faqItem.color }}
                    />
                  </button>

                  {/* vocab: data-open drives the .cc-faq-answer grid-rows animation in index.css */}
                  <div className="cc-faq-answer" data-open={isFaqOpen} data-testid="faq-answer">
                    <div>
                      <p className="px-5 pb-5 pl-[3.25rem] font-mono text-sm leading-relaxed text-white/60 sm:px-6 sm:pl-[3.5rem]">
                        {faqItem.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </MouseGridBackground>
  );
}

/**
 * PARKED — for clients: header plus the three feature cards, staggered in.
 * Off the homepage (the owner's new structure sends clients to their own
 * page); kept as seed content for /for-clients, already on the card system.
 * @returns {JSX.Element}
 */
export function FeatureCards() {
  return (
    <MouseGridBackground id="act-client" className="landing-section-alt">
      <div className="mx-auto flex w-full max-w-6xl justify-end px-5" data-testid="caption-client">
        <div className="w-full max-w-xl md:mr-[4%]">
          <SectionHeader
            color="#FF6B9D"
            eyebrow="02 · For Clients"
            title="Your coach, in your pocket."
            body="Find a trainer, follow your plan, log meals with a barcode scan, and message your coach in one place. Your AI Coach can log a meal, water, sleep or steps, or edit a workout, and it asks you to confirm first. The app is free. You pay your coach in the app."
            testId="caption-client"
          />
          <div className="mt-7 grid gap-3 sm:grid-cols-3" data-testid="feature-cards">
            {CLIENT_FEATURES.map((feature, i) => (
              <FadeIn key={feature.title} delay={i * 0.12}>
                {/* Card system: solid accent disc + white glyph (watch-row
                    style), the whole card tinted by --card-accent */}
                <div
                  className="cc-card cc-card-hover h-full rounded-2xl p-4"
                  style={{ '--card-accent': feature.color, '--grad-to': feature.gradientTo }}
                  data-testid="feature-card"
                >
                  <span className="cc-icon-disc h-9 w-9">
                    <feature.icon size={17} strokeWidth={2.2} />
                  </span>
                  <h3 className="mt-3 font-display text-[0.85rem] font-semibold leading-snug text-white">{feature.title}</h3>
                  <p className="mt-1.5 text-[0.8rem] leading-relaxed text-white/55">{feature.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </MouseGridBackground>
  );
}

/**
 * PARKED — for trainers: header plus the auto-rotating use-case card.
 * Off the homepage (trainers get their own page); kept as seed content
 * for /for-trainers, already on the card system.
 * @returns {JSX.Element}
 */
export function BestUseCases() {
  return (
    <MouseGridBackground id="act-trainer" className="landing-section">
      <div className="mx-auto w-full max-w-6xl px-5" data-testid="caption-trainer">
        <div className="w-full max-w-xl md:ml-[4%]">
          <SectionHeader
            color="#C084FC"
            eyebrow="03 · For Trainers — Best Use Cases"
            title="Stop running your business out of five apps."
            body={`Your roster and client history, messaging, notes and files, a built-in document and spreadsheet editor, session scheduling and weekly reports, plus in-app Stripe payouts. One flat price, no per-client fees. ${FEE_COPY}`}
            testId="caption-trainer"
          />
          <FadeIn delay={0.1} className="mt-7">
            <CardCycle
              items={TRAINER_USE_CASES}
              testId="use-case-card"
              renderItem={(useCase) => (
                <div>
                  <p className="font-pixel text-[0.6rem] uppercase leading-relaxed text-cyan-bright">{useCase.tag}</p>
                  <h3 className="mt-3 font-display text-xl font-semibold leading-snug text-white">{useCase.title}</h3>
                  <p className="mt-2 leading-relaxed text-white/55">{useCase.body}</p>
                </div>
              )}
            />
          </FadeIn>
        </div>
      </div>
    </MouseGridBackground>
  );
}

/**
 * PARKED — why Coach Connect: the five reasons as a numbered etched list.
 * Not in the owner's homepage story; kept as candidate content for the
 * trainer page.
 * @returns {JSX.Element}
 */
export function WhyUsMatchup() {
  return (
    <MouseGridBackground id="act-diffs" className="landing-section-alt">
      <div className="mx-auto flex w-full max-w-6xl justify-end px-5" data-testid="caption-diffs">
        <div className="w-full max-w-2xl md:mr-[4%]">
          <SectionHeader
            color="#06B6D4"
            eyebrow="04 · Why Coach Connect"
            title="Built different, on purpose."
            body="Everything a coaching relationship needs, without the duct-tape stack."
            testId="caption-diffs"
          />
          {/* Numbered rows separated by hairlines, one accent color per row */}
          <FadeIn delay={0.1} className="mt-7">
            <ul className="landing-surface-card rounded-3xl px-6 py-2 sm:px-7" data-testid="why-list">
              {WHY_ITEMS.map((whyItem, i) => (
                <li
                  key={whyItem.text}
                  className="flex items-start gap-4 border-t border-white/[0.08] py-4 first:border-t-0"
                  data-testid="why-item"
                >
                  <span className="font-display text-sm font-bold leading-relaxed" style={{ color: whyItem.color }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-sm leading-relaxed text-white/75">{whyItem.text}</span>
                </li>
              ))}
            </ul>
          </FadeIn>
        </div>
      </div>
    </MouseGridBackground>
  );
}

/**
 * Chapter 03 — subscription: pricing as a bento grid. The price panel wears
 * the gradient border (the section's hero card), the wide get-paid tile and
 * the five benefit tiles use the card system.
 * @returns {JSX.Element}
 */
export function BenefitsBento() {
  return (
    <MouseGridBackground id="act-pricing" className="landing-section">
      <div className="mx-auto w-full max-w-6xl px-5" data-testid="pricing-section">
        <SectionHeader
          color="#F97316"
          eyebrow="03 · Subscription"
          title="Everything included. One price."
          body="One flat price, no per-client fees. One subscription runs the whole practice."
          testId="pricing"
        />

        <div className="mt-8 grid gap-3 md:grid-cols-3" data-testid="benefits-bento">
          {/* Pricing tile — spans both rows; every figure is locked copy */}
          <FadeIn className="cc-gradient-border rounded-3xl p-7 sm:p-8 md:row-span-2">
            <div className="flex h-full flex-col" data-testid="pricing-panel">
              <p className="mb-3 font-pixel text-[0.55rem] uppercase leading-relaxed text-orange" data-testid="pricing-eyebrow">
                Coach Connect Pro
              </p>
              <p className="font-display text-5xl font-extrabold text-white" data-testid="pricing-amount">
                $59.99
                <span className="text-lg font-medium text-white/45">/mo</span>
              </p>
              <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-white/65" data-testid="pricing-annual">
                Annual: $49/mo, billed $588/yr
                <span className="rounded-md bg-green/15 px-2 py-0.5 text-xs font-semibold text-green-bright">{ANNUAL_SAVINGS_COPY}</span>
              </p>
              <p className="mt-2 text-sm text-cyan-bright" data-testid="pricing-trial">
                {TRIAL_COPY}
              </p>
              <ul className="mt-6 space-y-2.5" data-testid="pricing-benefits">
                {PRICING_BENEFITS.map((pricingBenefit) => (
                  <li key={pricingBenefit} className="flex items-center gap-3 text-sm text-white/75">
                    <span className="h-px w-4 bg-gradient-to-r from-pink to-orange" />
                    {pricingBenefit}
                  </li>
                ))}
              </ul>
              <a href="#act-finale" onClick={(e) => scrollToHash(e, '#act-finale')} className="cta-primary hero-action hero-action-primary mt-7 w-full" data-testid="pricing-cta">
                Start free trial
              </a>
              <p className="mt-4 text-xs leading-relaxed text-white/40" data-testid="pricing-note">
                Clients use the app free and pay their coach in the app. {FEE_COPY}
              </p>
            </div>
          </FadeIn>

          {/* The wide get-paid tile */}
          <FadeIn delay={0.08} className="md:col-span-2">
            <div className="cc-card h-full rounded-3xl p-6 sm:p-7" style={{ '--card-accent': '#F97316' }}>
              <p className="display-extrude font-display text-3xl font-extrabold sm:text-4xl">
                <span className="headline-grad">Get paid in the app.</span>
              </p>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/55">
                Clients pay through Stripe right in the app. No payment links over DM, no separate
                invoicing tool — payouts are part of the same system as the coaching.
              </p>
            </div>
          </FadeIn>

          {/* The five benefit tiles, staggered a beat behind the pricing tile */}
          {BENEFIT_TILES.map((benefitTile, i) => (
            <FadeIn key={benefitTile.label} delay={0.12 + i * 0.06}>
              <div
                className="cc-card cc-card-hover h-full rounded-2xl p-5"
                style={{ '--card-accent': benefitTile.color, '--grad-to': benefitTile.gradientTo }}
                data-testid="benefit-tile"
              >
                <span className="cc-icon-disc h-9 w-9">
                  <benefitTile.icon size={17} strokeWidth={2.2} />
                </span>
                <h3 className="mt-3 font-display text-[0.85rem] font-semibold leading-snug text-white">{benefitTile.label}</h3>
                <p className="mt-1.5 text-[0.8rem] leading-relaxed text-white/55">{benefitTile.body}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </MouseGridBackground>
  );
}

/**
 * Chapter 04 — the waitlist finale (Coming Soon), with the footer directly
 * under it. The catchphrase headline stays; under it, the email form is the
 * call to action. The form itself lives in src/waitlist/.
 * @returns {JSX.Element}
 */
export function JoinNowFooter() {
  return (
    <>
      <MouseGridBackground id="act-finale" className="landing-section-alt">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-5 text-center" data-testid="finale">
          <FadeIn className="flex w-full max-w-3xl flex-col items-center">
            {/* 1. Where in the story we are, and when the doors open */}
            <p className="mb-4 font-pixel text-[0.6rem] uppercase leading-relaxed text-pink" data-testid="finale-eyebrow">
              04 · Waitlist
            </p>
            {/* Manipulate here: launch timing wording — the owner's to confirm */}
            <span
              className="rounded-full border border-pink/40 bg-pink/10 px-4 py-1.5 font-pixel text-[0.55rem] uppercase leading-relaxed text-pink"
              data-testid="finale-launch-chip"
            >
              Coming Soon · Late 2026
            </span>

            {/* 2. The catchphrase, then what joining gets you */}
            <h2 className="display-extrude mt-6 font-display text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl" data-testid="finale-headline">
              <span className="display-face">One Day </span>
              <span className="headline-grad">or</span>
              <span className="display-face"> Day One!</span>
            </h2>
            <p className="mt-5 max-w-xl text-lg text-white/55" data-testid="finale-sub">
              Join the waitlist to register ahead of time. When Coach Connect opens, founding
              trainers and their clients are first in.
            </p>

            {/* 3. The signup itself, in the signature glass panel */}
            <div className="what-is-panel mt-9 w-full max-w-xl rounded-[2rem] p-6 sm:p-8" data-testid="waitlist-card">
              <WaitlistForm />
              <p className="mt-4 text-xs leading-relaxed text-white/40">
                Creates your Coach Connect login in the same account system as the app. The app is free for clients; coaches start with a {TRIAL_COPY}.
              </p>
            </div>

            {/* 4. The quiet exit for anyone not ready to sign up */}
            <a href="#act-connection" onClick={(e) => scrollToHash(e, '#act-connection')} className="cta-ghost hero-action mt-7" data-testid="finale-cta-ghost">
              See how it works
            </a>
          </FadeIn>
        </div>
      </MouseGridBackground>

      <footer className="relative z-10 border-t border-white/[0.08] px-5 py-8" data-testid="footer">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Wordmark size="footer" stacked={false} />
          <p className="text-xs text-white/40">© 2026 Coach Connect</p>
          <div className="flex gap-5 text-xs text-white/45">
            <a href="#act-arrival" onClick={(e) => scrollToHash(e, '#act-arrival')} data-testid="footer-privacy">
              Privacy
            </a>
            <a href="#act-arrival" onClick={(e) => scrollToHash(e, '#act-arrival')} data-testid="footer-terms">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
