// Sections — every visible chapter of the landing page, in page order.
// Flow: hero → marquee → what is Coach Connect → subscription →
// waitlist + footer. (The FAQs live here too but render on /faqs, not
// the homepage. The for-clients / for-trainers / why chapters are parked
// further down this file — off the homepage, kept as seed content for the
// /for-clients and /for-trainers pages.) The nav bar above them lives in
// navbar/NavBar.jsx. The hero sits on the mouse-follow grid
// (MouseGridBackground, like every other chapter). The dumbbell video
// and the liquid-twist / sunset / gym-interior shaders are parked in
// HeroVideoBackground / LiquidTwistBackground / SunsetOceanBackground /
// GymSceneBackground, one import swap away each. Under the tagline, HeroLeftColumn adds
// the support line, a waitlist button (glides to the finale's real form),
// audience pills, and proof chips. Every chapter after the hero is wrapped in
// the mouse-glow section (MouseGridBackground). Reveals all go through FadeIn,
// the rotating card through CardCycle, and anchor glides through scrollToHash.
// Locked strings (trial wording, fees, beta link) are imported from
// config/siteConfig.js — never hardcode those here.
// Used by: pages/Landing.jsx.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Apple,
  ArrowUpRight,
  ChevronDown,
  ClipboardList,
  Plus,
  Search,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../hooks/useLanding';
import { FadeIn } from './FadeIn';
import { HeroWatch } from './HeroWatch';
import { HeroPhone } from './HeroPhone';
import { LogoModel } from './LogoModel';
import MouseGridBackground from './MouseGridBackground';
import { CardCycle } from './CardCycle';
import { Wordmark } from './Wordmark';
import { scrollToHash } from './scrollToHash';
import { WaitlistForm } from '../waitlist/WaitlistForm';
// Locked copy (trial wording, savings, fee disclosure, beta link) lives in one
// config file so it can never drift between sections.
import { ANNUAL_SAVINGS_COPY, FEE_COPY, TESTFLIGHT_URL, TRIAL_COPY } from '../config/siteConfig';

// ===== NAMED CONSTANTS =====

// Where the hero's scroll hint glides. The next real chapter after the hero
// (the marquee between them is just a ribbon, not a destination).
const HERO_SCROLL_TARGET = '#act-connection';

// The hero's load-in choreography, timed to the startup curtain
// (ui/StartupIntro.jsx lifts at ~1s): wordmark first, then the words,
// the logo, and the watch, each a beat after the last.
// Manipulate here: raise the delays and the entrance feels slower and
// grander; the gaps between them are the stagger.
const HERO_ENTRANCE_DELAYS_SECONDS = { wordmark: 0.9, phone: 1.04, logo: 1.16, watch: 1.28 };
// The signature settle the whole site rises with (same curve as FadeIn).
const HERO_ENTRANCE_EASE = [0.16, 1, 0.3, 1];

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

// The three taps between "I want in" and the beta running on an iPhone,
// shown as numbered chips inside the TestFlight shortcut in the finale.
// Manipulate here: keep each step under ~6 words or the chips wrap into blobs.
const TESTFLIGHT_STEPS = [
  'Tap “Get the beta”',
  'Install TestFlight — Apple’s free beta app',
  'Open Coach Connect & sign in',
];

// Manipulate here: the FAQ questions, grouped for the /faqs page.
// Starter set written from facts already on this site — the owner
// replaces these with his real Q&A. Answers may reuse the locked
// strings (trial, savings, fees) imported above. group names the
// heading the question sits under; keep groups in FAQ_GROUPS order.
const FAQ_GROUPS = ['Getting started', 'Pricing and rates', 'Finding your coach', 'The app'];
const FAQ_ITEMS = [
  {
    group: 'Getting started',
    question: 'When does Coach Connect launch?',
    answer:
      'Coach Connect is coming soon — we open late 2026, founding trainers first. Join the waitlist and you will hear from us before the doors open.',
  },
  {
    group: 'Pricing and rates',
    question: 'How much does it cost?',
    answer: `Coach Connect Pro is $59.99/mo, or $49/mo billed annually at $588/yr (${ANNUAL_SAVINGS_COPY}). Every plan starts with a ${TRIAL_COPY}.`,
  },
  {
    group: 'Pricing and rates',
    question: 'Is there a per-client fee?',
    answer: `No. One flat price covers your whole roster — there are no per-client fees as it grows. ${FEE_COPY}`,
  },
  {
    group: 'Getting started',
    question: "I'm a client — do I pay for the app?",
    answer:
      'The app is free for clients. You find your coach in the marketplace, follow your plan, log your nutrition, and pay your coach in the app.',
  },
  {
    group: 'Finding your coach',
    question: 'How does Coach Connect match me with a trainer?',
    answer:
      'By expertise, experience, training style, and reviews — not by how big a trainer’s social following is. You discover trainers suited to your needs without spending hours comparing profiles across different platforms.',
  },
  {
    group: 'Pricing and rates',
    question: 'How is a trainer’s rate set?',
    answer:
      'Trainers submit their preferred minimum and maximum earnings per client for monthly or yearly coaching. Coach Connect then sets the rate based on their expertise, experience, and what they’ve earned previously — keeping coaching within reach for clients while recognizing the value trainers bring.',
  },
  {
    group: 'Finding your coach',
    question: 'I’m a trainer — how do clients find me?',
    answer:
      'Your years of coaching, training specialties, and reviews help you get discovered. Coach Connect uses those details to match you with potential clients looking for what you offer, so you spend less time trying to get noticed and more time building coaching relationships.',
  },
  {
    group: 'The app',
    question: 'What does the AI Coach do?',
    answer:
      'It can log a meal, water, sleep or steps for you, or edit a workout — and it asks you to confirm before anything changes.',
  },
  {
    group: 'The app',
    question: 'How do payments work?',
    answer:
      'Clients pay through Stripe right in the app. No payment links over DM, no separate invoicing tool — payouts are part of the same system as the coaching.',
  },
];

// The seven things Coach Connect does, one card each. Everything
// below is grounded in the real app (the Coach Connect repo,
// 7th-Project--Coach-Connect, checked 2026-10-20/21): the marketplace
// really filters by specialty / experience / price / session type,
// nutrition really has a barcode scanner and coach-visible macros,
// workout plans really export as PDFs, and the AI Coach really pops
// a confirmation before it logs or edits anything (its voice input
// was removed from the app — do not claim it). Keep every line this
// specific; no invented features. description = what the thing IS,
// has = what it HAS, four short items at most — the owner wants very
// little text per card.
const WHAT_IS_PIECES = [
  {
    title: 'Find a trainer',
    description: 'The marketplace where clients find the right coach.',
    has: ['Specialty, experience & price filters', 'Remote, in-person, or both', 'Certs, reviews & rates on profiles', 'Send a request — trainer accepts'],
  },
  {
    title: 'Workout plans',
    description: 'Your training program, delivered and tracked in one place.',
    has: ['Built by your coach, for you', 'Searchable video exercise library', 'Log workouts as you go', 'Export your plan as a PDF'],
  },
  {
    title: 'Log nutrition',
    description: 'Everything you eat, logged against your targets.',
    has: ['Barcode scanner', 'Food search & quick add', 'Macro targets & daily totals', 'Your coach sees your logs'],
  },
  {
    title: 'Messaging',
    description: 'One direct line between client and coach.',
    has: ['Real-time 1:1 chat', 'Unread badges', 'Push notifications', 'Private — just you two'],
  },
  {
    title: 'Book sessions',
    description: 'Coaching sessions, scheduled without the back-and-forth.',
    has: ['Your coach books the session', 'Accept or decline invites', 'Reminder cards on your dashboard', 'Calendar view in the app'],
  },
  {
    title: 'Pay in the app',
    description: 'Coaching payments without the DM payment links.',
    has: ['Card payments through Stripe', 'No invoicing tools needed', '10% platform fee per payment', 'Coaches get paid in one system'],
  },
  {
    title: 'AI Coach',
    description: 'A built-in assistant for the day-to-day logging.',
    has: ['Logs meals, water, sleep & steps', 'Edits workouts & books sessions', 'Asks to confirm before any change', 'Private — not shared with your trainer'],
  },
];

// How wide each feature card runs in the chapter's 12-column bento
// grid on desktop: the marketplace and the AI Coach get the wide
// slots, the everyday tools get even thirds between them. Same
// order as WHAT_IS_PIECES. On phones every card is full width.
// Manipulate here: the col-span numbers are the rhythm — 7+5, then
// 4+4+4, then 5+7. Change one and its row mate must still total 12.
const WHAT_IS_CARD_SPANS = [
  'lg:col-span-7',
  'lg:col-span-5',
  'lg:col-span-4',
  'lg:col-span-4',
  'lg:col-span-4',
  'lg:col-span-5',
  'lg:col-span-7',
];

// Each card's gradient pair, cycling the brand palette. Color on
// these cards is LIGHT, never a flat fill (the owner's call): the
// pair paints the index number and the list markers as gradient
// text, and glows faintly from the card's top corner. Same order
// as WHAT_IS_PIECES.
// Manipulate here: first stop = where the glow sits strongest;
// keep pairs inside pink/orange, purple/pink, cyan/purple.
const WHAT_IS_CARD_GRADIENTS = [
  ['#FF6B9D', '#F97316'],
  ['#06B6D4', '#C084FC'],
  ['#C084FC', '#FF6B9D'],
  ['#F97316', '#FF6B9D'],
  ['#06B6D4', '#FF6B9D'],
  ['#C084FC', '#06B6D4'],
  ['#FF6B9D', '#F97316'],
];

// The rest of the partner's text, under the pieces above — pricing for
// clients, discovery for trainers. These replaced the Lottie lifter
// animation (the owner's call), so nothing from the partner is left
// sitting off-page, and no new section was added for it. They render
// as two staggered blocks (see AudienceBlocks below) — a first pass
// rendered this as one tall text slab and the owner rejected it on
// sight, and the plainer passes after it went the same way.
// Manipulate here: keep the two titles verbatim — they are his headlines.
// The client headline in two pieces — lead in white, accent in the
// pink-to-orange gradient. Joined with a space they are the verbatim
// headline: "Good coaching. Thoughtful pricing."
const GOOD_COACHING_CARD_TITLE_LEAD = 'Good coaching.';
const GOOD_COACHING_CARD_TITLE_ACCENT = 'Thoughtful pricing.';
const GOOD_COACHING_CARD_INTRO =
  'Everyone deserves the opportunity to become the best version of themselves. Cost shouldn’t put that opportunity out of reach.';
// How a rate gets set, as steps instead of a paragraph: what trainers
// submit, what Coach Connect weighs, and what the goal of it is.
const RATE_SETTING_STEPS = [
  'Trainers submit their preferred minimum and maximum earnings per client, for monthly or yearly coaching.',
  'Coach Connect sets the rate from their expertise, experience, and what they’ve earned previously.',
  'The goal is simple: keep coaching within reach for clients while recognizing the value trainers bring.',
];
// Same treatment for the trainer headline — lead in white, accent in
// the purple-to-cyan gradient. Joined with a space they are the
// verbatim headline: "You’ve built the experience. Let it bring you clients."
const TRAINER_DISCOVERY_CARD_TITLE_LEAD = 'You’ve built the experience. Let it';
const TRAINER_DISCOVERY_CARD_TITLE_ACCENT = 'bring you clients.';
const TRAINER_DISCOVERY_CARD_BODY =
  'Your years of coaching, training specialties, and reviews should help you get discovered. Coach Connect uses those details to match you with potential clients looking for what you offer.';
const TRAINER_DISCOVERY_CARD_CLOSING =
  'Spend less time trying to get noticed and more time building coaching relationships.';

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

// The pricing panel's checklist — the only place these five are listed
// now (the bento tiles that repeated them were cut with the slim-down).
// Price figures are brand-locked copy — do not edit numbers.
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
      {/* Format borrowed from sponsor ribbons: big, heavy, all-caps
          phrases alternating solid white and outline-only, with a
          small pink spark between them. Even slots wear the solid
          face, odd slots the outline (.marquee-item-outline in
          index.css) — the alternation is the whole look, so the row
          of items should stay even in feel: short phrases of similar
          length. Manipulate here: the gap-8 / pr-8 pair is the
          breathing room around each spark. */}
      {MARQUEE_ITEMS.map((marqueeItem, marqueeItemIndex) => (
        <span
          key={marqueeItem}
          className={`flex items-center gap-8 pr-8 font-display text-xl font-extrabold uppercase leading-none tracking-normal sm:text-2xl lg:text-[1.75rem] ${
            marqueeItemIndex % 2 === 1 ? 'marquee-item-outline' : 'text-white'
          }`}
        >
          {marqueeItem}
          <span className="marquee-spark" aria-hidden="true">
            ✦
          </span>
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

// ===== CHAPTER 01 MOTION =====
// Sharp springs, never soft fades. Reduced motion turns all of it
// off at the call sites.
// vocab: variants = named poses (hidden / show) that framer-motion
// tweens between; the spring's stiffness is how hard it snaps,
// damping is how quickly it settles.

/**
 * One feature card's entrance: a springy rise, staggered by the
 * card's slot so the bento grid deals itself in left to right.
 * @param {number} pieceIndex - the card's slot in WHAT_IS_PIECES
 * @returns {Object} framer-motion variants
 */
function featureCardReveal(pieceIndex) {
  return {
    hidden: { opacity: 0, y: 56 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 80, damping: 16, delay: pieceIndex * 0.06 },
    },
  };
}

/**
 * The audience blocks' entrance: a heavy rise with a sharper spring
 * than the feature rows, so the blocks land like slabs being set down.
 * @param {number} delaySeconds - stagger between the two blocks
 * @returns {Object} framer-motion variants
 */
function audienceBlockReveal(delaySeconds = 0) {
  return {
    hidden: { opacity: 0, y: 80 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 70, damping: 16, delay: delaySeconds } },
  };
}

// The giant backdrop words behind the audience blocks are
// outline-only: transparent fill, a 1px stroke around each letter,
// faint enough to run huge without shouting.
// vocab: WebkitTextStroke = that letter outline.
const GIANT_WORD_OUTLINE_STYLE = { WebkitTextStroke: '1px rgba(255,255,255,0.07)' };

/**
 * One feature card in the chapter's bento grid — the premium pass.
 * Near-black slab, hairline border, faint diagonal sheen; the color
 * is gradient LIGHT, never flat fills or solid accents (the owner's
 * call): each card's pair (WHAT_IS_CARD_GRADIENTS) paints its index
 * number and list markers as gradient text and glows softly from
 * the top corner. Title, one sentence on what the thing is, then
 * what it has as a numbered mono list. Hover lifts the card into a
 * soft colored shadow — a glow, not the old hard offset block.
 * @param {Object} props
 * @param {{ title: string, description: string, has: string[] }} props.piece - one entry from WHAT_IS_PIECES
 * @param {number} props.pieceIndex - its slot, for span, number, and gradient
 * @param {boolean} props.userPrefersReducedMotion - true = render finished, animate nothing
 * @returns {JSX.Element}
 */
function WhatIsFeatureCard({ piece, pieceIndex, userPrefersReducedMotion }) {
  // 1. This card's number and gradient pair.
  const pieceNumber = String(pieceIndex + 1).padStart(2, '0');
  const gradientPair = WHAT_IS_CARD_GRADIENTS[pieceIndex];
  const gradientTextStyle = {
    backgroundImage: `linear-gradient(120deg, ${gradientPair[0]}, ${gradientPair[1]})`,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
  };

  return (
    <motion.article
      variants={featureCardReveal(pieceIndex)}
      initial={userPrefersReducedMotion ? false : 'hidden'}
      whileInView={userPrefersReducedMotion ? undefined : 'show'}
      whileHover={userPrefersReducedMotion ? undefined : { y: -5 }}
      viewport={{ once: true, margin: '-8%' }}
      className={`group relative flex flex-col overflow-hidden border border-white/[0.08] bg-[linear-gradient(165deg,rgba(255,255,255,0.05),rgba(255,255,255,0.012)_55%)] p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-[border-color,box-shadow] duration-300 hover:border-white/20 hover:shadow-[0_24px_60px_-16px_var(--card-glow)] sm:col-span-1 ${WHAT_IS_CARD_SPANS[pieceIndex]}`}
      style={{ '--card-glow': `${gradientPair[0]}38` }}
    >
      {/* 2. The colored glow in the top corner — light through
          frosted glass, kept faint so the card stays near-black. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(430px circle at 88% -12%, ${gradientPair[0]}24, transparent 62%)`,
        }}
      />

      {/* 3. The index number in the card's gradient. */}
      <span className="display-extrude relative font-display text-[2.6rem] font-black leading-none" aria-hidden="true">
        <span style={gradientTextStyle}>{pieceNumber}</span>
      </span>

      {/* 4. What it is: the title and one sentence. */}
      <h3 className="relative mt-8 font-display text-xl font-bold leading-snug text-white sm:text-2xl">{piece.title}</h3>
      <p className="relative mt-2.5 font-mono text-sm leading-relaxed text-white/55">{piece.description}</p>

      {/* 5. What it has: gradient-numbered items, hairline between
          each, pushed to the card's foot so lists align in a row. */}
      <ul className="relative mt-auto list-none p-0 pt-7">
        {piece.has.map((featureItem, featureItemIndex) => (
          <li
            key={featureItem}
            className="flex items-baseline gap-3.5 border-t border-white/[0.06] py-2.5 font-mono text-[0.8rem] leading-snug text-white/70"
          >
            <span className="font-mono text-[0.68rem] font-bold" style={gradientTextStyle}>
              {String(featureItemIndex + 1).padStart(2, '0')}
            </span>
            {featureItem}
          </li>
        ))}
      </ul>
    </motion.article>
  );
}

/**
 * The partner text under the feature grid: two audience blocks in
 * an architectural split (design from Emergent, ported 2026-10-21).
 * Giant outline CLIENTS / TRAINERS words sit behind them. The client
 * block is a wide pink-to-orange gradient-shell slab sitting high,
 * with the rate steps as a blueprint numbered list; the trainer
 * block is a narrower purple-to-cyan slab dropped low beside it.
 * Each ends in a hard-edged text link, never a pill. Copy lives in
 * the GOOD_COACHING / RATE_SETTING / TRAINER_DISCOVERY constants
 * above; paragraphs wear font-mono (the pixel face is too wide for
 * sentences).
 * @param {Object} props
 * @param {boolean} props.userPrefersReducedMotion - true = render finished, animate nothing
 * @returns {JSX.Element}
 */
function AudienceBlocks({ userPrefersReducedMotion }) {
  return (
    <div className="relative" data-testid="good-coaching-card">
      {/* The giant outline words behind the blocks — the same
          outline-letter language as the marquee strip up-page. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -left-4 -top-20 z-0 select-none whitespace-nowrap font-display text-[22vw] font-black leading-none text-transparent lg:-top-36 lg:text-[13rem]"
        style={GIANT_WORD_OUTLINE_STYLE}
      >
        CLIENTS
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 -right-4 z-0 select-none whitespace-nowrap font-display text-[22vw] font-black leading-none text-transparent lg:-bottom-36 lg:text-[13rem]"
        style={GIANT_WORD_OUTLINE_STYLE}
      >
        TRAINERS
      </span>

      <div className="relative z-10 grid grid-cols-1 gap-y-16 lg:grid-cols-12 lg:gap-y-0">
        {/* Clients: the wide slab, sitting high. One pixel of gradient
            shell around a near-black interior with soft aurora glows. */}
        <motion.article
          variants={audienceBlockReveal(0)}
          initial={userPrefersReducedMotion ? false : 'hidden'}
          whileInView={userPrefersReducedMotion ? undefined : 'show'}
          viewport={{ once: true, margin: '-10%' }}
          className="relative p-px lg:col-span-7 lg:col-start-1"
          style={{
            backgroundImage:
              'linear-gradient(135deg, #FF6B9D 0%, rgba(255,107,157,0.10) 40%, rgba(249,115,22,0.10) 60%, #F97316 100%)',
          }}
          aria-labelledby="clients-heading"
        >
          <div className="relative h-full overflow-hidden bg-[#0C0C13] p-8 sm:p-12 lg:p-16">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full opacity-25 blur-[80px]"
              style={{ background: 'radial-gradient(closest-side, #FF6B9D, transparent)' }}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full opacity-20 blur-[80px]"
              style={{ background: 'radial-gradient(closest-side, #F97316, transparent)' }}
            />
            {/* Gradient registration bar along the top edge. */}
            <span
              aria-hidden="true"
              className="absolute left-0 top-0 h-1 w-28"
              style={{ backgroundImage: 'linear-gradient(90deg,#FF6B9D,#F97316)' }}
            />
            <div className="relative">
              <p className="font-mono text-xs uppercase tracking-[0.35em] text-pink">For clients</p>
              <h3 id="clients-heading" className="mt-6 font-display text-2xl font-bold leading-snug text-white sm:text-3xl lg:text-4xl">
                {GOOD_COACHING_CARD_TITLE_LEAD}{' '}
                <span className="bg-gradient-to-r from-pink to-orange bg-clip-text text-transparent">
                  {GOOD_COACHING_CARD_TITLE_ACCENT}
                </span>
              </h3>
              <p className="mt-6 max-w-xl font-mono text-sm leading-relaxed text-white/60">{GOOD_COACHING_CARD_INTRO}</p>

              {/* How the rate is set: blueprint steps — giant gradient
                  numbers beside mono paragraphs, hairline under each. */}
              <h4 className="mt-14 border-t border-white/10 pt-8 font-mono text-xs uppercase tracking-[0.35em] text-white/40">
                How your rate is set
              </h4>
              <ol className="mt-2 list-none p-0">
                {RATE_SETTING_STEPS.map((rateStep, stepIndex) => (
                  <li
                    key={rateStep}
                    className="grid grid-cols-[3.5rem_1fr] items-start gap-x-4 border-b border-white/10 py-7 last:border-b-0 lg:grid-cols-[5rem_1fr] lg:gap-x-8"
                  >
                    <span
                      aria-hidden="true"
                      className="bg-gradient-to-r from-pink to-orange bg-clip-text font-display text-2xl font-extrabold leading-none text-transparent lg:text-4xl"
                    >
                      {String(stepIndex + 1).padStart(2, '0')}
                    </span>
                    <p className="font-mono text-sm leading-relaxed text-white/60">{rateStep}</p>
                  </li>
                ))}
              </ol>

              {/* Hard-edged text link with a sliding arrow — the
                  gradient lives in a 2px underline only. */}
              <Link
                to="/for-clients"
                data-testid="pill-clients"
                className="group/link mt-12 inline-flex items-center gap-3 font-display text-sm font-bold uppercase tracking-widest text-white lg:text-base"
              >
                <span
                  className="pb-1 transition-colors duration-200 group-hover/link:text-pink"
                  style={{
                    backgroundImage: 'linear-gradient(90deg,#FF6B9D,#F97316)',
                    backgroundSize: '100% 2px',
                    backgroundPosition: '0 100%',
                    backgroundRepeat: 'no-repeat',
                  }}
                >
                  For Clients
                </span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="h-5 w-5 text-pink transition-transform duration-300 group-hover/link:-translate-y-1 group-hover/link:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </motion.article>

        {/* Trainers: the narrow black slab, dropped low for the
            stagger, in the purple-to-cyan shell. */}
        <motion.article
          variants={audienceBlockReveal(0.15)}
          initial={userPrefersReducedMotion ? false : 'hidden'}
          whileInView={userPrefersReducedMotion ? undefined : 'show'}
          viewport={{ once: true, margin: '-10%' }}
          className="relative self-start p-px lg:col-span-4 lg:col-start-9 lg:mt-48"
          style={{
            backgroundImage:
              'linear-gradient(135deg, #C084FC 0%, rgba(192,132,252,0.10) 40%, rgba(6,182,212,0.10) 60%, #06B6D4 100%)',
          }}
          aria-labelledby="trainers-heading"
        >
          <div className="relative h-full overflow-hidden bg-black p-8 sm:p-12">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full opacity-25 blur-[80px]"
              style={{ background: 'radial-gradient(closest-side, #C084FC, transparent)' }}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full opacity-20 blur-[80px]"
              style={{ background: 'radial-gradient(closest-side, #06B6D4, transparent)' }}
            />
            <span
              aria-hidden="true"
              className="absolute left-0 top-0 h-1 w-20"
              style={{ backgroundImage: 'linear-gradient(90deg,#C084FC,#06B6D4)' }}
            />
            <div className="relative">
              <p className="font-mono text-xs uppercase tracking-[0.35em] text-purple">For trainers</p>
              <h3 id="trainers-heading" className="mt-6 font-display text-2xl font-bold leading-snug text-white lg:text-3xl">
                {TRAINER_DISCOVERY_CARD_TITLE_LEAD}{' '}
                <span className="bg-gradient-to-r from-purple to-cyan bg-clip-text text-transparent">
                  {TRAINER_DISCOVERY_CARD_TITLE_ACCENT}
                </span>
              </h3>
              <p className="mt-6 font-mono text-sm leading-relaxed text-white/60">{TRAINER_DISCOVERY_CARD_BODY}</p>

              {/* The closing line set as a large gradient statement. */}
              <p className="mt-12 border-t border-white/10 bg-gradient-to-r from-purple to-cyan bg-clip-text pt-10 font-display text-lg font-bold leading-snug text-transparent lg:text-xl">
                {TRAINER_DISCOVERY_CARD_CLOSING}
              </p>

              <Link
                to="/for-trainers"
                data-testid="pill-trainers"
                className="group/link mt-12 inline-flex items-center gap-3 font-display text-sm font-bold uppercase tracking-widest text-white lg:text-base"
              >
                <span
                  className="pb-1 transition-colors duration-200 group-hover/link:text-purple"
                  style={{
                    backgroundImage: 'linear-gradient(90deg,#C084FC,#06B6D4)',
                    backgroundSize: '100% 2px',
                    backgroundPosition: '0 100%',
                    backgroundRepeat: 'no-repeat',
                  }}
                >
                  For Trainers
                </span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="h-5 w-5 text-purple transition-transform duration-300 group-hover/link:-translate-y-1 group-hover/link:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </motion.article>
      </div>
    </div>
  );
}

// ===== MAIN FUNCTIONS (the sections, in page order) =====

/**
 * The hero. Top row: the one-line wordmark and the app line
 * compacted into a single centered header card (.hero-title-card in
 * index.css) — compact at the owner's call, so the phone below gets
 * the room. Under it, a three-zone
 * middle row with no copy in it (the owner's call): the iPhone
 * playing the app on the left (ui/HeroPhone.jsx); the 3D CC logo BIG
 * in the middle — the hero's centerpiece; and the Apple Watch-style
 * card (ui/HeroWatch.jsx) on the right, in the widest of the three
 * columns so the case can run near full size. On smaller screens it
 * stacks: wordmark, phone, logo, watch. The mouse-follow grid sits
 * behind everything and does not take clicks. On load, the pieces
 * rise in staggered behind the startup curtain (ui/StartupIntro.jsx)
 * — wordmark, app line, phone, logo, watch — unless the visitor
 * prefers reduced motion.
 * @returns {JSX.Element}
 */
export function TopSection() {
  const userPrefersReducedMotion = usePrefersReducedMotion();

  // Where each hero piece starts before it rises in. Reduced motion
  // turns the whole choreography off: initial={false} in framer-motion
  // means "render the finished state immediately, animate nothing."
  // vocab: filter blur = the piece starts softly out of focus and
  // sharpens as it lands — the fashionable part of the entrance.
  const wordmarkStart = userPrefersReducedMotion ? false : { opacity: 0, y: 28, filter: 'blur(10px)' };
  const logoStart = userPrefersReducedMotion ? false : { opacity: 0, y: 24, scale: 0.92 };
  const phoneStart = userPrefersReducedMotion ? false : { opacity: 0, x: -48 };
  const watchStart = userPrefersReducedMotion ? false : { opacity: 0, x: 48 };

  return (
    <MouseGridBackground id="act-arrival" className="landing-section isolate overflow-hidden">
      {/* Full width on purpose. min-h calc(100dvh - 6.6rem) = viewport minus
          this section's own padding, so the middle row can fill the hero.
          Manipulate here: lg:px-6 = how far the outer zones sit from the
          screen edges. */}
      <div className="landing-section-body relative z-[1] flex min-h-[calc(100dvh-6.6rem)] w-full flex-col px-5 lg:px-6" data-testid="hero">
        {/* 1. Top row: the name and its one-liner, compacted into a
            single header card (the owner's call) — the wordmark on ONE
            line over the app line, in a small dark-glass slab centered
            on the page. Keeping the pair in one short card is what
            frees the vertical room for the phone to run full-size
            under it. The card's skin lives in index.css
            (.hero-title-card); it rises as one piece on load.
            Manipulate here: the card's padding in index.css is how
            tall this whole zone is; every pixel saved there is a
            pixel the phone gets. */}
        <motion.div
          className="hero-title-card relative z-[2] mx-auto w-fit"
          initial={wordmarkStart}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.9, delay: HERO_ENTRANCE_DELAYS_SECONDS.wordmark, ease: HERO_ENTRANCE_EASE }}
        >
          <h1 className="flex justify-center" data-testid="hero-wordmark">
            <Wordmark stacked={false} className="items-center" />
          </h1>
          {/* The one line that says what this site is: the home of the
              mobile app, right under the name so nobody mistakes the
              page for the product itself. Pure typography: a
              letterspaced all-caps masthead line in the display font,
              white, with only the brand name in the gradient. */}
          <p
            className="mt-2 text-center font-display text-[0.58rem] font-bold uppercase leading-relaxed tracking-[0.24em] text-white/85 sm:text-[0.66rem]"
            data-testid="hero-app-line"
          >
            The official website for the <span className="wordmark-connect">Coach Connect</span> mobile app.
          </p>
        </motion.div>

        {/* 2. The middle row: phone left, logo center, watch right.
            No copy in this row at the owner's call — the wordmark and
            app line above say the name, the devices show the product.
            (The old left-column copy lives on in ui/HeroLeftColumn.jsx,
            parked.) Items center vertically so the row's middle is the
            hero's middle; stacked screens keep the same left-to-right
            order: phone, logo, watch.
            The two side columns are equal (minmax(0,1fr) each around
            the auto center — the minmax(0,...) matters: without it the
            watch's rigid 500px case inflates its track and shoves the
            logo off-center), which is what puts the logo on the page's
            true center instead of wherever the unequal zones left it.
            Manipulate here: the phone's fixed 300px lives in index.css
            (.ccp-wrap); the watch hugs the right edge of its column. */}
        <div className="grid flex-1 grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-6">
          {/* 2a. Left: the iPhone, playing the app (ui/HeroPhone.jsx). */}
          <motion.div
            className="justify-self-center lg:justify-self-start lg:self-start min-[1400px]:-mt-[5.25rem]"
            data-testid="hero-phone-slot"
            initial={phoneStart}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: HERO_ENTRANCE_DELAYS_SECONDS.phone, ease: HERO_ENTRANCE_EASE }}
          >
            <HeroPhone />
          </motion.div>

          {/* 2b. Center: the CC logo, big — the hero's centerpiece
              again. Its enlarged stage lives in index.css
              (.hero-center-logo). */}
          <motion.div
            className="hero-center-logo justify-self-center lg:mr-10"
            data-testid="hero-center-logo"
            initial={logoStart}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: HERO_ENTRANCE_DELAYS_SECONDS.logo, ease: HERO_ENTRANCE_EASE }}
          >
            <LogoModel />
          </motion.div>

          {/* 2c. Right: the watch, in the widest column. The
              .hero-middle-watch rules in index.css set the case scale
              and stage height so the column never crops it. */}
          <motion.div
            className="hero-middle-watch order-3 h-full w-full max-w-[560px] justify-self-center lg:justify-self-start"
            initial={watchStart}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: HERO_ENTRANCE_DELAYS_SECONDS.watch, ease: HERO_ENTRANCE_EASE }}
          >
            <HeroWatch />
          </motion.div>
        </div>
      </div>

      {/* Sits centered over the grid, so it stays clickable above the background. */}
      <HeroScrollHint />
    </MouseGridBackground>
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
 * Chapter 01 — what is Coach Connect. The header is the owner's
 * approved block (mono kicker, the big question with the brand name
 * in the pink-to-orange gradient, the lead). Under it, one card per
 * feature in a bento grid (WhatIsFeatureCard): what the thing is in
 * one sentence, what it has in four short items, all grounded in the
 * real app repo. The partner copy lands after as two staggered
 * gradient-shell blocks (AudienceBlocks). The backdrop words behind
 * those blocks bleed sideways on purpose, so the section clips x.
 * @returns {JSX.Element}
 */
export function WhatIsSection() {
  const userPrefersReducedMotion = usePrefersReducedMotion();

  return (
    <MouseGridBackground id="act-connection" className="landing-section overflow-x-clip">
      <div className="mx-auto flex w-full max-w-6xl flex-col px-5" data-testid="caption-connection">
        {/* 1. The header, left-aligned: mono kicker, big question,
            lead. Locked — the owner approved this block as-is. */}
        <FadeIn>
          <p
            className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-white/40"
            data-testid="caption-connection-eyebrow"
          >
            <span className="text-orange">01</span>
            <span aria-hidden="true"> / </span>
            What Is Coach Connect
          </p>
          <h2
            className="display-extrude mt-4 font-display text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl"
            data-testid="caption-connection-title"
          >
            <span className="display-face">What is </span>
            <span className="wordmark-connect">Coach Connect?</span>
          </h2>
          <p className="mt-5 max-w-2xl font-mono text-sm leading-relaxed text-white/60 sm:text-base" data-testid="what-is-body">
            The all-in-one app for coaching. Trainers run their whole business from it — and clients get their coach,
            their plan, and their progress in one place.
          </p>
        </FadeIn>

        {/* 2. One card per feature in the bento grid. Phones stack
            them full-width, small tablets pair them, and the 12-column
            rhythm (wide, narrow, thirds, wide) only exists on lg. */}
        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12" data-testid="what-is-index">
          {WHAT_IS_PIECES.map((piece, pieceIndex) => (
            <WhatIsFeatureCard
              key={piece.title}
              piece={piece}
              pieceIndex={pieceIndex}
              userPrefersReducedMotion={userPrefersReducedMotion}
            />
          ))}
        </div>

        {/* 3. The partner copy as the two staggered audience blocks,
            sitting well under the grid so the backdrop words behind
            them have room to bleed. */}
        <div className="mt-24 lg:mt-40">
          <AudienceBlocks userPrefersReducedMotion={userPrefersReducedMotion} />
        </div>
      </div>
    </MouseGridBackground>
  );
}

/**
 * The FAQs — one card per question, tap to open the answer. These moved
 * off the homepage to their own page (pages/Faqs.jsx at /faqs) at the
 * owner's call; the nav's FAQs link lands there now. The open/close
 * animation is pure CSS (.cc-faq-answer in index.css); this component
 * only tracks which card is open.
 * @returns {JSX.Element}
 */
export function FaqSection() {
  // Which questions are open — several can be open at once, so visitors
  // never have to close one answer to read another. The first starts
  // open so visitors see the rows are tappable.
  const [openFaqQuestions, setOpenFaqQuestions] = useState([FAQ_ITEMS[0].question]);

  /**
   * Open one answer, or close it if it is already open.
   * @param {string} question - the row that was tapped
   * @returns {void}
   */
  const toggleFaqQuestion = (question) => {
    // vocab: the function form of the setter reads the latest state, so
    // two fast taps can never overwrite each other's open answer.
    setOpenFaqQuestions((currentlyOpenQuestions) => {
      if (currentlyOpenQuestions.includes(question)) {
        return currentlyOpenQuestions.filter((openQuestion) => openQuestion !== question);
      }
      return [...currentlyOpenQuestions, question];
    });
  };

  return (
    <MouseGridBackground id="act-faqs" className="landing-section-alt">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 lg:grid-cols-[minmax(0,21rem)_minmax(0,1fr)] lg:gap-16" data-testid="faq">
        {/* 1. The intro column. On wide screens it sticks while the
            questions scroll beside it (the Stripe/Linear pattern); on
            phones it simply sits on top. No card, no eyebrow chip —
            the heading carries the column on its own. */}
        <FadeIn className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="display-extrude font-display text-4xl font-extrabold leading-tight text-white sm:text-5xl" data-testid="faq-title">
            <span className="display-face">Questions, answered.</span>
          </h2>
          <p className="mt-4 font-mono text-sm leading-relaxed text-white/60" data-testid="faq-body">
            The short version of everything people ask before joining the waitlist.
          </p>
          <p className="mt-6 font-mono text-sm leading-relaxed text-white/60">
            Still stuck?{' '}
            <Link to="/#act-finale" className="font-semibold text-white underline decoration-orange/60 decoration-2 underline-offset-4 transition-colors hover:text-orange">
              Join the waitlist
            </Link>{' '}
            and we will tell you when the doors open.
          </p>
        </FadeIn>

        {/* 2. The questions, grouped, as plain hairline rows — no cards.
            Research pattern (Tally/Stripe): full-width rows, a divider
            between each, the whole row tappable, a plus that rotates
            into an × on the open row. */}
        <div data-testid="faq-list">
          {FAQ_GROUPS.map((faqGroup, faqGroupIndex) => (
            <div key={faqGroup}>
              <h3 className={`mb-1 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-white/40 ${faqGroupIndex === 0 ? 'mt-0' : 'mt-10'}`}>
                {faqGroup}
              </h3>
              <div className="border-b border-white/10">
                {FAQ_ITEMS.filter((faqItem) => faqItem.group === faqGroup).map((faqItem) => {
                  const isFaqOpen = openFaqQuestions.includes(faqItem.question);
                  return (
                    <div key={faqItem.question} className="border-t border-white/10" data-testid="faq-item">
                      <button
                        type="button"
                        onClick={() => toggleFaqQuestion(faqItem.question)}
                        aria-expanded={isFaqOpen}
                        className="group flex w-full items-center gap-4 py-5 text-left"
                        data-testid="faq-question"
                      >
                        <span className="flex-1 font-display text-base font-semibold leading-snug text-white/85 transition-colors group-hover:text-white sm:text-lg">
                          {faqItem.question}
                        </span>
                        <Plus
                          size={20}
                          strokeWidth={2.2}
                          className={`shrink-0 transition-transform duration-300 ${isFaqOpen ? 'rotate-45 text-orange' : 'text-white/40 group-hover:text-white/70'}`}
                        />
                      </button>

                      {/* vocab: data-open drives the .cc-faq-answer grid-rows animation in index.css */}
                      <div className="cc-faq-answer" data-open={isFaqOpen} data-testid="faq-answer">
                        <div>
                          <p className="max-w-[65ch] pb-6 font-mono text-sm leading-relaxed text-white/60">
                            {faqItem.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
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
 * Chapter 02 — subscription: one quiet pricing panel, nothing else. The
 * owner cut the old bento (a wide get-paid tile plus five benefit tiles
 * repeating this panel's checklist) as too much information. Every
 * figure here is locked copy from config/siteConfig.js.
 * @returns {JSX.Element}
 */
export function BenefitsBento() {
  return (
    <MouseGridBackground id="act-pricing" className="landing-section">
      <div className="mx-auto w-full max-w-6xl px-5" data-testid="pricing-section">
        <SectionHeader
          color="#F97316"
          eyebrow="02 · Subscription"
          title="Everything included. One price."
          body="One flat price, no per-client fees. One subscription runs the whole practice."
          testId="pricing"
        />

        {/* The one panel: price, annual, trial, the five included things,
            the CTA, and the fee note. Quiet dark glass — no gradient rim. */}
        <FadeIn className="mx-auto mt-8 w-full max-w-xl rounded-3xl border border-white/10 bg-[#0a0a0f]/55 p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl sm:p-8">
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
      </div>
    </MouseGridBackground>
  );
}

/**
 * Chapter 03 — the waitlist finale (Coming Soon), with the footer directly
 * under it. The catchphrase headline stays; under it, one horizontal row
 * holds both paths: the waitlist form on the left and, directly beside it,
 * the TestFlight shortcut for anyone who would rather run the live iOS
 * beta today than wait for launch. The form itself lives in
 * src/waitlist/; the beta link is TESTFLIGHT_URL in config.
 * @returns {JSX.Element}
 */
export function JoinNowFooter() {
  return (
    <>
      <MouseGridBackground id="act-finale" className="landing-section-alt">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-5 text-center" data-testid="finale">
          <FadeIn className="flex w-full max-w-6xl flex-col items-center">
            {/* 1. Where in the story we are, and when the doors open */}
            <p className="mb-4 font-pixel text-[0.6rem] uppercase leading-relaxed text-pink" data-testid="finale-eyebrow">
              03 · Waitlist
            </p>
            {/* Manipulate here: launch timing wording — the owner's to confirm */}
            <span
              className="rounded-full border border-pink/40 bg-pink/10 px-4 py-1.5 font-pixel text-[0.55rem] uppercase leading-relaxed text-pink"
              data-testid="finale-launch-chip"
            >
              Coming Soon · Late 2026
            </span>

            {/* 2. The catchphrase, then what joining gets you */}
            <h2 className="display-extrude mt-6 max-w-3xl font-display text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl" data-testid="finale-headline">
              <span className="display-face">One Day </span>
              <span className="headline-grad">or</span>
              <span className="display-face"> Day One!</span>
            </h2>
            <p className="mt-5 max-w-xl text-lg text-white/55" data-testid="finale-sub">
              Join the waitlist to register ahead of time. When Coach Connect opens, founding
              trainers and their clients are first in.
            </p>

            {/* 3. One horizontal row, two paths: the waitlist form on the
                left, the TestFlight beta directly beside it on the right —
                the beta does NOT get its own standalone card underneath
                (the owner's call). On phones the row stacks, waitlist first.
                Both halves stretch to the same height. */}
            <div className="mt-6 grid w-full items-stretch gap-4 lg:grid-cols-2">
              {/* 3a. The signup itself, in the signature glass panel */}
              <div className="what-is-panel h-full w-full rounded-[2rem] p-5 sm:px-8 sm:py-6" data-testid="waitlist-card">
                <WaitlistForm />
                <p className="waitlist-aside mt-4 text-xs leading-relaxed text-white/40">
                  Creates your Coach Connect login in the same account system as the app. The app is free for clients; coaches start with a {TRIAL_COPY}.
                </p>
              </div>

              {/* 3b. The shortcut, as a slim dark-glass card in the same row:
                  the waitlist is Day One, but the beta is TODAY. TestFlight
                  is Apple's own beta-delivery app — tapping the button leaves
                  the site for Apple's invite, installs the beta through
                  TestFlight, and the login made in the form beside it signs
                  into it.
                  vocab: target="_blank" + rel="noreferrer" = open in a new tab
                  without handing the new page a handle back to this one. */}
              <div
                className="testflight-card flex h-full flex-col rounded-3xl border border-white/10 bg-[#0a0a0f]/55 p-6 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl sm:p-7"
                data-testid="finale-testflight"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="testflight-live-chip">
                    <span className="testflight-live-dot" aria-hidden="true" />
                    Live · iOS Beta
                  </span>
                  <span className="font-mono text-xs text-white/40">iPhone only · free</span>
                </div>

                <h3 className="mt-4 font-display text-2xl font-extrabold leading-tight text-white">
                  Can’t wait ’til late 2026? <span className="headline-grad">Good — don’t.</span>
                </h3>
                <p className="mt-3 font-mono text-sm leading-relaxed text-white/60">
                  Coach Connect is already on iPhones through TestFlight. Grab the beta now,
                  sign in with the login you just made beside this card, and make today Day One —
                  rough edges, early features, and all.
                </p>

                {/* Manipulate here: this is THE beta button — its href is the
                    locked TESTFLIGHT_URL from config, never a pasted link here. */}
                <a
                  href={TESTFLIGHT_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="cta-primary hero-action hero-action-primary testflight-cta mt-5 self-start"
                  data-testid="finale-testflight-cta"
                >
                  <Apple size={18} aria-hidden="true" />
                  Get the beta
                  <ArrowUpRight size={16} aria-hidden="true" />
                </a>

                {/* The three taps, so “beta” never reads as homework */}
                <ol className="testflight-steps">
                  {TESTFLIGHT_STEPS.map((testflightStep, stepIndex) => (
                    <li key={testflightStep} className="testflight-step">
                      <span className="testflight-step-number" aria-hidden="true">{stepIndex + 1}</span>
                      {testflightStep}
                    </li>
                  ))}
                </ol>
                <p className="mt-auto pt-4 font-mono text-xs leading-relaxed text-white/35">
                  Opens in Apple TestFlight · about 2 minutes · no waitlist spot needed
                </p>
              </div>
            </div>

            {/* 4. The quiet exit for anyone not ready to sign up or beta-test */}
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
