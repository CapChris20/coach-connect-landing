// FeatureExplorer.jsx — a numbered feature list beside one phone.
// Flow: the first feature plays when the phone scrolls into view → each clip
// that finishes moves the highlight to the next feature → after the last one
// it stops (plays once, DESIGN.md section 9). Clicking a feature jumps to it.
// Used by: /trainers and /clients (the one "product demo" moment on each).
import { useState } from 'react';
import { Phone } from './Phone';

/**
 * @param {Object} props
 * @param {Array<{ id: string, title: string, text: string, src: string }>} props.features
 * @param {string} props.listLabel - what a screen reader hears for the list
 * @returns {JSX.Element}
 */
export function FeatureExplorer({ features, listLabel }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const activeFeature = features[activeIndex];

  // Advance once through the list, then rest on the last clip.
  const goToNextFeature = () => {
    if (activeIndex >= features.length - 1) return;
    setProgress(0);
    setActiveIndex(activeIndex + 1);
  };

  const chooseFeature = (featureIndex) => {
    setProgress(0);
    setActiveIndex(featureIndex);
  };

  return (
    <div className="explorer">
      <ol className="explorer-list" aria-label={listLabel}>
        {features.map((feature, featureIndex) => {
          const isActive = featureIndex === activeIndex;
          return (
            <li key={feature.id}>
              <button
                type="button"
                className="explorer-item"
                aria-current={isActive ? 'step' : undefined}
                onClick={() => chooseFeature(featureIndex)}
              >
                <span className="explorer-num label num">{String(featureIndex + 1).padStart(2, '0')}</span>
                <span className="explorer-copy">
                  <span className="explorer-title">{feature.title}</span>
                  <span className="explorer-text">{feature.text}</span>
                </span>
                {/* vocab: scaleX on a full-width bar = a progress line that only animates transform */}
                <span className="explorer-progress" aria-hidden="true">
                  <span style={{ transform: `scaleX(${isActive ? progress : 0})` }} />
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="explorer-stage">
        <Phone clip={activeFeature} onEnded={goToNextFeature} onProgress={setProgress} />
        <p className="label explorer-caption" aria-live="polite">
          Real app recording: {activeFeature.title}
        </p>
      </div>
    </div>
  );
}
