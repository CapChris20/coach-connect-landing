// ForBoth — the /for-both page: the shared ground between the
// trainer and client sides (the owner asked for this page by name) —
// the systems both people use together. Section titles state the
// feature name plainly — no slogans. Each section's card is filled
// with the feature's real parts from the app; the room beside each
// card waits for the owner's phone recordings. The shell is
// ui/AudienceSkeleton.jsx.
// Used by: App.js at "/for-both".
// ===== IMPORTS =====

import { AudiencePageTemplate as AudienceSkeleton } from '../shared-phone-player/AudiencePageTemplate';

// ===== NAMED CONSTANTS =====

// The page's sections in story order. title = the feature name;
// description = what the feature is, in plain words; points = the
// feature's real parts, each a label and one line.
// Manipulate here: reorder or rename freely; the numbering, cards,
// phone-model room (alternating sides), and layout follow this list
// automatically.
const BOTH_PAGE_SECTIONS = [
  {
    title: 'Overview',
    description:
      'Coach Connect is one app with two sides: the trainer runs their coaching in it, the client trains in it, and both sides work from the same information.',
    points: [
      { label: 'Trainer account', text: 'Roster, plans, schedule, documents, and earnings.' },
      { label: 'Client account', text: 'Plan, nutrition, check-ins, sessions, and progress.' },
      { label: 'Connected', text: 'A request or an invite code links the two accounts.' },
      { label: 'One record', text: 'Plans, sessions, and files are shared, not copied between apps.' },
    ],
  },
  {
    title: 'Messaging',
    description: 'One conversation between client and coach, inside the app where the training already lives.',
    points: [
      { label: 'Real-time 1:1 chat', text: 'Messages delivered as they are sent.' },
      { label: 'Unread badges', text: 'Unanswered messages are visible at a glance.' },
      { label: 'Push notifications', text: 'New messages reach both phones off the app.' },
      { label: 'Block and report', text: 'Either side can block or report from the conversation.' },
    ],
  },
  {
    title: 'AI Coach',
    description:
      'The assistant that handles the logging and the small jobs. It can act on the app — and it asks for approval before anything changes.',
    points: [
      { label: 'Logging', text: 'Meals, water, sleep, and steps, logged by asking.' },
      { label: 'Edits and bookings', text: 'Workout edits and session bookings, done for you.' },
      { label: 'Confirm first', text: 'Every change appears in a popup for approval before it happens.' },
      { label: 'Scoped and private', text: 'Daily limits apply, answers stay on topic, and each person’s AI is their own.' },
    ],
  },
  {
    title: 'Weekly Reports',
    description: 'The same week, written up for both sides — the client reads their own week, the trainer reads it per client.',
    points: [
      { label: 'Client’s Week in Review', text: 'Check-in notes, nutrition, and lift feel, day by day.' },
      { label: 'Trainer’s report', text: 'Narrative summary, trends, pros and cons, per client.' },
      { label: 'Next week’s focus', text: 'Both sides see where the next week is aimed.' },
    ],
  },
  {
    title: 'Notes, Files, and Documents',
    description: 'The paperwork of coaching, kept with the client it belongs to and synced between both phones.',
    points: [
      { label: 'Notes and files', text: 'Kept per client, inside their workspace.' },
      { label: 'Document Maker', text: 'Rich-text documents and spreadsheets, built in the app.' },
      { label: 'Viewers', text: 'Open PDFs and spreadsheets without leaving Coach Connect.' },
      { label: 'Real-time sync', text: 'What one side adds, the other side sees.' },
    ],
  },
  {
    title: 'Scheduling',
    description: 'Sessions are a two-person system: one side books, the other side answers, and both calendars agree.',
    points: [
      { label: 'Trainer books', text: 'The trainer creates the session and sends it.' },
      { label: 'Client responds', text: 'Accept or decline from the client’s phone.' },
      { label: 'Reminders', text: 'Booked sessions surface on the client’s dashboard.' },
      { label: 'Calendar', text: 'Sessions visible on the calendar for both sides.' },
    ],
  },
  {
    title: 'Payments',
    description: 'Money moves inside the app: the client pays by card, the trainer gets paid out, and both sides keep the record.',
    points: [
      { label: 'Client pays by card', text: 'Card payments through Stripe, without leaving the app.' },
      { label: 'Trainer sets the rate', text: 'The trainer’s monthly rate, with billing they control.' },
      { label: 'Stripe payouts', text: 'Trainers connect Stripe to receive their money.' },
      { label: 'History on both sides', text: 'Payments made and payments received, recorded.' },
    ],
  },
  {
    title: 'Accounts and Safety',
    description: 'Getting in is simple, and either person can protect their space.',
    points: [
      { label: 'Email and Apple sign-in', text: 'Create an account and sign in either way.' },
      { label: 'Client or trainer', text: 'Your account carries the role you signed up as.' },
      { label: 'Block, report, privacy', text: 'Controls for who can reach you and what is shared.' },
      { label: 'Themes, help, and support', text: 'App themes and support, inside settings.' },
    ],
  },
];

// ===== MAIN FUNCTION =====

/**
 * The shared page (filled feature sections in story order).
 * @returns {JSX.Element}
 */
export default function ForBoth() {
  return (
    <AudienceSkeleton
      eyebrow="For Both"
      title="Features for trainers and clients"
      intro="The shared parts of Coach Connect — the features a trainer and a client use together — laid out in the order this page covers them."
      sections={BOTH_PAGE_SECTIONS}
      testId="for-both-page"
    />
  );
}
