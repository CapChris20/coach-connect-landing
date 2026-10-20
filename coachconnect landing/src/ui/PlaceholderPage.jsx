// PlaceholderPage — the shell for pages whose layout the owner hasn't
// dictated yet (/for-trainers, /for-clients today). It keeps the site's frame
// (aurora backdrop, nav bar) and parks one honest "under construction" card in
// the middle, so the routes exist and the nav/pills have somewhere real to go.
// When the owner hands over a page's layout, that page replaces this shell.
// Used by: pages/ForTrainers.jsx and pages/ForClients.jsx.

import { Link } from 'react-router-dom';
import { NavBar } from '../navbar/NavBar';

// ===== MAIN FUNCTION =====

/**
 * A framed "this page is coming" placeholder with waitlist and home exits.
 * @param {Object} props
 * @param {string} props.eyebrow - small pixel label above the title
 * @param {string} props.title - the page's headline
 * @param {string} props.body - one honest sentence about what's coming
 * @param {string} props.testId - data-testid for the page root
 * @returns {JSX.Element}
 */
export function PlaceholderPage({ eyebrow, title, body, testId }) {
  return (
    <div className="relative min-h-screen bg-void" data-testid={testId}>
      {/* 1. The same static gradient backdrop the landing page uses */}
      <div className="aurora-static" aria-hidden />

      <div className="relative z-10">
        <NavBar />

        {/* 2. The card, centered in what's left of the viewport under the nav */}
        <main className="mx-auto flex min-h-dvh w-full max-w-6xl items-center justify-center px-5 pb-16 pt-28">
          <div className="what-is-panel w-full max-w-xl rounded-[2rem] p-8 text-center sm:p-10">
            <p className="mb-4 font-pixel text-[0.6rem] uppercase leading-relaxed text-purple">{eyebrow}</p>
            <h1 className="font-display text-3xl font-semibold leading-snug text-white sm:text-4xl">{title}</h1>
            <p className="mt-4 leading-relaxed text-white/60">{body}</p>

            {/* 3. Exits: the waitlist (where conversion lives today) or home.
                The hash in the waitlist link is picked up by Landing's hash
                effect, which glides to the form on arrival. */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/#act-finale" className="cta-primary hero-action hero-action-primary">
                Join the waitlist
              </Link>
              <Link to="/" className="cta-ghost hero-action">
                Back to home
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
