// NavBar — the fixed top bar: logo on the left, page links in the middle, CTA on the right.
// Flow: render once above the page. "For trainers" / "For clients" are real pages
// (React Router links); the rest glide to landing sections — from another page they
// first route home with the hash attached, and Landing glides on arrival
// (see ui/scrollToHash.js and the hash effect in pages/Landing.jsx).
// Used by: pages/Landing.jsx and ui/PlaceholderPage.jsx. The logo lockup lives in ui/Wordmark.jsx.

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Wordmark } from '../ui/Wordmark';
import { scrollToHash } from '../ui/scrollToHash';

// ===== NAMED CONSTANTS =====

// Manipulate here: the link list, in the owner's order. A link gets either a
// routePath (its own page) or a sectionHash (a landing section to glide to).
// Account and Contact us still point at the finale/waitlist until real
// destinations exist — one-line change here when they do.
const NAV_BAR_LINKS = [
  { label: 'Home', sectionHash: '#act-arrival', testId: 'nav-home' },
  { label: 'Account', sectionHash: '#act-finale', testId: 'nav-account' },
  { label: 'For trainers', routePath: '/for-trainers', testId: 'nav-trainers' },
  { label: 'For clients', routePath: '/for-clients', testId: 'nav-clients' },
  { label: 'FAQs', sectionHash: '#act-faqs', testId: 'nav-faqs' },
  { label: 'Contact us', sectionHash: '#act-finale', testId: 'nav-contact' },
];

// ===== MAIN FUNCTION =====

/**
 * The fixed top navigation bar.
 * @returns {JSX.Element}
 */
export function NavBar() {
  const currentLocation = useLocation();
  const navigateToPage = useNavigate();

  /**
   * One click on a section link, from anywhere on the site.
   * @param {Event} clickEvent - the click (kept so we can stop the instant jump)
   * @param {string} sectionHash - the landing section to end up at
   * @returns {void}
   */
  const handleSectionLinkClick = (clickEvent, sectionHash) => {
    // 1. Not on the landing page? Route home with the hash attached —
    // Landing's hash effect glides to the section once it renders.
    if (currentLocation.pathname !== '/') {
      clickEvent.preventDefault();
      navigateToPage(`/${sectionHash}`);
      return;
    }

    // 2. Already home: glide straight to the section.
    scrollToHash(clickEvent, sectionHash);
  };

  return (
    <nav
      className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.08] bg-[#0A0A0F]/55 backdrop-blur-xl"
      data-testid="nav"
    >
      {/* Three zones with air between them: logo left, links centered, CTA right.
          The links only appear at lg and up — below that they crowd the bar,
          and the page is one scroll so nothing is lost by hiding them. */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <a href="/#act-arrival" onClick={(e) => handleSectionLinkClick(e, '#act-arrival')} data-testid="nav-logo">
          <Wordmark size="nav" stacked={false} />
        </a>

        <div className="hidden items-center gap-9 text-[13px] tracking-wide text-white/65 lg:flex">
          {NAV_BAR_LINKS.map((navLink) =>
            navLink.routePath ? (
              <Link
                key={navLink.testId}
                to={navLink.routePath}
                className="whitespace-nowrap transition-colors hover:text-white"
                data-testid={navLink.testId}
              >
                {navLink.label}
              </Link>
            ) : (
              <a
                key={navLink.testId}
                href={`/${navLink.sectionHash}`}
                onClick={(e) => handleSectionLinkClick(e, navLink.sectionHash)}
                className="whitespace-nowrap transition-colors hover:text-white"
                data-testid={navLink.testId}
              >
                {navLink.label}
              </a>
            ),
          )}
        </div>

        <a href="/#act-finale" onClick={(e) => handleSectionLinkClick(e, '#act-finale')} className="cta-primary !px-5 !py-2.5 text-sm" data-testid="nav-cta">
          Get Started
        </a>
      </div>
    </nav>
  );
}
