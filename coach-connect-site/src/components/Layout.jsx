// Layout.jsx — the frame every page sits in: skip link, aurora backdrop,
// sticky glass nav, the page itself, footer.
// The nav is the one always-on glass element (DESIGN.md section 3).
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { NAV_LINKS } from '../data/content';
import { CloseIcon, MenuIcon } from './Icons';
import { Wordmark } from './Wordmark';

/**
 * Sticky top bar with the site's five pages and the waitlist jump.
 * On phones the links move into a sheet behind a Menu button.
 * @returns {JSX.Element}
 */
function SiteNav() {
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const { pathname } = useLocation();

  // A new page closes the sheet.
  useEffect(() => setMenuIsOpen(false), [pathname]);

  // Escape closes the sheet; the page behind stops scrolling while it is open.
  useEffect(() => {
    if (!menuIsOpen) return undefined;
    const closeOnEscape = (event) => event.key === 'Escape' && setMenuIsOpen(false);
    document.addEventListener('keydown', closeOnEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.style.overflow = '';
    };
  }, [menuIsOpen]);

  return (
    <header className="site-nav glass-bar">
      <div className="container site-nav-inner">
        <Link to="/" className="site-nav-home" aria-label="Coach Connect home">
          <Wordmark />
        </Link>

        <nav aria-label="Main" className="site-nav-links">
          {NAV_LINKS.map((navLink) => (
            <NavLink key={navLink.to} to={navLink.to} className="site-nav-link">
              {navLink.label}
            </NavLink>
          ))}
        </nav>

        <a href="#waitlist" className="btn btn-nav btn-sm site-nav-cta">
          Get Started
        </a>

        <button
          type="button"
          className="site-nav-menu-button"
          aria-expanded={menuIsOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuIsOpen((isOpen) => !isOpen)}
        >
          {menuIsOpen ? <CloseIcon /> : <MenuIcon />}
          <span className="visually-hidden">{menuIsOpen ? 'Close menu' : 'Open menu'}</span>
        </button>
      </div>

      <div id="mobile-menu" className="mobile-menu" hidden={!menuIsOpen}>
        <nav aria-label="Mobile" className="container mobile-menu-links">
          {NAV_LINKS.map((navLink) => (
            <NavLink key={navLink.to} to={navLink.to} className="mobile-menu-link">
              {navLink.label}
            </NavLink>
          ))}
          <a href="#waitlist" className="btn btn-primary" onClick={() => setMenuIsOpen(false)}>
            Join the waitlist
          </a>
        </nav>
      </div>
    </header>
  );
}

/**
 * Plain footer: wordmark, page links, legal line.
 * @returns {JSX.Element}
 */
function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer-inner">
        <div className="stack-3">
          <Wordmark />
          <p className="muted site-footer-line">Coaching app for personal trainers and their clients. iOS beta on TestFlight now, full launch late 2026.</p>
        </div>
        <nav aria-label="Footer" className="site-footer-links">
          <Link to="/">Home</Link>
          {NAV_LINKS.map((navLink) => (
            <Link key={navLink.to} to={navLink.to}>
              {navLink.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="container">
        <hr className="rule" />
        <p className="label site-footer-legal">&copy; 2026 Coach Connect</p>
      </div>
    </footer>
  );
}

/**
 * Page frame. `auroraTone` picks the backdrop strength.
 * @param {{ children: React.ReactNode, auroraTone?: 'default' | 'quiet' }} props
 * @returns {JSX.Element}
 */
export function Layout({ children, auroraTone = 'default' }) {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div className="aurora" data-tone={auroraTone} aria-hidden="true" />
      <SiteNav />
      <main id="main">{children}</main>
      <SiteFooter />
    </>
  );
}
