// HowItWorksPage.jsx — "/how-it-works". Scenes: band on an orange field with the
// draggable 3D phone (interactive product) · staggered steps over Bauhaus shapes ·
// waitlist and beta on pink.
import { lazy, Suspense } from 'react';
import { JoinSection } from '../components/JoinSection';
import { Layout } from '../components/Layout';
import { PageBand } from '../components/PageBand';
import { Seo } from '../components/Seo';
import { StepsScene } from '../components/StepsScene';

const Phone3D = lazy(() => import('../components/Phone3D'));

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
      <PageBand
        tone="orange"
        title="Download to first session."
        lead="Same app for both sides. You pick Client or Trainer when you sign up, and the app shapes itself around that choice."
        aside={
          <figure className="phone3d-figure">
            <Suspense fallback={<div className="phone3d" aria-hidden="true" />}>
              <Phone3D src="videos/app-client-side.mp4" poster="videos/app-client-side.jpg" />
            </Suspense>
            <figcaption className="mono">Drag to turn. Client home, recorded in the app.</figcaption>
          </figure>
        }
      >
        <div className="row band-actions">
          <a href="#waitlist" className="btn btn-ink">
            Join the waitlist
          </a>
        </div>
      </PageBand>
      <StepsScene showLink={false} title="Four steps." />
      <JoinSection
        title="Start on the beta."
        intro="Sign up below and your login works in the TestFlight beta right away. Or join the waitlist and we will email you when Coach Connect opens in late 2026."
      />
    </Layout>
  );
}
