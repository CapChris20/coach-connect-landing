// HowItWorksPage.jsx — "/how-it-works". One question: what are the steps?
// Sections: head with the 3D phone (this page's one hero piece, drag to turn) ·
// client and trainer steps side by side · waitlist and beta.
import { lazy, Suspense } from 'react';
import { JoinSection } from '../components/JoinSection';
import { Layout } from '../components/Layout';
import { PageHead } from '../components/PageHead';
import { Seo } from '../components/Seo';
import { CLIENT_STEPS, TRAINER_STEPS } from '../data/content';

const Phone3D = lazy(() => import('../components/Phone3D'));

const TRACKS = [
  { id: 'clients', title: 'If you train', steps: CLIENT_STEPS },
  { id: 'trainers', title: 'If you coach', steps: TRAINER_STEPS },
];

/**
 * @returns {JSX.Element}
 */
export default function HowItWorksPage() {
  return (
    <Layout>
      <Seo
        title="How it works: Coach Connect"
        description="Four steps for clients and four for trainers, from download to the first session and the first payment."
      />
      <PageHead
        label="How it works"
        title="From download to first session."
        lead="Same app for both sides. You pick Client or Trainer when you sign up, and the app shapes itself around that choice."
        aside={
          <figure className="phone3d-figure">
            <Suspense fallback={<div className="phone3d" aria-hidden="true" />}>
              <Phone3D src="/videos/app-client-side.mp4" poster="/videos/app-client-side.jpg" />
            </Suspense>
            <figcaption className="label">Drag to turn. Client home, recorded in the app.</figcaption>
          </figure>
        }
      >
        <a href="#waitlist" className="btn btn-primary">
          Join the waitlist
        </a>
      </PageHead>

      <section className="section" aria-labelledby="steps-title">
        <div className="container stack-7">
          <h2 id="steps-title" className="h-section">
            Four steps, either side.
          </h2>
          <div className="tracks">
            {TRACKS.map((track) => (
              <div key={track.id} className="track">
                <h3 className="h-card track-title">{track.title}</h3>
                <ol className="track-steps">
                  {track.steps.map((step, stepIndex) => (
                    <li key={step.title} className="track-step">
                      <span className="track-num num" aria-hidden="true">
                        {stepIndex + 1}
                      </span>
                      <div className="stack-2">
                        <p className="track-step-title">{step.title}</p>
                        <p className="body muted">{step.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </section>

      <JoinSection title="Start today on the beta." intro="Sign up below and your login works in the TestFlight beta right away. Or join the waitlist and we will email you when Coach Connect opens in late 2026." />
    </Layout>
  );
}
