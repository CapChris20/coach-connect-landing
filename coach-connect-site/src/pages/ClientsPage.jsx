// ClientsPage.jsx — "/clients". One question: what does a client get?
// Sections: head · the feature tour (real recordings) · the daily loops (watch) · waitlist.
import { Link } from 'react-router-dom';
import { FeatureExplorer } from '../components/FeatureExplorer';
import { ArrowRightIcon } from '../components/Icons';
import { JoinSection } from '../components/JoinSection';
import { Layout } from '../components/Layout';
import { PageHead } from '../components/PageHead';
import { Seo } from '../components/Seo';
import { Watch } from '../components/Watch';
import { CLIENT_FEATURES } from '../data/content';
import '../styles/watch.css';

const DAILY_LOOPS = [
  { name: 'Train', text: 'The workout your coach set for today, logged as you go.' },
  { name: 'Meals', text: 'Scan, search or ask AI Coach to log it for you.' },
  { name: 'Water', text: 'A tap per glass, part of the 30-second check-in.' },
];

/**
 * @returns {JSX.Element}
 */
export default function ClientsPage() {
  return (
    <Layout>
      <Seo
        title="For clients: Coach Connect"
        description="Find a trainer, follow their plan, log meals with a barcode scan, check in daily and pay your coach in the app. Free for clients."
      />
      <PageHead
        label="For clients"
        title="Your coach, in your pocket."
        lead="Find a trainer, follow the plan they build for you, log meals with a barcode scan and message them in one place. The app is free. You pay your coach in the app."
      >
        <div className="row">
          <a href="#waitlist" className="btn btn-primary">
            Join the waitlist
          </a>
          <Link to="/nutrition" className="link">
            How food logging works
          </Link>
        </div>
      </PageHead>

      <section className="section" aria-labelledby="tour-title">
        <div className="container stack-7">
          <div className="stack-4">
            <h2 id="tour-title" className="h-section">
              A tour of the client side.
            </h2>
            <p className="body muted">Every clip is a real recording from the app. Pick a feature to jump to it.</p>
          </div>
          <FeatureExplorer features={CLIENT_FEATURES} listLabel="Client features" />
        </div>
      </section>

      <section className="section" aria-labelledby="loops-title">
        <div className="container loops-grid">
          <div className="stack-5">
            <h2 id="loops-title" className="h-section">
              Three things a day. That is the whole job.
            </h2>
            <p className="lead">Your coach handles the plan. You close three loops, and they see every one.</p>
            <dl className="loops-list">
              {DAILY_LOOPS.map((loop) => (
                <div key={loop.name} className="loops-row">
                  <dt className="h-card">{loop.name}</dt>
                  <dd className="body muted">{loop.text}</dd>
                </div>
              ))}
            </dl>
            <Link to="/how-it-works" className="link link-arrow">
              How to get started
              <ArrowRightIcon />
            </Link>
          </div>
          <figure className="loops-watch">
            <Watch />
            <figcaption className="label">Example data. Tap the dots to change the band and case.</figcaption>
          </figure>
        </div>
      </section>

      <JoinSection defaultRole="client" />
    </Layout>
  );
}
