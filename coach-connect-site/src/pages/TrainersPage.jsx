// TrainersPage.jsx — "/trainers". One question: what does a trainer get, and for how much?
// Sections: head · the feature tour (real recordings) · pricing · waitlist.
import { CheckIcon } from '../components/Icons';
import { FeatureExplorer } from '../components/FeatureExplorer';
import { JoinSection } from '../components/JoinSection';
import { Layout } from '../components/Layout';
import { PageHead } from '../components/PageHead';
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
      <PageHead
        label="For trainers"
        title="Stop running your business out of five apps."
        lead="Your roster, plans, sessions, files, weekly reports and payouts live in Coach Connect. Your clients use the same app, so what you assign is what they see."
      >
        <div className="row">
          <a href="#waitlist" className="btn btn-primary">
            Join as a founding trainer
          </a>
          <a href="#pricing" className="link">
            See pricing
          </a>
        </div>
      </PageHead>

      <section className="section" aria-labelledby="tour-title">
        <div className="container stack-7">
          <div className="stack-4">
            <h2 id="tour-title" className="h-section">
              A tour of the trainer side.
            </h2>
            <p className="body muted">Every clip is a real recording from the app. Pick a feature to jump to it.</p>
          </div>
          <FeatureExplorer features={TRAINER_FEATURES} listLabel="Trainer features" />
        </div>
      </section>

      <section id="pricing" className="section" aria-labelledby="pricing-title">
        <div className="container pricing-grid">
          <div className="stack-5">
            <h2 id="pricing-title" className="h-section">
              One price. Your whole roster.
            </h2>
            <p className="lead">Five clients or fifty, the subscription stays the same. Clients use the app for free.</p>
            <p className="body muted">{PRICING.fineprint}</p>
          </div>
          <div className="card price-card">
            <p className="label">{PRICING.name}</p>
            <p className="price">
              <span className="price-amount num">{PRICING.monthly}</span>
              <span className="price-unit">a month</span>
            </p>
            <p className="body muted">
              Or <strong className="price-strong num">{PRICING.annualMonthly}</strong> a month billed yearly at {PRICING.annualTotal}. Saves{' '}
              {PRICING.annualSaving} a year.
            </p>
            <hr className="rule" />
            <ul className="check-list">
              {PRICING.includes.map((includedItem) => (
                <li key={includedItem}>
                  <CheckIcon />
                  {includedItem}
                </li>
              ))}
            </ul>
            <a href="#waitlist" className="btn btn-secondary">
              Start with a 3-day free trial
            </a>
          </div>
        </div>
      </section>

      <JoinSection title="Founding trainers get in first." />
    </Layout>
  );
}
