// Faqs — the /faqs page. The questions used to be a chapter on the
// homepage; the owner moved them here so the homepage stays tight and
// the nav's FAQs link lands on a real page, like For Trainers / For
// Clients. The questions themselves still live in ui/Sections.jsx
// (FaqSection) — this page is just the site frame around them.
// Used by: App.js at "/faqs".

import Seo from '../ui/Seo';
import { NavBar } from '../navbar/NavBar';
import { FaqSection } from '../ui/Sections';

// ===== MAIN FUNCTION =====

/**
 * The FAQs page: nav on top, the question cards under it.
 * @returns {JSX.Element}
 */
export default function Faqs() {
  return (
    <div className="relative min-h-screen bg-void" data-testid="faqs-page">
      <Seo />

      {/* The same static gradient backdrop the landing page uses */}
      <div className="aurora-static" data-testid="aurora-fallback" aria-hidden />

      <div className="relative z-10">
        <NavBar />

        {/* Padding at the top clears the fixed nav bar */}
        <main className="pt-24">
          <FaqSection />
        </main>
      </div>
    </div>
  );
}
