// NavigationBar.jsx
// The top navigation bar with logo, page links, and Get Started button.

import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { CoachConnectTextLogo } from './CoachConnectTextLogo';
import { scrollToHash } from '../app-settings-and-helpers/smoothScrollHelper';
import './navigation.css';

// Menu links shown on the navigation bar
const NAV_BAR_LINKS = [
  { label: 'Home', sectionHash: '#act-arrival', testId: 'nav-home' },
  { label: 'Account', sectionHash: '#act-finale', testId: 'nav-account' },
  { label: 'For trainers', routePath: '/for-trainers', testId: 'nav-trainers' },
  { label: 'For clients', routePath: '/for-clients', testId: 'nav-clients' },
  { label: 'FAQs', routePath: '/faqs', testId: 'nav-faqs' },
  { label: 'Contact us', sectionHash: '#act-finale', testId: 'nav-contact' },
];

const SCROLL_THRESHOLD_PX = 24;

export function NavigationBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  // Deepen navbar background color when user scrolls down
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > SCROLL_THRESHOLD_PX);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when changing pages
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle smooth scrolling or navigation for section links
  const handleLinkClick = (event, sectionHash) => {
    if (location.pathname !== '/') {
      event.preventDefault();
      navigate(`/${sectionHash}`);
      return;
    }
    scrollToHash(event, sectionHash);
  };

  const renderLink = (linkItem, className, testIdSuffix = '') => {
    if (linkItem.routePath) {
      return (
        <Link
          key={linkItem.testId}
          to={linkItem.routePath}
          className={className}
          data-testid={`${linkItem.testId}${testIdSuffix}`}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          {linkItem.label}
        </Link>
      );
    }

    return (
      <a
        key={linkItem.testId}
        href={`/${linkItem.sectionHash}`}
        onClick={(e) => {
          setIsMobileMenuOpen(false);
          handleLinkClick(e, linkItem.sectionHash);
        }}
        className={className}
        data-testid={`${linkItem.testId}${testIdSuffix}`}
      >
        {linkItem.label}
      </a>
    );
  };

  return (
    <nav
      className={`site-navbar ${hasScrolled ? 'scrolled' : ''}`}
      data-testid="nav"
    >
      <div className="site-navbar-container">
        {/* Left: Logo */}
        <a
          href="/#act-arrival"
          onClick={(e) => handleLinkClick(e, '#act-arrival')}
          className="site-navbar-logo-link"
          data-testid="nav-logo"
          aria-label="Coach Connect — back to top"
        >
          <CoachConnectTextLogo size="nav" stacked={false} />
        </a>

        {/* Center: Desktop links */}
        <div className="site-navbar-links-desktop">
          {NAV_BAR_LINKS.map((link) =>
            renderLink(link, 'site-navbar-link-item')
          )}
        </div>

        {/* Right: CTA button & Mobile Hamburger */}
        <div className="site-navbar-actions">
          <a
            href="/#act-finale"
            onClick={(e) => handleLinkClick(e, '#act-finale')}
            className="cta-primary site-navbar-cta-button"
            data-testid="nav-cta"
          >
            Get Started
          </a>

          <button
            type="button"
            className="site-navbar-mobile-toggle"
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            data-testid="nav-menu-button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="site-navbar-mobile-menu" data-testid="nav-mobile-menu">
          {NAV_BAR_LINKS.map((link) =>
            renderLink(link, 'site-navbar-mobile-link', '-mobile')
          )}
          <a
            href="/#act-finale"
            onClick={(e) => {
              setIsMobileMenuOpen(false);
              handleLinkClick(e, '#act-finale');
            }}
            className="cta-primary hero-action hero-action-primary site-navbar-mobile-cta"
            data-testid="nav-cta-mobile"
          >
            Get Started
          </a>
        </div>
      )}

      {/* Gradient hairline line along bottom edge */}
      <span className="nav-gradient-line" aria-hidden="true" />
    </nav>
  );
}

// Backward-compatible alias
export { NavigationBar as NavBar };
