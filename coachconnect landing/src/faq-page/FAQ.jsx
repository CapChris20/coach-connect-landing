// FAQ.jsx — Redesigned FAQ section for Coach Connect
// Accessible, responsive, quiet-glass cards with gradient rims, icon discs,
// filter chips, and interactive grid background integration.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  Smartphone,
  CircleHelp,
  HelpCircle,
  Plus,
  ArrowRight,
} from 'lucide-react';
import MouseGridBackground from '../animations-and-backgrounds/MouseGridBackground';
import './faq.css';

const QuestionIcon = CircleHelp || HelpCircle;

export const GROUPS = [
  {
    id: 'payments',
    title: 'Payments & billing',
    chipLabel: 'Payments',
    icon: Wallet,
    accentA: 'var(--c-a)',
    accentB: 'var(--c-b)',
    items: [
      {
        id: 'pay-1',
        question: 'How much do trainers earn and when?',
        answer:
          'For in-app client payments, you receive 90% of each charge. Coach Connect keeps a 10% platform fee. Stripe sends payouts to your linked bank account, typically within 2–5 business days. See Earnings & payouts in Settings or the Payments tab for history.',
      },
      {
        id: 'pay-2',
        question: 'Why not just use Venmo?',
        answer:
          'You can arrange Venmo outside the app, but Coach Connect payments give you automatic bank deposits, a permanent dashboard history (great for taxes), professional records, and less chasing clients for payment.',
      },
      {
        id: 'pay-3',
        question: 'Do I have to use Coach Connect payments?',
        answer:
          'No, but you lose automatic payouts and clear records that make running a coaching business easier.',
      },
      {
        id: 'pay-4',
        question: 'Is a client payment the same as Coach Connect Pro?',
        answer:
          'No. Client coaching payments are one-time charges from clients to you. Coach Connect Pro is a separate monthly trainer subscription for platform features.',
      },
      {
        id: 'pay-5',
        question: 'How do clients pay their coach?',
        answer:
          'Linked clients tap Pay on the dashboard or use Settings → Billing → Add payment method. Payments are processed securely by Stripe and saved in payment history.',
      },
    ],
  },
  {
    id: 'using-the-app',
    title: 'Using the app',
    chipLabel: 'Using the app',
    icon: Smartphone,
    accentA: 'var(--c-b)',
    accentB: 'var(--c-c)',
    items: [
      {
        id: 'app-1',
        question: 'What is the dashboard and what does it show?',
        answer:
          'The dashboard is your full picture for the week: workouts, check-ins like energy and soreness, and tracking you keep up (like sleep, water, and calories when you log them). Home is the snapshot; “Your Complete Dashboard” is the deeper hub for workouts, progress, and history.',
      },
      {
        id: 'app-2',
        question: 'How do I generate a workout?',
        answer:
          'Open the workout planner from your training area. Answer the setup questions, then generate a new weekly-style plan. You can view it, edit it, export it, or run an active workout from it.',
      },
      {
        id: 'app-3',
        question: 'Can I regenerate a workout if I don’t like it?',
        answer:
          'Yes, if you still have full plan generations left this month. There’s a monthly limit on brand-new full plans (the banner shows what’s left and when it resets). If you’re out, you can still edit the plan, use AI Coach for tweaks, or wait for the reset.',
      },
      {
        id: 'app-4',
        question: 'What’s in the exercise library and how do I use it?',
        answer:
          'The Exercise Library tab is next to your plans. It’s built around searchable exercise videos for demos and technique. Search, watch, and save favorites for later.',
      },
      {
        id: 'app-5',
        question: 'How do I filter exercises in the library?',
        answer:
          'Use the search bar (muscles, equipment, goals, names). Use the chips and level/equipment hints to narrow results. It’s search plus smart narrowing, not a rigid spreadsheet.',
      },
      {
        id: 'app-6',
        question: 'Can I watch exercise videos without internet?',
        answer:
          'Usually no—videos stream online. Your written plan still works offline; the video library needs a connection.',
      },
      {
        id: 'app-7',
        question: 'How do trainers create workout plans for their clients?',
        answer:
          'Trainers use the client workout plans area: plans are stored on that client in the app. Trainers review and manage those plans there. Clients can also generate plans in their own planner.',
      },
      {
        id: 'app-8',
        question: 'How do trainers manage multiple clients?',
        answer:
          'Through the trainer tools: client list, messaging, scheduling, requests, and per-client areas like notes, nutrition views, progress, and workout plans.',
      },
      {
        id: 'app-9',
        question: 'Can trainers set their own prices?',
        answer:
          'Trainer profiles can show a listed monthly-style price in Find trainers, and search can sort or filter by price when that info exists. The app displays what the trainer entered; it doesn’t negotiate or charge for you.',
      },
      {
        id: 'app-10',
        question: 'How do athletes find trainers in their area?',
        answer:
          'Use Find trainers: browse, search, and filter (specialty, session type, experience, price when listed). Location is what the trainer put on their profile, not automatic GPS matching.',
      },
      {
        id: 'app-11',
        question: 'What happens when I request a trainer?',
        answer:
          'Your request goes to their pending requests. They accept or decline. After you’re linked, messaging, shared files, and scheduling work the way your coach uses the app.',
      },
      {
        id: 'app-12',
        question: 'What’s the difference between a real trainer and AI Coach?',
        answer:
          'Your trainer is a person: messages, sessions, files, photos they review. AI Coach is the in-app assistant for training and nutrition habits, with daily limits and a focused scope. Your coach does not automatically see AI Coach chats.',
      },
      {
        id: 'app-13',
        question: 'How does progress tracking actually work?',
        answer:
          'From completed workouts (including active sessions you finish), daily check-ins on the dashboard, nutrition logs, and optional progress photos in the trainer flow. There is no Apple Health / Google Fit sync in the current app—what you log is what the history uses.',
      },
    ],
  },
  {
    id: 'more',
    title: 'More common questions',
    chipLabel: 'More',
    icon: QuestionIcon,
    accentA: 'var(--c-c)',
    accentB: 'var(--c-a)',
    items: [
      {
        id: 'more-1',
        question: 'Why are my “Nutrition Today” rings empty on home?',
        answer: 'Log food in Nutrition; the home card pulls from that.',
      },
      {
        id: 'more-2',
        question: 'Why did AI Coach say I hit a daily limit?',
        answer:
          'There’s a per-day cap on AI Coach messages so the service stays reliable. Try again tomorrow.',
      },
      {
        id: 'more-3',
        question: 'Why won’t AI Coach answer my non-fitness questions?',
        answer: 'It stays in fitness, nutrition, and healthy habits on purpose.',
      },
      {
        id: 'more-4',
        question: 'What is the “Time to workout!” notification?',
        answer:
          'If you see a workout reminder notification, it’s coming from your device notifications. The wording is set by the app.',
      },
      {
        id: 'more-5',
        question: 'How do I delete my account?',
        answer:
          'Settings → Delete account. Treat it as permanent; save anything important first.',
      },
      {
        id: 'more-6',
        question: 'Is this medical advice?',
        answer:
          'No. For medical concerns, talk to a licensed professional.',
      },
    ],
  },
];

const FILTER_TABS = [
  { id: 'all', label: 'All' },
  ...GROUPS.map((group) => ({ id: group.id, label: group.chipLabel })),
];

export default function FAQ({
  waitlistHref = '/#act-finale',
  onJoinClick,
  supportEmail,
  id = 'act-faqs',
  className = '',
}) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [openQuestionId, setOpenQuestionId] = useState(GROUPS[0].items[0].id);

  const toggleQuestion = (questionId) => {
    setOpenQuestionId((currentOpenId) =>
      currentOpenId === questionId ? null : questionId
    );
  };

  const displayedGroups =
    activeFilter === 'all'
      ? GROUPS
      : GROUPS.filter((group) => group.id === activeFilter);

  return (
    <MouseGridBackground id={id} className={`landing-section-alt faq ${className}`}>
      <div className="faq-inner" data-testid="faq">
        {/* Left Column (Sticky on desktop >=1024px, heading on top and help card at end on mobile) */}
        <div className="faq-side">
          <header className="faq-header">
            <div className="faq-kicker">
              <i aria-hidden="true" />
              <span>Questions, answered</span>
            </div>

            <div className="faq-extrude">
              <h2 className="faq-title" data-testid="faq-title">
                <span className="faq-title-white">Questions,</span>
                <span className="faq-title-lit">answered.</span>
              </h2>
            </div>

            <span className="faq-rule" aria-hidden="true" />

            <p className="faq-lead" data-testid="faq-body">
              The short version of everything people ask before joining the waitlist.
            </p>
          </header>

          <aside className="faq-help" aria-label="Waitlist assistance">
            <h3 className="faq-help-title">Ready to start?</h3>
            <p className="faq-help-text">
              Join founding trainers and clients today. Be first through the door when we launch.
            </p>
            <Link
              to={waitlistHref}
              onClick={onJoinClick}
              className="faq-btn"
              data-testid="faq-waitlist-btn"
            >
              <span>Join the waitlist</span>
              <ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
            </Link>
          </aside>
        </div>

        {/* Right Column: Filter chips + Questions */}
        <div className="faq-main" data-testid="faq-list">
          {/* Filter chips */}
          <div className="faq-filters" role="group" aria-label="Filter FAQ questions">
            {FILTER_TABS.map((tab) => {
              const isSelected = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className="faq-chip"
                  aria-pressed={isSelected}
                  onClick={() => setActiveFilter(tab.id)}
                  data-testid={`faq-chip-${tab.id}`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Question groups */}
          {displayedGroups.map((group) => {
            const GroupIcon = group.icon;
            return (
              <section
                key={group.id}
                className="faq-group"
                aria-labelledby={`faq-grp-${group.id}`}
              >
                <div className="faq-group-head">
                  <span id={`faq-grp-${group.id}`} className="faq-group-label">
                    {group.title}
                  </span>
                  <span className="faq-group-line" aria-hidden="true" />
                  <span className="faq-group-count">
                    {String(group.items.length).padStart(2, '0')}
                  </span>
                </div>

                <ul className="faq-list">
                  {group.items.map((item) => {
                    const isOpen = openQuestionId === item.id;
                    return (
                      <li
                        key={item.id}
                        className="faq-item"
                        data-open={isOpen ? 'true' : 'false'}
                        style={{
                          '--card-accent': group.accentA,
                          '--grad-to': group.accentB,
                        }}
                        data-testid="faq-item"
                      >
                        <h3 className="faq-h">
                          <button
                            type="button"
                            className="faq-q"
                            onClick={() => toggleQuestion(item.id)}
                            aria-expanded={isOpen}
                            aria-controls={`faq-ans-${item.id}`}
                            id={`faq-btn-${item.id}`}
                            data-testid="faq-question"
                          >
                            <span className="faq-disc" aria-hidden="true">
                              <GroupIcon size={18} strokeWidth={2.2} />
                            </span>
                            <span className="faq-q-text">{item.question}</span>
                            <span className="faq-toggle" aria-hidden="true">
                              <Plus size={18} strokeWidth={2.4} />
                            </span>
                          </button>
                        </h3>

                        <div
                          id={`faq-ans-${item.id}`}
                          role="region"
                          aria-labelledby={`faq-btn-${item.id}`}
                          className="faq-a"
                          data-open={isOpen ? 'true' : 'false'}
                          data-testid="faq-answer"
                        >
                          <div className="faq-a-inner">
                            <p>{item.answer}</p>
                            {item.link && (
                              <a
                                href={item.link.href}
                                onClick={item.link.onClick}
                                className="faq-link"
                              >
                                <span>{item.link.label}</span>
                                <ArrowRight
                                  size={14}
                                  strokeWidth={2.2}
                                  aria-hidden="true"
                                />
                              </a>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}

          {/* Small footer line under the list */}
          <p className="faq-note" data-testid="faq-note">
            {supportEmail ? (
              <>
                Questions? Email{' '}
                <a
                  href={`mailto:${supportEmail}`}
                  className="underline text-white/70 hover:text-white"
                >
                  {supportEmail}
                </a>
                .{' '}
              </>
            ) : null}
            We can't give medical advice; for health emergencies, contact local emergency services.
          </p>
        </div>
      </div>
    </MouseGridBackground>
  );
}
