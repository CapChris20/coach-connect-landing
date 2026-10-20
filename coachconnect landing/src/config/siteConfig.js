// Site-wide copy constants — the single home for strings that must never drift.
// Flow: ui/Sections.jsx and ui/Seo.jsx import from here instead of hardcoding,
// so pricing/trial/fee wording changes in exactly one place. Every claim in this file
// was verified against the app code by the owner — do not "improve" the wording solo.

// Public TestFlight invite for the iOS beta ("Try the beta" links point here).
// TODO(owner): confirm this invite link is still active before driving waitlist traffic to it.
export const TESTFLIGHT_URL = 'https://testflight.apple.com/join/rArzZF5v';

// Trial wording — matches the App Store product exactly.
// Manipulate here: do not change without the owner (App Store product is the source of truth).
export const TRIAL_COPY = '3-day free trial';

// Annual-plan savings chip ($59.99 × 12 = $719.88 vs $588 billed annually ≈ $132 saved).
export const ANNUAL_SAVINGS_COPY = 'Save $132/yr';

// Exact fee disclosure, reused verbatim in the Trainers section and the pricing footnote.
// Platform fee + Stripe processing are two separate things — keep both halves of the sentence.
export const FEE_COPY =
  "Coach Connect takes a 10% platform fee per payment. Stripe's standard card processing fees also apply.";
