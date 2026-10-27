// NutritionPage.jsx — "/nutrition". Sections: band over a still halftone dot
// field · three ways to log on cream (step numerals, one phone) · why the
// numbers hold up on orange · the final call to action.
import { useState } from 'react';
import { JoinSection } from '../components/JoinSection';
import { Layout } from '../components/Layout';
import { PageBand } from '../components/PageBand';
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
 * Three logging methods, one phone. Picking a step swaps the clip.
 * @returns {JSX.Element}
 */
function LoggingMethods() {
  const [methodIndex, setMethodIndex] = useState(0);
  const activeMethod = NUTRITION_METHODS[methodIndex];
  // One pass through the three methods, then it rests on the last one.
  const playNextMethod = () => methodIndex < NUTRITION_METHODS.length - 1 && setMethodIndex(methodIndex + 1);

  return (
    <section className="scene scene-paper methods" aria-labelledby="methods-title">
      <div className="container methods-grid">
        <div className="stack-7">
          <h2 id="methods-title" className="t-title">
            Three ways in.
          </h2>
          <ol className="methods-steps">
            {NUTRITION_METHODS.map((method, index) => (
              <li key={method.id}>
                <button type="button" className="method-step" aria-current={index === methodIndex ? 'step' : undefined} onClick={() => setMethodIndex(index)}>
                  <span className="t-numeral method-num" aria-hidden="true">
                    {method.step}
                  </span>
                  <span className="stack-2">
                    <span className="t-card method-title">{method.title}</span>
                    <span className="body method-text">{method.text}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
        <div className="methods-stage">
          <Phone clip={activeMethod} onEnded={playNextMethod} className="phone-xl" />
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
      <PageBand
        title="Food logging people finish."
        lead="Scanning a barcode takes a couple of seconds. Searching takes a few more. Your coach sees the result without asking for screenshots."
        background={<div className="bg-layer halftone" aria-hidden="true" />}
      />
      <LoggingMethods />

      <section className="scene scene-orange trust" aria-labelledby="trust-title">
        <div className="container trust-grid">
          <h2 id="trust-title" className="t-title">
            Numbers worth coaching from.
          </h2>
          <ol className="trust-list">
            {TRUST_POINTS.map((point, pointIndex) => (
              <li key={point.title} className="trust-item">
                <span className="t-numeral trust-num" aria-hidden="true">
                  {pointIndex + 1}
                </span>
                <div className="stack-2">
                  <h3 className="t-card">{point.title}</h3>
                  <p className="body">{point.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <JoinSection defaultRole="client" />
    </Layout>
  );
}
