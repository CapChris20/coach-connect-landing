// StepsScene.jsx — four steps with oversized numerals in a staggered layout.
// A toggle swaps client and trainer steps; each side has its own card fill.
// The toggle is the only thing that moves. Used by: /how-it-works.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CLIENT_STEPS, TRAINER_STEPS } from '../data/content';
import { ArrowRightIcon } from './Icons';

const TRACKS = {
  client: { label: 'I train', steps: CLIENT_STEPS },
  trainer: { label: 'I coach', steps: TRAINER_STEPS },
};

/**
 * @param {{ showLink?: boolean, title?: string }} props
 * @returns {JSX.Element}
 */
export function StepsScene({ showLink = true, title = 'Four steps, either side.' }) {
  const [trackId, setTrackId] = useState('client');
  // The cards only animate after a switch, never on page load.
  const [hasSwitched, setHasSwitched] = useState(false);
  const track = TRACKS[trackId];

  return (
    <section className="scene scene-dark steps" aria-labelledby="steps-title">
      <div className="container stack-8">
        <div className="steps-head">
          <h2 id="steps-title" className="t-title">
            {title}
          </h2>
          <div className="toggle" role="group" aria-label="Whose steps to show">
            {Object.entries(TRACKS).map(([id, option]) => (
              <button key={id} type="button" className="toggle-option" aria-pressed={id === trackId} onClick={() => {
                  setTrackId(id);
                  setHasSwitched(true);
                }}>
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <ol className={`steps-grid steps-${trackId} ${hasSwitched ? 'is-switching' : ''}`} aria-live="polite">
          {track.steps.map((step, stepIndex) => (
            <li key={`${trackId}-${step.title}`} className="step-card">
              <span className="t-numeral step-num" aria-hidden="true">
                {stepIndex + 1}
              </span>
              <div className="stack-3">
                <h3 className="t-card">{step.title}</h3>
                <p className="body">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
        {showLink && (
          <Link to="/how-it-works" className="link">
            The full walkthrough
            <ArrowRightIcon />
          </Link>
        )}
      </div>
    </section>
  );
}
