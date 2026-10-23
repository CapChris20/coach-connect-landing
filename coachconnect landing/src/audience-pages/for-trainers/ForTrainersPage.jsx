// ForTrainers — the /for-trainers page. Section titles state the
// feature name plainly — no slogans. Each section's card is filled
// with the feature's real parts from the app; the room beside each
// card waits for the owner's phone recordings. The shell is
// ui/AudienceSkeleton.jsx; when a section gets built for real, it
// replaces its shell there or graduates into ui/Sections.jsx.
// Used by: App.js at "/for-trainers".
// ===== IMPORTS =====

import { AudiencePageTemplate as AudienceSkeleton } from '../shared-phone-player/AudiencePageTemplate';

// ===== NAMED CONSTANTS =====

// The page's sections in story order. title = the feature name;
// description = what the feature is, in plain words; points = the
// feature's real parts, each a label and one line.
// Manipulate here: reorder or rename freely; the numbering, cards,
// phone-model room (alternating sides), and layout follow this list
// automatically. Each section that has app recordings also includes a
// `videos` array; sections without one keep the placeholder outline.

// Gradient shared across trainer clips: purple-to-cyan (the trainer pair).
const TRAINER_GRADIENT = 'linear-gradient(90deg, #C084FC, #06B6D4)';


const TRAINER_PAGE_SECTIONS = [
  {
    title: 'Trainer Dashboard',
    description:
      'Open the app and see your coaching business at a glance \u2014 who you coach, what is on today, and what needs an answer from you.',
    points: [
      { label: 'Active clients', text: 'Your current roster, counted and one tap away.' },
      { label: 'Pending requests', text: 'New client requests waiting on your decision.' },
      { label: 'Today\u2019s sessions', text: 'The sessions you have booked for today.' },
      { label: 'Client activity', text: 'Check-ins and progress from the people you coach.' },
    ],
    videos: [
      {
        label: 'Trainer home',
        sub: 'Good Evening, Chris \u2014 active clients, pending requests at a glance.',
        videoUrl: '/videos/trainers/dashboard-home.mp4',
        gradient: TRAINER_GRADIENT,
      },
    ],
  },
  {
    title: 'Client Requests and Roster',
    description:
      'Every client starts with a request. Review who is asking to work with you, decide, and keep your whole roster in one place.',
    points: [
      { label: 'Accept or decline', text: 'Answer each pending request when it comes in.' },
      { label: 'Your invite code', text: 'Bring your existing clients in with a code, no searching.' },
      { label: 'Roster cards', text: 'Age, weight, height, and goal for every client, at a glance.' },
      { label: 'Weekly-ready status', text: 'See who is on track for their weekly report.' },
    ],
    videos: [
      {
        label: 'Roster \u2014 client cards',
        sub: 'Your full roster: goals, weekly-ready status, and Cade\u2019s latest report.',
        videoUrl: '/videos/trainers/roster-clients.mp4',
        gradient: TRAINER_GRADIENT,
      },
    ],
  },
  {
    title: 'Client Workspace',
    description:
      'Tap a client and you are in their workspace \u2014 everything about that one person, organised into tabs instead of scattered across chats and notes.',
    points: [
      { label: 'Progress', text: 'Weight, today\u2019s workout, check-in signal, sleep, water, energy, and stress.' },
      { label: 'Nutrition', text: 'What your client is logging, visible to you read-only.' },
      { label: 'Calendar', text: 'Sessions and schedule for this client.' },
      { label: 'Notes \u0026 Files', text: 'Your notes and shared files for this client, kept together.' },
    ],
    videos: [
      {
        label: 'Progress tab',
        sub: 'Cade: weight 170 (\u221213 lbs), today\u2019s workout, Messages and Photo Gallery.',
        videoUrl: '/videos/trainers/client-workspace-progress.mp4',
        gradient: TRAINER_GRADIENT,
      },
      {
        label: 'Document tools',
        sub: 'Document Maker and Spreadsheet Creator \u2014 inside the client workspace.',
        videoUrl: '/videos/trainers/client-workspace-docs.mp4',
        gradient: TRAINER_GRADIENT,
      },
    ],
  },
  {
    title: 'Workout Plans',
    description:
      'Build a training plan the way you already coach it \u2014 by hand, exercise by exercise \u2014 or generate a starting point with AI and shape it from there.',
    points: [
      { label: 'Plan builder', text: 'Build plans manually, with full control over every exercise.' },
      { label: 'AI workout generator', text: 'Generate a workout and edit it before it reaches your client.' },
      { label: 'Assign per client', text: 'Send a plan to the client it was built for.' },
      { label: 'PDF export', text: 'Export a plan as a PDF when you need it off the phone.' },
    ],
    videos: [
      {
        label: 'AI workout plan',
        sub: 'Generate a plan \u2014 Build Muscle, intermediate, reviewed before saving.',
        videoUrl: '/videos/clients/workouts-ai-plan.mp4',
        gradient: TRAINER_GRADIENT,
      },
      {
        label: 'Exercise library',
        sub: 'Search goals, muscles, and equipment \u2014 videos tailored to your journey.',
        videoUrl: '/videos/clients/workouts-exercise-library.mp4',
        gradient: TRAINER_GRADIENT,
      },
      {
        label: 'Plan summary',
        sub: 'Your 4-week upper/lower split \u2014 save it to the library with one tap.',
        videoUrl: '/videos/clients/workouts-plan-summary.mp4',
        gradient: TRAINER_GRADIENT,
      },
    ],
  },
  {
    title: 'Session Scheduling',
    description:
      'Book sessions from your calendar and let the app handle the asking. Your client confirms on their side \u2014 no message threads about times.',
    points: [
      { label: 'Create sessions', text: 'Set the session and send it to your client.' },
      { label: 'Month calendar', text: 'Your booked sessions laid out across the month.' },
      { label: 'Client confirmation', text: 'Clients accept or decline on their phone.' },
      { label: 'Session alerts', text: 'Notifications keep both sides aware of what is booked.' },
    ],
    videos: [
      {
        label: 'Session calendar',
        sub: 'Sessions with Cade \u2014 October 2026 calendar view and + New Session.',
        videoUrl: '/videos/trainers/session-scheduling.mp4',
        gradient: TRAINER_GRADIENT,
      },
    ],
  },
  {
    title: 'Documents and Spreadsheets',
    description:
      'Write the long-form stuff properly. A document maker and a spreadsheet editor live inside the app, ready to share straight to a client.',
    points: [
      { label: 'Document Maker', text: 'Rich-text documents for guides, notes, and resources.' },
      { label: 'Spreadsheet editor', text: 'Build and edit spreadsheets without leaving the app.' },
      { label: 'Share to a client', text: 'Send a finished document directly to the client it is for.' },
      { label: 'Export', text: 'Take documents out of the app when you need them elsewhere.' },
    ],
    videos: [
      {
        label: 'Document Maker \u0026 Spreadsheet',
        sub: 'Rich-text editor and blank spreadsheet grid \u2014 both live inside the app.',
        videoUrl: '/videos/trainers/documents-spreadsheets.mp4',
        gradient: TRAINER_GRADIENT,
      },
    ],
  },
  {
    title: 'Weekly Reports',
    description:
      'Every week, each client\u2019s training is summed up for you \u2014 what happened, what it means, and where next week should go.',
    points: [
      { label: 'Narrative summary', text: 'The week written out, not just charted.' },
      { label: 'Trends', text: 'How the numbers are moving over time.' },
      { label: 'Pros and cons', text: 'What went well and what needs work, side by side.' },
      { label: 'Next week\u2019s focus', text: 'A clear direction for the week ahead.' },
    ],
    videos: [
      {
        label: 'Weekly Report \u2014 Jul 13\u201319',
        sub: 'Sleep trend, steps, calories, and hydration \u2014 the full week at a glance.',
        videoUrl: '/videos/trainers/weekly-reports.mp4',
        gradient: TRAINER_GRADIENT,
      },
    ],
  },
];



// ===== MAIN FUNCTION =====

/**
 * The trainers page (filled feature sections in story order).
 * @returns {JSX.Element}
 */
export default function ForTrainers() {
  return (
    <AudienceSkeleton
      eyebrow="For Trainers"
      title="Features for trainers"
      intro="The trainer side of Coach Connect \u2014 roster, plans, schedule, and weekly reports \u2014 laid out in the order this page covers them."
      sections={TRAINER_PAGE_SECTIONS}
      testId="for-trainers-page"
    />
  );
}
