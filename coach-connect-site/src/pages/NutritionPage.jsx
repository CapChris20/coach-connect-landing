// NutritionPage.jsx — "/nutrition". One question: how does food logging work?
// Sections: head · three ways to log (one phone, step tabs above it) ·
// why the numbers hold up · waitlist.
import { useState } from 'react';
import { JoinSection } from '../components/JoinSection';
import { Layout } from '../components/Layout';
import { PageHead } from '../components/PageHead';
import { Phone } from '../components/Phone';
import { Seo } from '../components/Seo';
import { NUTRITION_METHODS } from '../data/content';

const TRUST_POINTS = [
  { title: 'Cross-checked numbers', text: 'Nutrition data is cross-checked across multiple food databases, not taken from a single source.' },
  { title: 'Your coach sees it', text: 'Trainers get a read-only view of what you log, inside your client workspace.' },
  { title: 'Or just say it', text: 'Tell AI Coach what you ate. It drafts the entry and asks before saving.' },
  { title: 'Targets for your goal', text: 'Daily calorie and macro targets, with totals that update as you log.' },
];

/**
 * Three logging methods, one phone. Picking a step swaps the clip; each clip
 * plays once and hands over to the next.
 * @returns {JSX.Element}
 */
function LoggingMethods() {
  const [methodIndex, setMethodIndex] = useState(0);
  const activeMethod = NUTRITION_METHODS[methodIndex];
  const playNextMethod = () => methodIndex < NUTRITION_METHODS.length - 1 && setMethodIndex(methodIndex + 1);

  return (
    <section className="section" aria-labelledby="methods-title">
      <div className="container stack-7">
        <h2 id="methods-title" className="h-section methods-title">
          Three ways in. All of them fast.
        </h2>
        <ol className="methods-steps">
          {NUTRITION_METHODS.map((method, index) => (
            <li key={method.id}>
              <button type="button" className="method-step" aria-current={index === methodIndex ? 'step' : undefined} onClick={() => setMethodIndex(index)}>
                <span className="label num">{method.step}</span>
                <span className="h-card">{method.title}</span>
                <span className="body muted">{method.text}</span>
              </button>
            </li>
          ))}
        </ol>
        <div className="methods-stage">
          <Phone clip={activeMethod} onEnded={playNextMethod} />
          <p className="label" aria-live="polite">
            Real app recording: {activeMethod.title}
          </p>
        </div>
      </div>
    </section>
  );
}

/**
 * @returns {JSX.Element}
 */
export default function NutritionPage() {
  return (
    <Layout>
      <Seo
        title="Nutrition: Coach Connect"
        description="Log food with a barcode scan, food search or AI Coach. Calories and macros add up against your targets, and your coach sees it read-only."
      />
      <PageHead
        label="Nutrition"
        title="Food logging people actually finish."
        lead="Scanning a barcode takes a couple of seconds. Searching takes a few more. Your coach sees the result without asking for screenshots."
      />
      <LoggingMethods />

      <section className="section" aria-labelledby="trust-title">
        <div className="container trust-grid">
          <h2 id="trust-title" className="h-section">
            Numbers worth coaching from.
          </h2>
          <ul className="trust-list">
            {TRUST_POINTS.map((point) => (
              <li key={point.title} className="trust-item">
                <h3 className="h-card">{point.title}</h3>
                <p className="body muted">{point.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <JoinSection defaultRole="client" />
    </Layout>
  );
}
