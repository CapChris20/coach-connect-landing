// ForClients — the /for-clients page. Section titles state the
// feature name plainly — no slogans. Each section's card is filled
// with the feature's real parts from the app; the room beside each
// card waits for the owner's phone recordings. The shell is
// ui/AudienceSkeleton.jsx; when a section gets built for real, it
// replaces its shell there or graduates into ui/Sections.jsx.
// Used by: App.js at "/for-clients".
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

// Gradient shared across client clips: pink-to-orange (the brand pair).
const CLIENT_GRADIENT = 'linear-gradient(90deg, #FF6B9D, #F97316)';


const CLIENT_PAGE_SECTIONS = [
  {
    title: 'Home Dashboard',
    description:
      'Your home screen is your day: what your coach has planned, what is booked, and what still needs a check-in.',
    points: [
      { label: 'Today\u2019s workout', text: 'The workout your coach has set for today.' },
      { label: 'Training agenda', text: 'What is coming up in your training.' },
      { label: 'Session reminders', text: 'Booked sessions surface here so they are not missed.' },
      { label: 'Check-in prompts', text: 'Daily check-ins waiting for you, in one place.' },
    ],
    videos: [
      {
        label: 'Home \u2014 trainer card',
        sub: 'Your dashboard: Week in Review, your trainer, and quick pay.',
        videoUrl: '/videos/clients/dashboard-home.mp4',
        gradient: CLIENT_GRADIENT,
      },
      {
        label: 'Full dashboard',
        sub: 'Workouts, Analytics, Progress, History \u2014 everything in one view.',
        videoUrl: '/videos/clients/dashboard-full.mp4',
        gradient: CLIENT_GRADIENT,
      },
    ],
  },
  {
    title: 'Trainer Search',
    description:
      'Find a coach by how you want to train. Filter the marketplace, read a profile properly, then send a request \u2014 or skip the search with your trainer\u2019s invite code.',
    points: [
      { label: 'Search and filters', text: '12 specialties, experience tiers, price sorting, and Remote, In-person, or Both.' },
      { label: 'Trainer profiles', text: 'Philosophy, specialties, certifications, availability, and monthly rate.' },
      { label: 'Send a request', text: 'Ask to work with the trainer you choose.' },
      { label: 'Invite code', text: 'Join your existing trainer directly with their code.' },
    ],
    videos: [
      {
        label: 'Trainer marketplace',
        sub: 'Find Your Perfect Coach \u2014 browse the marketplace from the home screen.',
        videoUrl: '/videos/clients/trainer-search-marketplace.mp4',
        gradient: CLIENT_GRADIENT,
      },
    ],
  },
  {
    title: 'Daily Check-Ins',
    description:
      'Thirty seconds a day that tells your coach how you are actually doing \u2014 not just what you lifted.',
    points: [
      { label: 'Sleep and water', text: 'Log sleep and hydration each day.' },
      { label: 'Energy, stress, and mood', text: 'Rate how you feel, so training can adjust to it.' },
      { label: 'Soreness', text: 'Flag what is sore before the next session.' },
      { label: 'Weight', text: 'Keep your weight logged alongside everything else.' },
    ],
    videos: [
      {
        label: 'Soreness \u0026 energy check-in',
        sub: 'Rate muscle soreness and energy level \u2014 your coach sees it instantly.',
        videoUrl: '/videos/clients/checkin-soreness-energy.mp4',
        gradient: CLIENT_GRADIENT,
      },
    ],
  },
  {
    title: 'Workouts',
    description:
      'Your coach\u2019s plan, ready when you are. Follow it, log it as you go, and keep a copy whenever you want one.',
    points: [
      { label: 'Your plan', text: 'The program your coach built and assigned to you.' },
      { label: 'Exercise library', text: 'Searchable exercises with video demonstrations.' },
      { label: 'Log as you train', text: 'Record your workout while you do it.' },
      { label: 'PDF export and AI workouts', text: 'Export your plan, or generate a workout with AI.' },
    ],
    videos: [
      {
        label: 'AI workout plan',
        sub: 'Generate a plan \u2014 Build Muscle, intermediate, reviewed before it saves.',
        videoUrl: '/videos/clients/workouts-ai-plan.mp4',
        gradient: CLIENT_GRADIENT,
      },
      {
        label: 'Exercise library',
        sub: 'Search goals, muscles, and equipment \u2014 videos tailored to your journey.',
        videoUrl: '/videos/clients/workouts-exercise-library.mp4',
        gradient: CLIENT_GRADIENT,
      },
      {
        label: 'Plan summary',
        sub: 'Your 4-week upper/lower split \u2014 save it to the library with one tap.',
        videoUrl: '/videos/clients/workouts-plan-summary.mp4',
        gradient: CLIENT_GRADIENT,
      },
    ],
  },
  {
    title: 'Nutrition Log',
    description:
      'Log food the fast way and see the day add up against the targets you are aiming for.',
    points: [
      { label: 'Barcode scanner', text: 'Scan a product and add it straight to your day.' },
      { label: 'Food search and quick add', text: 'Find foods fast, re-add the ones you eat often.' },
      { label: 'Macro targets', text: 'Your daily targets, set for your goal.' },
      { label: 'Daily totals', text: 'Calories and macros totalled as the day goes.' },
    ],
    videos: [
      {
        label: 'Food search',
        sub: 'Search foods, brands, and restaurants \u2014 data from trusted databases.',
        videoUrl: '/videos/clients/nutrition-food-search.mp4',
        gradient: CLIENT_GRADIENT,
      },
      {
        label: 'Macro rings',
        sub: 'Calories consumed and Protein / Carbs / Fat rings update as you log.',
        videoUrl: '/videos/clients/nutrition-macro-rings.mp4',
        gradient: CLIENT_GRADIENT,
      },
      {
        label: 'Meals \u2014 scan or search',
        sub: 'Dinner and Snacks \u2014 Scan, Search, or Quick Add for every meal.',
        videoUrl: '/videos/clients/nutrition-meals-scan.mp4',
        gradient: CLIENT_GRADIENT,
      },
    ],
  },
  {
    title: 'Sessions',
    description:
      'When your coach books a session, it lands with you. Confirm it, see it coming, and keep every session on one calendar.',
    points: [
      { label: 'Accept or decline', text: 'Answer session invites from your coach.' },
      { label: 'Reminder cards', text: 'Upcoming sessions appear on your dashboard.' },
      { label: 'Calendar view', text: 'Your sessions laid out on a calendar.' },
    ],
    videos: [
      {
        label: 'Nutrition today \u0026 files',
        sub: 'Home screen \u2014 today\u2019s nutrition summary and your Notes & Files hub.',
        videoUrl: '/videos/clients/sessions-notes-home.mp4',
        gradient: CLIENT_GRADIENT,
      },
    ],
  },
  {
    title: 'Weekly Reports',
    description:
      'At the end of the week, your training is written up for you \u2014 what happened, how you felt, and where next week should go.',
    points: [
      { label: 'Week in Review', text: 'A written summary of your week, not just numbers.' },
      { label: 'Day by day', text: 'Check-ins, nutrition, and how your lifts felt, across the week.' },
      { label: 'Trends and focus', text: 'How your numbers moved and what to aim for next week.' },
    ],
    videos: [
      {
        label: 'Weekly Report \u2014 Jul 13\u201319',
        sub: 'Sleep trend, steps, calories, and hydration \u2014 the full week at a glance.',
        videoUrl: '/videos/trainers/weekly-reports.mp4',
        gradient: CLIENT_GRADIENT,
      },
    ],
  },
  {
    title: 'AI Coach',
    description:
      'An assistant that does the logging for you. Tell it what you ate, drank, or trained \u2014 it writes it down, and it asks before it changes anything.',
    points: [
      { label: 'Logs for you', text: 'Meals, water, sleep, and steps, logged by asking.' },
      { label: 'Edits and bookings', text: 'It can edit workouts and book sessions for you.' },
      { label: 'Confirms first', text: 'Nothing changes until you approve it in a popup.' },
      { label: 'Private to you', text: 'Your AI Coach is yours \u2014 it is not shared with your trainer.' },
    ],
    videos: [
      {
        label: 'AI Coach assistant',
        sub: 'Ask your AI Coach to log meals, schedule workouts, or record stats.',
        videoUrl: '/videos/clients/ai-coach.mp4',
        gradient: CLIENT_GRADIENT,
      },
    ],
  },
];


// ===== MAIN FUNCTION =====

/**
 * The clients page (filled feature sections in story order).
 * @returns {JSX.Element}
 */
export default function ForClients() {
  return (
    <AudienceSkeleton
      eyebrow="For Clients"
      title="Features for clients"
      intro="The client side of Coach Connect — finding a trainer, workouts, nutrition, and weekly reports — laid out in the order this page covers them."
      sections={CLIENT_PAGE_SECTIONS}
      testId="for-clients-page"
    />
  );
}
