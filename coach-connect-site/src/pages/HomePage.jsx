// HomePage.jsx — "/". The hero (untouched), then four sections, one idea each:
// a. One app, two sides: a phone and the Client / Trainer toggle (dark)
// b. Pick your side: two poster cards linking to /trainers and /clients (cream)
// c. Before you ask: four questions and a link to /faq (dark)
// d. The final call to action: waitlist and TestFlight beta (aurora)
// The client tour, "Three things a day" and "Four steps" live on /clients,
// /clients and /how-it-works now; their components are unchanged there.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TornEdge } from '../backgrounds/TornEdge';
import { Accordion } from '../components/Accordion';
import { HomeHero } from '../components/HomeHero';
import { ArrowRightIcon } from '../components/Icons';
import { JoinSection } from '../components/JoinSection';
import { Layout } from '../components/Layout';
import { Phone } from '../components/Phone';
import { Seo } from '../components/Seo';
import { FAQ_GROUPS, SIDE_CLIPS } from '../data/content';

const HIGHLIGHT_QUESTIONS = FAQ_GROUPS.flatMap((group) => group.items).filter((item) => item.highlight);

// Stills from the name-free recordings, different from the clips the
// neighbouring sections play.
const SIDES = [
  {
    to: '/trainers',
    who: 'Trainers',
    title: 'Run the business from your phone.',
    image: 'videos/clean/still-trainer.jpg',
    imageAlt: 'A client’s weekly report in the Coach Connect trainer view',
    points: ['Roster, requests and one workspace per client', 'Sessions your clients confirm in the app', 'Stripe payouts. $59.99 a month, no per-client fees'],
    cta: 'See the trainer side',
    tone: 'pink',
  },
  {
    to: '/clients',
    who: 'Clients',
    title: 'Your coach and your plan, together.',
    image: 'videos/clean/still-client.jpg',
    imageAlt: 'The Coach Connect nutrition screen with the day’s calories and macro rings',
    points: ['Find a trainer in the marketplace', 'Follow the plan, log meals with a scan', 'Free. Pay your coach in the app'],
    cta: 'See the client side',
    tone: 'orange',
  },
];

/**
 * a. Statement left, one phone right on a flat orange disc. The toggle swaps
 * the recording.
 * @returns {JSX.Element}
 */
function WhatItIs() {
  const [sideIndex, setSideIndex] = useState(0);
  const activeClip = SIDE_CLIPS[sideIndex];
  // Plays client, then trainer, then rests. The toggle replays either side.
  const playNextSide = () => sideIndex < SIDE_CLIPS.length - 1 && setSideIndex(sideIndex + 1);

  return (
    <section id="what-is" className="scene scene-dark what" aria-labelledby="what-title">
      <div className="container what-grid">
        <div className="what-copy stack-6">
          <h2 id="what-title" className="t-title">
            One app. <span className="hl-orange">Two sides.</span>
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
          <div className="what-disc" aria-hidden="true" />
          <Phone clip={activeClip} onEnded={playNextSide} className="phone-xl" />
        </div>
      </div>
      <TornEdge fills={['var(--orange)', 'var(--paper-2)', 'var(--paper)']} seed={11} />
    </section>
  );
}

/**
 * b. Cream section, two poster cards of different widths. One is tilted.
 * @returns {JSX.Element}
 */
function PickYourSide() {
  return (
    <section className="scene scene-paper sides" aria-labelledby="sides-title">
      <div className="container stack-8">
        <h2 id="sides-title" className="t-title">
          Pick your side.
        </h2>
        <div className="sides-grid">
          {SIDES.map((side) => (
            <Link key={side.to} to={side.to} className={`poster side-card side-${side.tone}`}>
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
                <img src={side.image} alt={side.imageAlt} loading="lazy" width="390" height="848" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * c. One narrow column: heading, the four questions, the link.
 * @returns {JSX.Element}
 */
function QuestionHighlights() {
  return (
    <section className="scene scene-dark faq-home" aria-labelledby="faq-title">
      <div className="container faq-home-column stack-7">
        <h2 id="faq-title" className="t-title">
          Before you ask.
        </h2>
        <Accordion items={HIGHLIGHT_QUESTIONS} size="lg" />
        <Link to="/faq" className="link">
          Every question
          <ArrowRightIcon />
        </Link>
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
      <QuestionHighlights />
      <JoinSection />
    </Layout>
  );
}
