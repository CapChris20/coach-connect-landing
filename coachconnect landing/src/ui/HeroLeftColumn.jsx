// Hero left column — the copy and signup under the hero tagline.
// Flow: support sentence → email bar → trainer/client pills → proof chips
// → the 3D logo (passed in as children) with optional example notes beside it.
// Used by: ui/Sections.jsx (TopSection), between the tagline and the logo.

import { useState } from 'react';
import { ArrowRight, BadgeCheck, ShieldCheck } from 'lucide-react';
import { scrollToHash } from './scrollToHash';
import { joinWaitlist } from '../lib/waitlist';

// ===== NAMED CONSTANTS =====

// Manipulate here: the one sentence under "One Day or Day One."
// Keep it to about two lines (roughly 60 characters each).
const HERO_SUPPORT_SENTENCE =
  'Plans, nutrition, payments, and an AI assistant, in one app for trainers and their clients.';

// Manipulate here: true shows the example notes beside the logo.
// They are sample UI, not real activity — leave this false until you want them.
const SHOW_FLOATING_CARDS = false;

// Manipulate here: how long each example note stays up, in milliseconds.
const HERO_NOTE_HOLD_MS = 4000;

// Sample lines only. No names, no prices.
const HERO_EXAMPLE_NOTES = ['Session booked', 'Plan updated', 'Message from your coach'];

// Name, then @, then a dot in the domain. Same check the footer form uses.
const EMAIL_HAS_NAME_AND_DOMAIN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// One state at a time, so "loading" and "failed" can never both be true.
const WAITLIST_STATE_IDLE = 'idle';
const WAITLIST_STATE_LOADING = 'loading';
const WAITLIST_STATE_SUCCESS = 'success';
const WAITLIST_STATE_INVALID = 'invalid';
const WAITLIST_STATE_FAILED = 'failed';

const WAITLIST_INVALID_MESSAGE = 'Enter a valid email address.';
const WAITLIST_FAILED_MESSAGE = 'Could not join right now. Try again.';
const WAITLIST_SUCCESS_MESSAGE = "You're on the list.";
const WAITLIST_LOADING_MESSAGE = 'Joining the waitlist.';

// TODO: #act-trainer (BestUseCases) and #act-client (FeatureCards) are the
// real audience chapters, but pages/Landing.jsx does not render them — they
// are parked off the homepage. Until those chapters are back on the page,
// the pills glide to the nearest live act instead:
//   trainers → #act-pricing (the subscription chapter, the trainer offer)
//   clients  → #act-connection (what the app is, including the client side)
const TRAINER_SECTION_HASH = '#act-trainer';
const CLIENT_SECTION_HASH = '#act-client';
const TRAINER_FALLBACK_HASH = '#act-pricing';
const CLIENT_FALLBACK_HASH = '#act-connection';

// Only facts confirmed in this repo. Searched before each line was added.
// "Free for clients" — ui/Sections.jsx FAQ ("The app is free for clients.")
// "AI asks before it changes anything" — ui/Sections.jsx WHAT_IS_PIECES,
//   and the same line in ui/Seo.jsx.
// Left out: "Nutrition cross-checked across 7 sources". This repo says
// "cross-checked across multiple databases" and never says 7.
const HERO_PROOF_CHIPS = [
  { icon: BadgeCheck, text: 'Free for clients' },
  { icon: ShieldCheck, text: 'AI asks before it changes anything' },
];

// ===== HELPER FUNCTIONS =====

/**
 * True when the address has a name, an @, and a dot in the domain.
 * @param {string} emailAddress
 * @returns {boolean}
 */
function isEmailAddressValid(emailAddress) {
  return EMAIL_HAS_NAME_AND_DOMAIN.test(emailAddress);
}

/**
 * The sentence a screen reader (and the line under the bar) should say.
 * @param {string} formState
 * @returns {string}
 */
function waitlistStatusText(formState) {
  if (formState === WAITLIST_STATE_LOADING) return WAITLIST_LOADING_MESSAGE;
  if (formState === WAITLIST_STATE_INVALID) return WAITLIST_INVALID_MESSAGE;
  if (formState === WAITLIST_STATE_FAILED) return WAITLIST_FAILED_MESSAGE;
  if (formState === WAITLIST_STATE_SUCCESS) return WAITLIST_SUCCESS_MESSAGE;
  return '';
}

/**
 * Glide to the audience chapter when it is on the page, otherwise the nearest
 * live act. scrollToHash stops the browser's instant jump itself.
 * @param {Event} clickEvent
 * @param {string} preferredHash - the real chapter, like "#act-trainer"
 * @param {string} fallbackHash - the live chapter we use while the real one is parked
 * @returns {void}
 */
function glideToAudienceChapter(clickEvent, preferredHash, fallbackHash) {
  const preferredSection = document.querySelector(preferredHash);
  const hashThatIsOnThePage = preferredSection ? preferredHash : fallbackHash;
  scrollToHash(clickEvent, hashThatIsOnThePage);
}

/**
 * One outlined proof chip: a small icon plus a short verified fact.
 * @param {Object} props
 * @param {{ icon: React.ElementType, text: string }} props.chip
 * @returns {JSX.Element}
 */
function ProofChip({ chip }) {
  const ChipIcon = chip.icon;

  return (
    <span className="hero-proof-chip">
      <ChipIcon size={14} strokeWidth={2.2} aria-hidden="true" />
      {chip.text}
    </span>
  );
}

/**
 * A small pill that glides down the page.
 * @param {Object} props
 * @param {string} props.preferredHash
 * @param {string} props.fallbackHash
 * @param {string} props.label
 * @param {string} props.testId
 * @returns {JSX.Element}
 */
function AudiencePill({ preferredHash, fallbackHash, label, testId }) {
  return (
    <a
      href={fallbackHash}
      onClick={(clickEvent) => glideToAudienceChapter(clickEvent, preferredHash, fallbackHash)}
      className="hero-audience-pill"
      data-testid={testId}
    >
      {label}
      <ArrowRight size={14} aria-hidden="true" />
    </a>
  );
}

/**
 * The glass email bar. Validates here, then calls joinWaitlist.
 * @returns {JSX.Element}
 */
function HeroWaitlistBar() {
  const [emailAddress, setEmailAddress] = useState('');
  const [formState, setFormState] = useState(WAITLIST_STATE_IDLE);

  const isLoading = formState === WAITLIST_STATE_LOADING;
  const isInvalid = formState === WAITLIST_STATE_INVALID;
  const didJoin = formState === WAITLIST_STATE_SUCCESS;
  const statusText = waitlistStatusText(formState);
  // Loading is announced, but the button already shows it, so the line stays
  // visually quiet. Errors and success are the line people can read.
  const isStatusVisible = statusText !== '' && !isLoading;

  /**
   * Check the address, then ask joinWaitlist, then show what happened.
   * @param {Event} submitEvent - stopped so the browser does not reload the page
   * @returns {Promise<void>}
   */
  const submitWaitlistEmail = async (submitEvent) => {
    // 1. Stay on the page, and ignore a second click while the first is in flight.
    submitEvent.preventDefault();
    if (isLoading) return;

    // 2. Bad address: say so inline. Do not call joinWaitlist.
    const trimmedEmailAddress = emailAddress.trim();
    if (!isEmailAddressValid(trimmedEmailAddress)) {
      setFormState(WAITLIST_STATE_INVALID);
      return;
    }

    // 3. The stub (later, Firestore) runs while the button is disabled.
    setFormState(WAITLIST_STATE_LOADING);
    try {
      await joinWaitlist(trimmedEmailAddress);
      setFormState(WAITLIST_STATE_SUCCESS);
    } catch {
      setFormState(WAITLIST_STATE_FAILED);
    }
  };

  /**
   * Keep what they type, and clear a previous error once they edit it.
   * @param {Event} changeEvent
   * @returns {void}
   */
  const saveTypedEmail = (changeEvent) => {
    setEmailAddress(changeEvent.target.value);
    if (isInvalid || formState === WAITLIST_STATE_FAILED) {
      setFormState(WAITLIST_STATE_IDLE);
    }
  };

  return (
    <div className="hero-waitlist" data-testid="hero-waitlist">
      {/* Success replaces the bar. The live region below stays mounted either way
          so the new sentence is announced. */}
      {!didJoin && (
        <form className="hero-waitlist-pill" onSubmit={submitWaitlistEmail} noValidate>
          <input
            type="email"
            name="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={emailAddress}
            onChange={saveTypedEmail}
            aria-label="Email address"
            aria-invalid={isInvalid}
            aria-describedby="hero-waitlist-status"
            className="hero-waitlist-input"
            data-testid="hero-waitlist-email"
          />
          <button
            type="submit"
            className="cta-primary hero-action hero-action-primary hero-waitlist-submit"
            disabled={isLoading}
            data-testid="hero-waitlist-submit"
          >
            {isLoading ? 'Joining…' : 'Join the waitlist'}
          </button>
        </form>
      )}

      {/* vocab: aria-live="polite" = the screen reader says this text when it
          changes, after it finishes whatever it was already saying. */}
      <p
        id="hero-waitlist-status"
        className={isStatusVisible ? 'hero-waitlist-status' : 'sr-only'}
        aria-live="polite"
        data-state={formState}
        data-testid="hero-waitlist-status"
      >
        {statusText}
      </p>
    </div>
  );
}

/**
 * The two sample notes that fade one at a time. Rendered only when
 * SHOW_FLOATING_CARDS is true. CSS owns the fade; reduced motion shows
 * the first note and does not cycle.
 * @returns {JSX.Element}
 */
function HeroExampleNotes() {
  return (
    <div
      className="hero-example-notes"
      style={{ '--hero-note-hold': `${HERO_NOTE_HOLD_MS}ms` }}
      aria-hidden="true"
    >
      {HERO_EXAMPLE_NOTES.map((noteText) => (
        <div key={noteText} className="hero-example-note">
          <span className="hero-example-kicker">Example</span>
          {noteText}
        </div>
      ))}
    </div>
  );
}

// ===== MAIN FUNCTION =====

/**
 * Everything added under the tagline, then the logo.
 * @param {Object} props
 * @param {React.ReactNode} props.children - the 3D logo, rendered last
 * @returns {JSX.Element}
 */
export function HeroLeftColumn({ children }) {
  return (
    <>
      <p className="hero-support-line" data-testid="hero-support-line">
        {HERO_SUPPORT_SENTENCE}
      </p>

      <HeroWaitlistBar />

      <div className="hero-audience-pills">
        <AudiencePill
          preferredHash={TRAINER_SECTION_HASH}
          fallbackHash={TRAINER_FALLBACK_HASH}
          label="I'm a trainer"
          testId="hero-pill-trainer"
        />
        <AudiencePill
          preferredHash={CLIENT_SECTION_HASH}
          fallbackHash={CLIENT_FALLBACK_HASH}
          label="I'm a client"
          testId="hero-pill-client"
        />
      </div>

      <div className="hero-proof-row" data-testid="hero-proof-row">
        {HERO_PROOF_CHIPS.map((chip) => (
          <ProofChip key={chip.text} chip={chip} />
        ))}
      </div>

      {/* The logo stays last. A small upward margin (in index.css) sits the
          mark on the sun's left edge. The slow turn lives inside the canvas,
          not on this box. Example notes sit on this box, out of the flow,
          so turning them on does not push the logo. */}
      <div className="hero-logo-slot">
        {SHOW_FLOATING_CARDS ? <HeroExampleNotes /> : null}
        {children}
      </div>
    </>
  );
}
