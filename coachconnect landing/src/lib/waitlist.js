// joinWaitlist — the hero waitlist's save door.
// Flow: the hero form checks the address → calls joinWaitlist → this file
// waits, then resolves. Nothing is stored yet.
// Used by: ui/HeroLeftColumn.jsx. The footer form in waitlist/ creates the real
// anatrox-auth login and onboarding. This hero bar is still email-only.

// ===== NAMED CONSTANTS =====

// Manipulate here: how long the stub pretends to save, in milliseconds.
// Long enough that the button's "Joining…" state is visible.
const WAITLIST_STUB_WAIT_MS = 600;

// ===== HELPER FUNCTIONS =====

/**
 * Pause for the stub delay, then continue.
 * vocab: Promise = a value that arrives later. await pauses this function
 * until the pause is over, without freezing the rest of the page.
 * @returns {Promise<void>}
 */
function waitForStubDelay() {
  return new Promise((resolve) => {
    setTimeout(resolve, WAITLIST_STUB_WAIT_MS);
  });
}

// ===== MAIN FUNCTION =====

/**
 * Join the hero waitlist.
 * Today this only waits, then resolves. It does not write the address anywhere.
 * @param {string} emailAddress - the trimmed address from the hero form
 * @returns {Promise<void>} resolves when the (future) save finishes
 */
export async function joinWaitlist(emailAddress) {
  // 1. An empty call is a bug in the form, not a person to save.
  if (!emailAddress) {
    throw new Error('Need an email address');
  }

  // 2. Pretend to save so the form can show loading, then success.
  // TODO(owner): replace this wait with a Firestore write. Do not add Firebase
  // in this file until that write is the real one.
  //   collection: landing_waitlist
  //   document id: the email address
  //   project: anatrox-auth
  // Fields to store when you do: email, signedUpAt (server time), source: 'hero'.
  // Until then this function stores nothing — do not send traffic at the hero
  // bar and expect the address to be kept.
  await waitForStubDelay();
}
