// JoinSection.jsx — the closing scene on every page (id="waitlist", where the
// nav's Get Started lands). A full-bleed colour field, a huge heading, and a
// solid dark form panel with the role toggle. `tone` lets each page own a colour.
import { TESTFLIGHT_URL } from '../data/content';
import { WaitlistForm } from '../waitlist/WaitlistForm';
import { AppleIcon, ArrowRightIcon } from './Icons';
import { Kinetic } from './Kinetic';

/**
 * @param {{ title?: string, intro?: string, defaultRole?: 'trainer' | 'client', tone?: 'pink' | 'orange' }} props
 * @returns {JSX.Element}
 */
export function JoinSection({
  title = 'Be there on day one.',
  intro = 'Join the waitlist and your Coach Connect login is created now. Founding trainers and their clients get in first when we open in late 2026.',
  defaultRole = 'trainer',
  tone = 'pink',
}) {
  return (
    <section id="waitlist" className={`scene scene-${tone} join`} aria-labelledby="join-title">
      <div className="container join-grid">
        <Kinetic id="join-title" className="t-cta join-title" text={title} />
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
