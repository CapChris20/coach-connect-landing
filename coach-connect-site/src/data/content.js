// content.js — every word and every media path the pages show, in one place.
// Copy rules (DESIGN.md section 13): specific, checkable, no em dashes, no emojis,
// no buzzwords, no invented numbers, no real people's names.
// Manipulate here: edit copy or swap a clip path; the pages follow.

// ===== LINKS =====

export const TESTFLIGHT_URL = 'https://testflight.apple.com/join/rArzZF5v';

export const NAV_LINKS = [
  { to: '/trainers', label: 'Trainers' },
  { to: '/clients', label: 'Clients' },
  { to: '/nutrition', label: 'Nutrition' },
  { to: '/how-it-works', label: 'How it works' },
  { to: '/faq', label: 'FAQ' },
];

// ===== APP RECORDINGS =====
// Real screen recordings from the iOS app. Captions describe what is on screen.

export const SIDE_CLIPS = [
  {
    id: 'client',
    label: 'Client home',
    caption: 'Today at a glance: the plan, sessions and check-ins.',
    src: '/videos/app-client-side.mp4',
    poster: '/videos/app-client-side.jpg',
  },
  {
    id: 'trainer',
    label: 'Trainer home',
    caption: 'Active clients, pending requests and quick actions.',
    src: '/videos/app-trainer-side.mp4',
    poster: '/videos/app-trainer-side.jpg',
  },
];

export const CLIENT_FEATURES = [
  {
    id: 'find',
    title: 'Find a trainer',
    text: 'Search the marketplace by specialty, experience, price and Remote, In-person or Both. Read the profile, then send a request. Already have a coach? Join with their invite code.',
    src: '/videos/clients/trainer-search-marketplace.mp4',
  },
  {
    id: 'dashboard',
    title: 'Your day on one screen',
    text: 'Today’s workout from your coach, booked sessions and the check-ins still waiting for you.',
    src: '/videos/clients/dashboard-home.mp4',
  },
  {
    id: 'checkin',
    title: 'Daily check-in',
    text: 'Sleep, water, energy, stress, mood, soreness and weight. Your coach sees it before the next session.',
    src: '/videos/clients/checkin-soreness-energy.mp4',
  },
  {
    id: 'workouts',
    title: 'Workouts and the exercise library',
    text: 'Follow the plan your coach assigned, log sets as you train, and look up any exercise with a video demo.',
    src: '/videos/clients/workouts-exercise-library.mp4',
  },
  {
    id: 'ai',
    title: 'AI Coach',
    text: 'Ask it to log a meal, water, sleep or steps, or to edit a workout. Nothing changes until you confirm. Your trainer does not see these chats.',
    src: '/videos/clients/ai-coach.mp4',
  },
];

export const TRAINER_FEATURES = [
  {
    id: 'home',
    title: 'Your business at a glance',
    text: 'Active clients, pending requests and today’s sessions the moment you open the app.',
    src: '/videos/trainers/dashboard-home.mp4',
  },
  {
    id: 'roster',
    title: 'Requests and roster',
    text: 'Accept or decline new clients. Bring existing ones in with your invite code. Every client card shows age, weight, height and goal.',
    src: '/videos/trainers/roster-clients.mp4',
  },
  {
    id: 'workspace',
    title: 'One workspace per client',
    text: 'Progress, nutrition, calendar, notes and files for one person, in tabs instead of scattered across chats.',
    src: '/videos/trainers/client-workspace-progress.mp4',
  },
  {
    id: 'schedule',
    title: 'Session scheduling',
    text: 'Create a session, your client accepts or declines on their phone. No message threads about times.',
    src: '/videos/trainers/session-scheduling.mp4',
  },
  {
    id: 'docs',
    title: 'Documents and spreadsheets',
    text: 'A document maker and a spreadsheet editor inside the app. Share the finished file straight to a client.',
    src: '/videos/trainers/documents-spreadsheets.mp4',
  },
  {
    id: 'reports',
    title: 'Weekly reports',
    text: 'Each client’s week written up from real check-ins: trends, what went well, what needs work, and next week’s focus.',
    src: '/videos/trainers/weekly-reports.mp4',
  },
];

export const NUTRITION_METHODS = [
  {
    id: 'scan',
    step: '01',
    title: 'Scan',
    text: 'Point the camera at a barcode and the product lands in the meal you picked.',
    src: '/videos/clients/nutrition-meals-scan.mp4',
  },
  {
    id: 'search',
    step: '02',
    title: 'Search',
    text: 'Look up foods, brands and restaurants. Re-add the things you eat often with Quick Add.',
    src: '/videos/clients/nutrition-food-search.mp4',
  },
  {
    id: 'rings',
    step: '03',
    title: 'See the day add up',
    text: 'Calories plus protein, carbs and fat rings fill against your targets as you log.',
    src: '/videos/clients/nutrition-macro-rings.mp4',
  },
];

// ===== PRICING (trainers) =====

export const PRICING = {
  name: 'Coach Connect Pro',
  monthly: '$59.99',
  annualMonthly: '$49',
  annualTotal: '$588',
  annualSaving: '$132',
  includes: [
    'No per-client fees',
    'Three AI workout plans each month',
    'Nutrition tracking with barcode scanning',
    'Progress photos and history',
    'Messaging, scheduling and weekly reports',
  ],
  fineprint:
    'Every plan starts with a 3-day free trial. Clients use the app free and pay you in the app. Coach Connect takes a 10% platform fee per payment, and Stripe’s standard card fees apply.',
};

// ===== HOW IT WORKS =====

export const CLIENT_STEPS = [
  { title: 'Download and sign up', text: 'Pick Client when the app asks who you are.' },
  { title: 'Find or join your coach', text: 'Browse the marketplace, or type the invite code your trainer gave you.' },
  { title: 'Train, log, check in', text: 'Follow the plan, log meals and send a 30-second daily check-in.' },
  { title: 'Pay in the app', text: 'Pay your coach through Stripe. The app itself is free for clients.' },
];

export const TRAINER_STEPS = [
  { title: 'Start the free trial', text: 'Three days of Coach Connect Pro to try every trainer tool.' },
  { title: 'Fill in your profile', text: 'Specialties, certifications, availability and monthly rate. This is what clients see in the marketplace.' },
  { title: 'Bring clients in', text: 'Accept marketplace requests, or share your invite code with the clients you already have.' },
  { title: 'Coach and get paid', text: 'Plans, sessions, messages and weekly reports in one place. Payouts go to your bank through Stripe.' },
];

// ===== FAQ =====
// Written from the current app. `highlight: true` also shows on the homepage.

export const FAQ_GROUPS = [
  {
    id: 'basics',
    title: 'The basics',
    items: [
      {
        id: 'launch',
        highlight: true,
        q: 'When does Coach Connect launch?',
        a: 'Doors open late 2026, founding trainers first. Join the waitlist and we will email you before then. The iOS beta is already live on TestFlight if you want in now.',
      },
      {
        id: 'cost',
        highlight: true,
        q: 'How much does it cost?',
        a: 'For trainers, Coach Connect Pro is $59.99 a month, or $49 a month billed yearly at $588. Every plan starts with a 3-day free trial. The app is free for clients.',
      },
      {
        id: 'per-client',
        highlight: true,
        q: 'Is there a per-client fee?',
        a: 'No. One flat price covers your whole roster. Coach Connect takes a 10% platform fee on payments made in the app, and Stripe’s standard card fees apply.',
      },
      {
        id: 'medical',
        q: 'Is this medical advice?',
        a: 'No. For medical concerns, talk to a licensed professional.',
      },
    ],
  },
  {
    id: 'payments',
    title: 'Payments',
    items: [
      {
        id: 'earn',
        q: 'How much do trainers earn, and when?',
        a: 'You receive 90% of each in-app client payment. Stripe sends payouts to your linked bank account, usually within 2 to 5 business days.',
      },
      {
        id: 'how-pay',
        q: 'How do clients pay their coach?',
        a: 'Linked clients tap Pay on the dashboard, or add a card under Settings, Billing. Stripe processes the payment and it is saved in payment history.',
      },
      {
        id: 'must-use',
        q: 'Do I have to use Coach Connect payments?',
        a: 'No. You can take payment outside the app, but you lose automatic payouts and the payment history.',
      },
      {
        id: 'pro-vs-client',
        q: 'Is a client payment the same as Coach Connect Pro?',
        a: 'No. Client payments go from your client to you. Coach Connect Pro is your own subscription for the trainer tools.',
      },
    ],
  },
  {
    id: 'app',
    title: 'Using the app',
    items: [
      {
        id: 'ai',
        highlight: true,
        q: 'What does the AI Coach do?',
        a: 'It can log a meal, water, sleep or steps, edit a workout, or book a session. It asks you to confirm before anything changes. It stays on fitness, nutrition and habits, and has a daily message limit.',
      },
      {
        id: 'ai-vs-trainer',
        q: 'What is the difference between my trainer and AI Coach?',
        a: 'Your trainer is a person: messages, sessions, files and the photos they review. AI Coach is an in-app assistant for logging and small edits. Your trainer does not see your AI Coach chats.',
      },
      {
        id: 'find',
        q: 'How do I find a trainer near me?',
        a: 'Use Find trainers to filter by specialty, session type, experience and price. Location is what the trainer wrote on their profile. There is no GPS matching.',
      },
      {
        id: 'request',
        q: 'What happens when I request a trainer?',
        a: 'The request lands in their pending list. Once they accept, messaging, shared files and scheduling open up between you.',
      },
      {
        id: 'regen',
        q: 'Can I regenerate a workout I do not like?',
        a: 'Yes, while you have full plan generations left that month. The banner shows how many are left and when they reset. You can always edit a plan by hand or ask AI Coach for tweaks.',
      },
      {
        id: 'offline',
        q: 'Do exercise videos work offline?',
        a: 'No, videos stream. Your written plan still works without a connection.',
      },
      {
        id: 'health',
        q: 'Does it sync with Apple Health or Google Fit?',
        a: 'Not today. Progress history is built from what you log: workouts, check-ins, nutrition and progress photos.',
      },
      {
        id: 'delete',
        q: 'How do I delete my account?',
        a: 'Settings, then Delete account. It is permanent, so save anything you need first.',
      },
    ],
  },
];
