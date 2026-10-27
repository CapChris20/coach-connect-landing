// TrainersPage.jsx — "/trainers". Scenes: band over isometric blocks (reads as
// analytics) · the trainer tour reel · pricing on paper with one poster tier ·
// waitlist on an orange field.
import { IsoBlocks } from '../backgrounds/IsoBlocks';
import { LazyMount } from '../backgrounds/plumbing';
import { JoinSection } from '../components/JoinSection';
import { Layout } from '../components/Layout';
import { PageBand } from '../components/PageBand';
import { Reel } from '../components/Reel';
import { Seo } from '../components/Seo';
import { PRICING, TRAINER_FEATURES } from '../data/content';

/**
 * @returns {JSX.Element}
 */
export default function TrainersPage() {
  return (
    <Layout>
      <Seo
        title="For trainers: Coach Connect"
        description="Roster, client workspaces, scheduling, documents, weekly reports and Stripe payouts in one app. $59.99 a month, no per-client fees."
      />
      <PageBand
        title="Run it from one app."
        lead="Your roster, plans, sessions, files, weekly reports and payouts live in Coach Connect. Your clients use the same app, so what you assign is what they see."
        background={
          <LazyMount>
            <IsoBlocks />
          </LazyMount>
        }
      >
        <div className="row band-actions">
          <a href="#waitlist" className="btn btn-primary">
            Join as a founding trainer
          </a>
          <a href="#pricing" className="link">
            See pricing
          </a>
        </div>
      </PageBand>

      <Reel scenes={TRAINER_FEATURES} label="Trainer tour" />

      <section id="pricing" className="scene scene-paper pricing" aria-labelledby="pricing-title">
        <div className="container pricing-grid">
          <div className="stack-6">
            <h2 id="pricing-title" className="t-title">
              One price. Whole roster.
            </h2>
            <p className="lead">Five clients or fifty, the subscription stays the same. Clients use the app for free.</p>
            <p className="body muted">{PRICING.fineprint}</p>
          </div>
          <div className="poster price-card" style={{ '--tilt': '-1.2deg' }}>
            <p className="mono">{PRICING.name}</p>
            <p className="price">
              <span className="t-numeral price-amount">{PRICING.monthly}</span>
              <span className="price-unit">a month</span>
            </p>
            <p className="body">
              Or <strong>{PRICING.annualMonthly} a month</strong> billed yearly at {PRICING.annualTotal}. Saves {PRICING.annualSaving} a year.
            </p>
            <ul className="price-list">
              {PRICING.includes.map((includedItem) => (
                <li key={includedItem}>{includedItem}</li>
              ))}
            </ul>
            <a href="#waitlist" className="btn btn-ink">
              Start with a 3-day free trial
            </a>
          </div>
        </div>
      </section>

      <JoinSection title="Founding trainers first." tone="orange" />
    </Layout>
  );
}
