// JoinSection.jsx — the closing call to action on every page (id="waitlist",
// which the nav button jumps to). One gradient-rim card: the signup form.
// Beside it, plain text and the TestFlight link for people who want in today.
// `visual` lets the homepage put the 3D logo here; other pages pass nothing.
import { TESTFLIGHT_URL } from '../data/content';
import { WaitlistForm } from '../waitlist/WaitlistForm';
import { AppleIcon, ArrowRightIcon } from './Icons';

/**
 * @param {{ title?: string, intro?: string, visual?: React.ReactNode, defaultRole?: 'trainer' | 'client' }} props
 * @returns {JSX.Element}
 */
export function JoinSection({
  title = 'Be there on day one.',
  intro = 'Join the waitlist and your Coach Connect login is created now. Founding trainers and their clients get in first when we open in late 2026.',
  visual = null,
  defaultRole = 'trainer',
}) {
  return (
    <section id="waitlist" className="section join" aria-labelledby="join-title">
      <div className="container join-grid">
        <div className="join-copy stack-5">
          {visual}
          <h2 id="join-title" className="h-section">
            {title}
          </h2>
          <p className="lead">{intro}</p>
          <hr className="rule join-rule" />
          <div className="stack-3">
            <p className="label">Live now: iOS beta</p>
            <p className="body">
              The app is already on iPhones through Apple TestFlight. Sign up here, install the beta, then sign in with the same
              email. About two minutes.
            </p>
            <a className="link link-arrow" href={TESTFLIGHT_URL} target="_blank" rel="noreferrer">
              <AppleIcon />
              Get the beta on TestFlight
              <ArrowRightIcon />
            </a>
          </div>
        </div>
        <div className="card-hero join-card">
          <WaitlistForm defaultRole={defaultRole} />
        </div>
      </div>
    </section>
  );
}
