// Site-wide copy constants — the single home for strings that must never drift.
// Flow: ui/Sections.jsx and ui/Seo.jsx import from here instead of hardcoding,
// so pricing/trial/fee wording changes in exactly one place. Every claim in this file
// was verified against the app code by the owner — do not "improve" the wording solo.

// Public TestFlight invite for the iOS beta ("Try the beta" links point here).
// Confirmed by the owner Oct 2026 — this is the link-in-bio invite, so the
// utm_* tags stay: they tell Apple/IG this traffic came from that invite.
// Manipulate here: if Apple ever rotates the join code, swap the whole URL here
// and every TestFlight button on the site follows (never hardcode it in a section).
export const TESTFLIGHT_URL = 'https://testflight.apple.com/join/rArzZF5v?utm_source=ig&utm_medium=social&utm_content=link_in_bio';

// Trial wording — matches the App Store product exactly.
// Manipulate here: do not change without the owner (App Store product is the source of truth).
export const TRIAL_COPY = '3-day free trial';

// Annual-plan savings chip ($59.99 × 12 = $719.88 vs $588 billed annually ≈ $132 saved).
export const ANNUAL_SAVINGS_COPY = 'Save $132/yr';

// Exact fee disclosure, reused verbatim in the Trainers section and the pricing footnote.
// Platform fee + Stripe processing are two separate things — keep both halves of the sentence.
export const FEE_COPY =
  "Coach Connect takes a 10% platform fee per payment. Stripe's standard card processing fees also apply.";
