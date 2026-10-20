// HeroWatch — the Apple Watch-style card filling the hero's right cell.
// Flow: straps + silver case + crown/buttons (pure CSS shapes) → light watch
// screen listing eight app features as watch rows (two columns of four),
// each with a one-line proof under it. The case is stretched wider than a
// real watch so all eight fit. Ported from a Uiverse component the owner supplied
// (a styled-components original): the cream page background was dropped so
// the watch floats on the site's backdrop, the five watch faces (clock,
// activity, heart rate, music, app grid) were removed, and the yellow accent
// became brand orange. All styling lives in index.css under .ccw-* classes.
// Used by: ui/Sections.jsx (TopSection).

import {
  Apple,
  CalendarCheck,
  CreditCard,
  Dumbbell,
  MessageCircle,
  Search,
  TrendingUp,
  Zap,
} from 'lucide-react';

// ===== NAMED CONSTANTS =====

// Manipulate here: the eight watch rows — the screen lays them out two
// columns of four, reading left to right. Label is the feature, sub is the
// one-line proof under it (wording already used elsewhere on this page;
// keep subs under ~24 characters or they wrap on the ~150px-wide column).
// color → gradientTo is each disc's gradient pair — never a flat fill.
const WATCH_ROWS = [
  { icon: Search, color: '#FF6B9D', gradientTo: '#F97316', label: 'Find trainers', sub: 'In the marketplace' },
  { icon: TrendingUp, color: '#06B6D4', gradientTo: '#C084FC', label: 'Track progress', sub: 'Photos + history' },
  { icon: Dumbbell, color: '#C084FC', gradientTo: '#FF6B9D', label: 'Exercise help', sub: 'Plans + AI Coach' },
  { icon: Apple, color: '#10B981', gradientTo: '#06B6D4', label: 'Log nutrition', sub: 'Barcode · cross-checked' },
  { icon: MessageCircle, color: '#F97316', gradientTo: '#FF6B9D', label: 'Messaging', sub: 'Message your coach' },
  { icon: CreditCard, color: '#FF6B9D', gradientTo: '#F97316', label: 'In-app payments', sub: 'Through Stripe' },
  { icon: CalendarCheck, color: '#06B6D4', gradientTo: '#C084FC', label: 'Scheduling', sub: 'Book sessions' },
  { icon: Zap, color: '#C084FC', gradientTo: '#FF6B9D', label: 'AI Coach', sub: 'Asks before changes' },
];

// ===== MAIN FUNCTION =====

/**
 * The hero's Apple Watch card. The case hardware (straps, crown, buttons) is
 * decorative CSS; the screen carries the actual pitch. The whole watch is
 * sized and positioned by the .ccw-* classes in index.css.
 * @returns {JSX.Element}
 */
export function HeroWatch() {
  return (
    // vocab: .ccw-wrap = the stage that centers the watch and crops the
    // straps (they run 610px past the case, top and bottom, so the band
    // spans the full hero height — see index.css)
    <div className="ccw-wrap" data-testid="hero-watch">
      <div className="ccw-watch">
        <div className="ccw-strap ccw-strap-top" />
        <div className="ccw-strap ccw-strap-bottom" />
        <div className="ccw-case">
          {/* The hardware bumps around the case edge — wells sit under the
              buttons they hold, exactly like the original component */}
          <div className="ccw-crown-well" />
          <div className="ccw-crown" />
          <div className="ccw-side-btn-well" />
          <div className="ccw-side-btn" />
          <div className="ccw-action-btn-well" />
          <div className="ccw-action-btn" />
          <div className="ccw-display">
            <div className="ccw-screen">
              <h2 className="ccw-title" data-testid="hero-watch-title">
                All in <span className="ccw-title-gradient">one app</span>
              </h2>
              <ul className="ccw-rows">
                {WATCH_ROWS.map((watchRow) => {
                  const WatchRowIcon = watchRow.icon;
                  return (
                    <li key={watchRow.label} className="ccw-row" data-testid="hero-watch-row">
                      <span
                        className="ccw-row-icon"
                        style={{ backgroundImage: `linear-gradient(135deg, ${watchRow.color}, ${watchRow.gradientTo})` }}
                      >
                        <WatchRowIcon size={18} strokeWidth={2.4} />
                      </span>
                      <span>
                        <span className="ccw-row-label">{watchRow.label}</span>
                        <span className="ccw-row-sub">{watchRow.sub}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
              {/* The mini wordmark signs the screen off like an app splash */}
              <div className="ccw-footer">
                <span className="ccw-footer-wordmark">COACH CONNECT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
