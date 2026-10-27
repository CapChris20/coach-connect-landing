// ClientsPage.jsx — "/clients". Scenes: band with the split-flap board (a day
// of client life) · feature tour on paper (numbered list + oversized phone) ·
// three things a day (watch on a pink field) · waitlist on orange.
import { SplitFlap } from '../backgrounds/SplitFlap';
import { FeatureExplorer } from '../components/FeatureExplorer';
import { JoinSection } from '../components/JoinSection';
import { Layout } from '../components/Layout';
import { PageBand } from '../components/PageBand';
import { Seo } from '../components/Seo';
import { WatchScene } from '../components/WatchScene';
import { CLIENT_FEATURES } from '../data/content';

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
      <PageBand
        title="Your coach, in your pocket."
        lead="Find a trainer, follow the plan they build for you, log meals with a barcode scan and message them in one place. The app is free. You pay your coach in the app."
        aside={
          <figure className="board-figure">
            <SplitFlap />
            <figcaption className="mono muted">Example data</figcaption>
          </figure>
        }
      >
        <div className="row band-actions">
          <a href="#waitlist" className="btn btn-primary">
            Join the waitlist
          </a>
        </div>
      </PageBand>

      <section className="scene scene-paper" aria-labelledby="tour-title">
        <div className="container stack-8">
          <h2 id="tour-title" className="t-title">
            What you get.
          </h2>
          <FeatureExplorer features={CLIENT_FEATURES} listLabel="Client features" />
        </div>
      </section>

      <WatchScene tone="pink" />
      <JoinSection defaultRole="client" tone="orange" />
    </Layout>
  );
}
