// FaqPage.jsx — "/faq". Every question, grouped. A short group index on the
// left (sticky on desktop), the groups on the right. Closes with the waitlist.
import { Accordion } from '../components/Accordion';
import { JoinSection } from '../components/JoinSection';
import { Layout } from '../components/Layout';
import { PageHead } from '../components/PageHead';
import { Seo } from '../components/Seo';
import { FAQ_GROUPS } from '../data/content';

/**
 * @returns {JSX.Element}
 */
export default function FaqPage() {
  return (
    <Layout auroraTone="quiet">
      <Seo title="FAQ: Coach Connect" description="Launch date, pricing, payments, AI Coach and how the app works, answered from the current version of Coach Connect." />
      <PageHead label="FAQ" title="Questions, answered." lead="Written from the app as it works today. If something here changes, this page changes with it." />

      <section className="section faq-page" aria-label="Questions by topic">
        <div className="container faq-layout">
          <nav className="faq-index" aria-label="Topics">
            <p className="label">Topics</p>
            <ul className="stack-2">
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
                <h2 id={`${group.id}-title`} className="h-card faq-group-title">
                  {group.title}
                </h2>
                <Accordion items={group.items} />
              </section>
            ))}
          </div>
        </div>
      </section>

      <JoinSection title="Still deciding? Try the beta." />
    </Layout>
  );
}
