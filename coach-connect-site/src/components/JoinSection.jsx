// JoinSection.jsx — the closing section on every page (id="waitlist", where the
// nav's Get Started lands): an aurora gradient behind a huge heading with the
// page's one gradient accent word, the TestFlight beta, and a solid form panel.
// The form's behaviour lives in waitlist/ and is unchanged.
import { TESTFLIGHT_URL } from '../data/content';
import { WaitlistForm } from '../waitlist/WaitlistForm';
import { AppleIcon, ArrowRightIcon } from './Icons';

/**
 * @param {{ title?: string, accent?: string, intro?: string, defaultRole?: 'trainer' | 'client' }} props
 *   title + accent: the heading reads "{title} {accent}", accent in the gradient.
 * @returns {JSX.Element}
 */
export function JoinSection({
  title = 'Be there on',
  accent = 'day one.',
  intro = 'Join the waitlist and your Coach Connect login is created now. Founding trainers and their clients get in first when we open in late 2026.',
  defaultRole = 'trainer',
}) {
  return (
    <section id="waitlist" className="scene join" aria-labelledby="join-title">
      <div className="container join-grid">
        <h2 id="join-title" className="t-cta join-title">
          {title} <span className="accent-word">{accent}</span>
        </h2>
        <div className="join-copy stack-6">
          <p className="lead">{intro}</p>
          <div className="join-beta stack-3">
            <p className="body">
              <strong>Want it today?</strong> The iOS beta is live on Apple TestFlight. Sign up here, install the beta, then sign in with
              the same email. About two minutes.
            </p>
            <a className="link" href={TESTFLIGHT_URL} target="_blank" rel="noreferrer">
              <AppleIcon />
              Get the beta on TestFlight
              <ArrowRightIcon />
            </a>
          </div>
        </div>
        <div className="panel join-panel">
          <WaitlistForm defaultRole={defaultRole} />
        </div>
      </div>
    </section>
  );
}
