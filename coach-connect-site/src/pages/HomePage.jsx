// HomePage.jsx — "/". A sequence of scenes, each with one visual idea
// (DESIGN.md "Coach Connect section plan"):
// 1 hero (kept from the first site) · 2 what it is: oversized phone on a big
//   orange circle · 3 pick your side: paper, two unequal poster cards · 4 the
//   tour: pinned reel through five real recordings · 5 three things a day: the
//   watch on an orange field, big numerals · 6 how it works: staggered steps over
//   Bauhaus shapes · 7 FAQ on paper · 8 waitlist on a pink field.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shapes } from '../backgrounds/Shapes';
import { TornEdge } from '../backgrounds/TornEdge';
import { Accordion } from '../components/Accordion';
import { HomeHero } from '../components/HomeHero';
import { ArrowRightIcon } from '../components/Icons';
import { JoinSection } from '../components/JoinSection';
import { Kinetic } from '../components/Kinetic';
import { Layout } from '../components/Layout';
import { Phone } from '../components/Phone';
import { Reel } from '../components/Reel';
import { Seo } from '../components/Seo';
import { StepsScene } from '../components/StepsScene';
import { WatchScene } from '../components/WatchScene';
import { CLIENT_FEATURES, FAQ_GROUPS, SIDE_CLIPS } from '../data/content';

const HIGHLIGHT_QUESTIONS = FAQ_GROUPS.flatMap((group) => group.items).filter((item) => item.highlight);

// Behind the "what it is" phone: one big orange circle and a pink ring.
const WHAT_SHAPES = [
  { kind: 'circle', style: { width: '46vw', height: '46vw', right: '-6vw', top: '10%', background: 'var(--orange)' }, drift: 140 },
  { kind: 'ring', style: { width: '22vw', height: '22vw', right: '34vw', bottom: '-6vw', borderColor: 'var(--pink)' }, drift: -90, turn: 60 },
];

const SIDES = [
  {
    to: '/trainers',
    who: 'Trainers',
    title: 'Run the business from your phone.',
    image: '/videos/app-trainer-side.jpg',
    imageAlt: 'Coach Connect trainer home screen',
    points: ['Roster, requests and one workspace per client', 'Sessions your clients confirm in the app', 'Stripe payouts. $59.99 a month, no per-client fees'],
    cta: 'See the trainer side',
    tone: 'pink',
    tilt: '-0.9deg',
  },
  {
    to: '/clients',
    who: 'Clients',
    title: 'Your coach and your plan, together.',
    image: '/videos/app-client-side.jpg',
    imageAlt: 'Coach Connect client home screen',
    points: ['Find a trainer in the marketplace', 'Follow the plan, log meals with a scan', 'Free. Pay your coach in the app'],
    cta: 'See the client side',
    tone: 'orange',
    tilt: '0.9deg',
  },
];

/**
 * Scene 2: big statement left (5 cols), oversized tilted phone right (7 cols)
 * cropped by the scene's bottom edge, on a big orange circle.
 * @returns {JSX.Element}
 */
function WhatItIs() {
  const [sideIndex, setSideIndex] = useState(0);
  const activeClip = SIDE_CLIPS[sideIndex];
  const playNextSide = () => setSideIndex((sideIndex + 1) % SIDE_CLIPS.length);

  return (
    <section id="what-is" className="scene scene-dark what" aria-labelledby="what-title">
      <Shapes shapes={WHAT_SHAPES} />
      <div className="container what-grid">
        <div className="what-copy stack-6">
          <h2 id="what-title" className="t-title">
            One app. <span className="hl-pink">Two sides.</span>
          </h2>
          <p className="lead">
            Trainers run their roster, plans, sessions and payouts from it. Clients find their coach, follow the plan, log food and check
            in. Both sides see the same plan, so nobody copies workouts into a group chat.
          </p>
          <div className="toggle" role="group" aria-label="Which side of the app is playing">
            {SIDE_CLIPS.map((clip, clipIndex) => (
              <button key={clip.id} type="button" className="toggle-option" aria-pressed={clipIndex === sideIndex} onClick={() => setSideIndex(clipIndex)}>
                {clip.label}
              </button>
            ))}
          </div>
          <p className="body muted" aria-live="polite">
            {activeClip.caption}
          </p>
        </div>
        <div className="what-stage">
          <Phone clip={activeClip} onEnded={playNextSide} className="phone-xl" />
        </div>
      </div>
      <TornEdge fills={['var(--orange)', 'var(--paper-2)', 'var(--paper)']} seed={11} />
    </section>
  );
}

/**
 * Scene 3: light paper, two UNEQUAL poster cards (trainer wider, pink;
 * client narrower, orange), each with a big cropped screenshot.
 * @returns {JSX.Element}
 */
function PickYourSide() {
  return (
    <section className="scene scene-paper sides" aria-labelledby="sides-title">
      <div className="container stack-8">
        <Kinetic id="sides-title" className="t-title" text="Pick your side." />
        <div className="sides-grid">
          {SIDES.map((side) => (
            <Link key={side.to} to={side.to} className={`poster side-card side-${side.tone}`} style={{ '--tilt': side.tilt }}>
              <div className="side-copy stack-5">
                <p className="t-numeral side-who">{side.who}</p>
                <h3 className="t-card">{side.title}</h3>
                <ul className="side-points">
                  {side.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                <span className="link side-cta">
                  {side.cta}
                  <ArrowRightIcon />
                </span>
              </div>
              <div className="side-shot">
                <img src={side.image} alt={side.imageAlt} loading="lazy" width="540" height="1094" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Scene 7: FAQ on paper, big accordion type.
 * @returns {JSX.Element}
 */
function QuestionHighlights() {
  return (
    <section className="scene scene-paper faq-home" aria-labelledby="faq-title">
      <div className="container faq-home-grid">
        <div className="stack-5">
          <h2 id="faq-title" className="t-title t-title-narrow">
            Before you ask.
          </h2>
          <Link to="/faq" className="link">
            Every question
            <ArrowRightIcon />
          </Link>
        </div>
        <Accordion items={HIGHLIGHT_QUESTIONS} size="lg" />
      </div>
    </section>
  );
}

/**
 * @returns {JSX.Element}
 */
export default function HomePage() {
  return (
    <Layout>
      <Seo
        title="Coach Connect: one app for personal trainers and their clients"
        description="Plans, nutrition logging, messaging, scheduling and in-app payments for trainers and the people they coach. iOS beta live now, launching late 2026."
      />
      <HomeHero />
      <WhatItIs />
      <PickYourSide />
      <Reel id="tour" scenes={CLIENT_FEATURES} label="Client tour" />
      <WatchScene />
      <StepsScene />
      <QuestionHighlights />
      <JoinSection />
    </Layout>
  );
}
