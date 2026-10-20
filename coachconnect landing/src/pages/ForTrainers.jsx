// ForTrainers — the /for-trainers page. Placeholder for now: the owner is
// dictating this page's layout next (the old For Trainers chapter in
// ui/Sections.jsx is the seed content). Until then it renders the shared
// placeholder shell so the nav and the What-is pills land somewhere real.
// Used by: App.js at "/for-trainers".

import { PlaceholderPage } from '../ui/PlaceholderPage';

// ===== MAIN FUNCTION =====

/**
 * The trainers page (placeholder shell).
 * @returns {JSX.Element}
 */
export default function ForTrainers() {
  return (
    <PlaceholderPage
      eyebrow="For Trainers"
      title="The trainer page is on its way."
      body="We're building the full trainer breakdown — the marketplace, your roster, scheduling, and getting paid in the app. Until it lands, join the founding trainer waitlist."
      testId="for-trainers-page"
    />
  );
}
