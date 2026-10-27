// FaqPage.jsx — "/faq". Scenes: band on a pink field, torn into paper · every
// question grouped on paper, big accordion type · waitlist on orange.
import { TornEdge } from '../backgrounds/TornEdge';
import { Accordion } from '../components/Accordion';
import { JoinSection } from '../components/JoinSection';
import { Layout } from '../components/Layout';
import { PageBand } from '../components/PageBand';
import { Seo } from '../components/Seo';
import { FAQ_GROUPS } from '../data/content';

/**
 * @returns {JSX.Element}
 */
export default function FaqPage() {
  return (
    <Layout>
      <Seo title="FAQ: Coach Connect" description="Launch date, pricing, payments, AI Coach and how the app works, answered from the current version of Coach Connect." />
      <div className="torn-host">
        <PageBand tone="pink" title="Questions, answered." lead="Written from the app as it works today. If something here changes, this page changes with it." />
        <TornEdge fills={['var(--orange)', 'var(--paper-2)', 'var(--paper)']} seed={23} />
      </div>

      <section className="scene scene-paper faq-page" aria-label="Questions by topic">
        <div className="container faq-layout">
          <nav className="faq-index" aria-label="Topics">
            <ul>
              {FAQ_GROUPS.map((group) => (
                <li key={group.id}>
                  <a className="link" href={`#${group.id}`}>
                    {group.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="faq-groups">
            {FAQ_GROUPS.map((group) => (
              <section key={group.id} id={group.id} className="faq-group" aria-labelledby={`${group.id}-title`}>
                <h2 id={`${group.id}-title`} className="t-h2">
                  {group.title}
                </h2>
                <Accordion items={group.items} size="lg" />
              </section>
            ))}
          </div>
        </div>
      </section>

      <JoinSection title="Still deciding? Try the beta." tone="orange" />
    </Layout>
  );
}
