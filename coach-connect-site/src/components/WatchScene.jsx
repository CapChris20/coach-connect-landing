// WatchScene.jsx — "Three things a day": title across the top, then the watch
// (left) and the three daily loops as huge numerals (right), on a flat colour
// field. Used by: /clients.
import { Kinetic } from './Kinetic';
import { Watch } from './Watch';
import '../styles/watch.css';

const DAILY_LOOPS = [
  { name: 'Train', text: 'The workout your coach set for today, logged as you go.' },
  { name: 'Meals', text: 'Scan a barcode, search, or ask AI Coach to log it for you.' },
  { name: 'Water', text: 'A tap per glass, part of the 30-second check-in.' },
];

/**
 * @param {{ tone?: 'orange' | 'pink' }} props
 * @returns {JSX.Element}
 */
export function WatchScene({ tone = 'orange' }) {
  return (
    <section className={`scene scene-${tone} loops`} aria-labelledby="loops-title">
      <div className="container loops-grid">
        <Kinetic id="loops-title" className="t-title loops-title" text="Three things a day." />
        <figure className="loops-watch">
          <Watch faceTitle="Your day in Coach Connect" />
          <figcaption className="row loops-caption">
            <span className="stamp">Example data</span>
            <span className="body">Tap the dots to change the band and case.</span>
          </figcaption>
        </figure>
        <div className="loops-copy">
          <ol className="loops-list">
            {DAILY_LOOPS.map((loop, loopIndex) => (
              <li key={loop.name} className="loops-row">
                <span className="t-numeral loops-num" aria-hidden="true">
                  {String(loopIndex + 1).padStart(2, '0')}
                </span>
                <div className="stack-2">
                  <h3 className="t-card">{loop.name}</h3>
                  <p className="body">{loop.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
