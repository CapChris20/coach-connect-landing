// ForClients — the /for-clients page. Placeholder for now: the owner is
// dictating this page's layout next (the old For Clients chapter in
// ui/Sections.jsx is the seed content). Until then it renders the shared
// placeholder shell so the nav and the What-is pills land somewhere real.
// Used by: App.js at "/for-clients".

import { PlaceholderPage } from '../ui/PlaceholderPage';

// ===== MAIN FUNCTION =====

/**
 * The clients page (placeholder shell).
 * @returns {JSX.Element}
 */
export default function ForClients() {
  return (
    <PlaceholderPage
      eyebrow="For Clients"
      title="The client page is on its way."
      body="We're building the full client breakdown — finding your coach, following your plan, and logging nutrition. Until it lands, join the waitlist and we'll tell you when it opens."
      testId="for-clients-page"
    />
  );
}
