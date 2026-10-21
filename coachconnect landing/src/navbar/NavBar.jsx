// NavBar — the fixed top bar: logo on the left, page links in the middle, CTA on the right.
// Flow: render once above the page → the bar starts translucent over the
// hero and deepens once the visitor scrolls → on phones/tablets the links
// live behind a menu button instead of disappearing. "For trainers" /
// "For clients" are real pages (React Router links); the rest glide to
// landing sections — from another page they first route home with the
// hash attached, and Landing glides on arrival (see ui/scrollToHash.js
// and the hash effect in pages/Landing.jsx). Link underlines, the
// scrolled deepening, and the gradient hairline live in index.css
// (.nav-link / .nav-bar-scrolled / .nav-gradient-line).
// Used by: pages/Landing.jsx and ui/PlaceholderPage.jsx. The logo lockup lives in ui/Wordmark.jsx.

import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
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
  { label: 'FAQs', routePath: '/faqs', testId: 'nav-faqs' },
  { label: 'Contact us', sectionHash: '#act-finale', testId: 'nav-contact' },
];

// ===== NAMED CONSTANTS =====

// Manipulate here: how far down (px) before the bar deepens from its
// over-the-hero translucency to the solid scrolled look.
const NAV_SCROLL_DEPTH_PX = 24;

// ===== MAIN FUNCTION =====

/**
 * The fixed top navigation bar.
 * @returns {JSX.Element}
 */
export function NavBar() {
  const currentLocation = useLocation();
  const navigateToPage = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasScrolledPastHeroTop, setHasScrolledPastHeroTop] = useState(false);

  // The bar deepens once the page moves under it. Lenis scrolls the real
  // window, so a plain scroll listener hears it on wheel and touch alike.
  // vocab: passive = "I will never block this scroll" — the browser may
  // keep gliding without waiting for this listener to finish.
  useEffect(() => {
    const handleWindowScroll = () => {
      setHasScrolledPastHeroTop(window.scrollY > NAV_SCROLL_DEPTH_PX);
    };
    handleWindowScroll();
    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleWindowScroll);
  }, []);

  // Landing on a new page with the menu open should never strand it open.
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentLocation.pathname]);

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

  // One link, two homes: the desktop row and the mobile panel share
  // this renderer so a link can never exist in one and not the other.
  const renderNavLink = (navLink, linkClassName, testIdSuffix = '') => {
    if (navLink.routePath) {
      return (
        <Link
          key={navLink.testId}
          to={navLink.routePath}
          className={linkClassName}
          data-testid={`${navLink.testId}${testIdSuffix}`}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          {navLink.label}
        </Link>
      );
    }
    return (
      <a
        key={navLink.testId}
        href={`/${navLink.sectionHash}`}
        onClick={(clickEvent) => {
          setIsMobileMenuOpen(false);
          handleSectionLinkClick(clickEvent, navLink.sectionHash);
        }}
        className={linkClassName}
        data-testid={`${navLink.testId}${testIdSuffix}`}
      >
        {navLink.label}
      </a>
    );
  };

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 border-b border-white/[0.08] bg-[#0A0A0F]/60 backdrop-blur-xl transition-[background-color,box-shadow] duration-300 ${hasScrolledPastHeroTop ? 'nav-bar-scrolled' : ''}`}
      data-testid="nav"
    >
      {/* Three zones with air between them: logo left, links centered, CTA right.
          Links wear font-mono (Space Mono): they used to inherit the pixel
          face from the body default, and that top-row font got flagged in
          review as unreadable — mono is the clean swap until a brand font
          is picked. Below lg the row is replaced by a menu button (right,
          beside the CTA) opening the panel under the bar: the links must
          exist on phones too, not just be hidden. */}
      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5 sm:gap-6 sm:px-6">
        <a
          href="/#act-arrival"
          onClick={(e) => handleSectionLinkClick(e, '#act-arrival')}
          className="py-1"
          data-testid="nav-logo"
          aria-label="Coach Connect — back to the top"
        >
          <Wordmark size="nav" stacked={false} />
        </a>

        <div className="hidden items-center gap-9 font-mono text-[13px] tracking-wide text-white/65 lg:flex">
          {NAV_BAR_LINKS.map((navLink) => renderNavLink(navLink, 'nav-link whitespace-nowrap transition-colors hover:text-white'))}
        </div>

        <div className="flex items-center gap-2.5">
          <a href="/#act-finale" onClick={(e) => handleSectionLinkClick(e, '#act-finale')} className="cta-primary !px-5 !py-2.5 text-sm" data-testid="nav-cta">
            Get Started
          </a>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] text-white transition-colors hover:border-white/25 lg:hidden"
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? 'Close the menu' : 'Open the menu'}
            data-testid="nav-menu-button"
            onClick={() => setIsMobileMenuOpen((menuWasOpen) => !menuWasOpen)}
          >
            {isMobileMenuOpen ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* The mobile panel: the same six links, stacked thumb-sized under
          the bar, plus the CTA repeated full-width at the bottom. */}
      {isMobileMenuOpen && (
        <div
          className="mx-3 mb-3 rounded-3xl border border-white/10 bg-[#0c0c13]/95 p-2.5 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.8)] backdrop-blur-2xl lg:hidden"
          data-testid="nav-mobile-menu"
        >
          {NAV_BAR_LINKS.map((navLink) =>
            renderNavLink(
              navLink,
              'block rounded-2xl px-4 py-3 font-display text-sm font-semibold text-white/80 transition-colors hover:bg-white/[0.05] hover:text-white',
              '-mobile',
            ),
          )}
          <a
            href="/#act-finale"
            onClick={(clickEvent) => {
              setIsMobileMenuOpen(false);
              handleSectionLinkClick(clickEvent, '#act-finale');
            }}
            className="cta-primary hero-action hero-action-primary mt-2 w-full"
            data-testid="nav-cta-mobile"
          >
            Get Started
          </a>
        </div>
      )}

      {/* The signature hairline: brand gradient along the bar's bottom edge */}
      <span className="nav-gradient-line" aria-hidden="true" />
    </nav>
  );
}
