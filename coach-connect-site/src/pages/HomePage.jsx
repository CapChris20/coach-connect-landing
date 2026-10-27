// HomePage.jsx — "/". Five sections, one idea each (DESIGN.md section 10):
// 1 hero (the first site's phone, 3D logo and watch) · 2 what it is (real app
// recording) · 3 pick your side (links to /trainers and /clients) · 4 a few
// questions · 5 the waitlist.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Accordion } from '../components/Accordion';
import { HomeHero } from '../components/HomeHero';
import { ArrowRightIcon, CheckIcon } from '../components/Icons';
import { JoinSection } from '../components/JoinSection';
import { Layout } from '../components/Layout';
import { Phone } from '../components/Phone';
import { Seo } from '../components/Seo';
import { FAQ_GROUPS, SIDE_CLIPS } from '../data/content';

const HIGHLIGHT_QUESTIONS = FAQ_GROUPS.flatMap((group) => group.items).filter((item) => item.highlight);

const SIDES = [
  {
    to: '/trainers',
    eyebrow: 'For trainers',
    title: 'Run the business from your phone.',
    image: '/videos/app-trainer-side.jpg',
    imageAlt: 'Coach Connect trainer home screen',
    points: ['Roster, requests and client workspaces', 'Sessions your clients confirm in the app', 'Stripe payouts, no per-client fees'],
    cta: 'See the trainer side',
  },
  {
    to: '/clients',
    eyebrow: 'For clients',
    title: 'Your coach and your plan, together.',
    image: '/videos/app-client-side.jpg',
    imageAlt: 'Coach Connect client home screen',
    points: ['Find a trainer in the marketplace', 'Follow the plan and log meals with a scan', 'Free for clients. Pay your coach in the app'],
    cta: 'See the client side',
  },
];

/**
 * Section 2: the two sides of the app, one recording each, played once.
 * @returns {JSX.Element}
 */
function WhatItIs() {
  const [sideIndex, setSideIndex] = useState(0);
  const activeClip = SIDE_CLIPS[sideIndex];
  const playNextSide = () => sideIndex < SIDE_CLIPS.length - 1 && setSideIndex(sideIndex + 1);

  return (
    <section id="what-is" className="section" aria-labelledby="what-title">
      <div className="container what-grid">
        <div className="what-copy stack-5">
          <p className="label">What is Coach Connect</p>
          <h2 id="what-title" className="h-section">
            One app. A trainer on one side, a client on the other.
          </h2>
          <p className="lead">
            Trainers run their roster, plans, sessions and payouts from it. Clients find their coach, follow the plan, log food and
            check in. Both sides see the same plan, so nobody is copying workouts into a group chat.
          </p>
          <div className="segmented" role="group" aria-label="Which side of the app is playing">
            {SIDE_CLIPS.map((clip, clipIndex) => (
              <button
                key={clip.id}
                type="button"
                className="segmented-option"
                aria-pressed={clipIndex === sideIndex}
                onClick={() => setSideIndex(clipIndex)}
              >
                {clip.label}
              </button>
            ))}
          </div>
          <p className="body muted" aria-live="polite">
            {activeClip.caption}
          </p>
        </div>
        <div className="what-stage">
          <Phone clip={activeClip} onEnded={playNextSide} />
        </div>
      </div>
    </section>
  );
}

/**
 * Section 3: two doors, one per audience.
 * @returns {JSX.Element}
 */
function PickYourSide() {
  return (
    <section className="section" aria-labelledby="sides-title">
      <div className="container stack-7">
        <h2 id="sides-title" className="h-section sides-title">
          Pick your side.
        </h2>
        <div className="sides-grid">
          {SIDES.map((side) => (
            <Link key={side.to} to={side.to} className="card side-card">
              <div className="side-card-media">
                <img src={side.image} alt={side.imageAlt} loading="lazy" width="540" height="1094" />
              </div>
              <div className="side-card-body stack-4">
                <p className="label">{side.eyebrow}</p>
                <h3 className="h-card">{side.title}</h3>
                <ul className="check-list">
                  {side.points.map((point) => (
                    <li key={point}>
                      <CheckIcon />
                      {point}
                    </li>
                  ))}
                </ul>
                <span className="link link-arrow side-card-cta">
                  {side.cta}
                  <ArrowRightIcon />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Section 4: the four questions people ask first.
 * @returns {JSX.Element}
 */
function QuestionHighlights() {
  return (
    <section className="section" aria-labelledby="faq-title">
      <div className="container faq-split">
        <div className="stack-5">
          <h2 id="faq-title" className="h-section">
            Before you ask.
          </h2>
          <p className="body muted">Launch date, price, fees and what the AI actually does.</p>
          <Link to="/faq" className="link link-arrow">
            All questions
            <ArrowRightIcon />
          </Link>
        </div>
        <Accordion items={HIGHLIGHT_QUESTIONS} />
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

      {/* 1. Hero: matches the first site's hero (phone, 3D logo, watch) */}
      <HomeHero />

      <WhatItIs />
      <PickYourSide />
      <QuestionHighlights />
      <JoinSection />
    </Layout>
  );
}
