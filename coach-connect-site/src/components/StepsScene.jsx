// StepsScene.jsx — four steps with oversized numerals in a staggered layout,
// over big Bauhaus shapes that drift with scroll (DESIGN.md C2).
// A toggle swaps client and trainer steps; each side has its own card fill.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shapes } from '../backgrounds/Shapes';
import { CLIENT_STEPS, TRAINER_STEPS } from '../data/content';
import { ArrowRightIcon } from './Icons';

const TRACKS = {
  client: { label: 'I train', steps: CLIENT_STEPS },
  trainer: { label: 'I coach', steps: TRAINER_STEPS },
};

const STEP_SHAPES = [
  { kind: 'half', style: { width: '34vw', height: '17vw', left: '-6vw', top: '18%', background: 'var(--pink)' }, drift: 120, turn: -40 },
  { kind: 'triangle', style: { right: '4vw', top: '6%', borderBottomColor: 'var(--orange)', borderWidth: '0 11vw 19vw 11vw' }, drift: -100, turn: 140 },
  { kind: 'ring', style: { width: '18vw', height: '18vw', right: '18vw', bottom: '-4vw', borderColor: 'var(--orange)' }, drift: 80, slide: 90 },
];

/**
 * @param {{ showLink?: boolean, title?: string }} props
 * @returns {JSX.Element}
 */
export function StepsScene({ showLink = true, title = 'Four steps, either side.' }) {
  const [trackId, setTrackId] = useState('client');
  const track = TRACKS[trackId];

  return (
    <section className="scene scene-dark steps" aria-labelledby="steps-title">
      <Shapes shapes={STEP_SHAPES} />
      <div className="container stack-8">
        <div className="steps-head">
          <h2 id="steps-title" className="t-title">
            {title}
          </h2>
          <div className="toggle" role="group" aria-label="Whose steps to show">
            {Object.entries(TRACKS).map(([id, option]) => (
              <button key={id} type="button" className="toggle-option" aria-pressed={id === trackId} onClick={() => setTrackId(id)}>
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <ol className={`steps-grid steps-${trackId}`} aria-live="polite">
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
