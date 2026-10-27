// ClientsPage.jsx — "/clients". Sections: pink band (title, one line, button) ·
// the client tour on cream (numbered list + one phone) · three things a day
// (watch on orange) · the final call to action.
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
        tone="pink"
        title="Your coach, in your pocket."
        lead="Find a trainer, follow the plan they build for you, log meals with a barcode scan and message them in one place. The app is free. You pay your coach in the app."
      >
        <div className="row band-actions">
          <a href="#waitlist" className="btn btn-ink">
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

      <WatchScene tone="orange" />
      <JoinSection defaultRole="client" />
    </Layout>
  );
}
