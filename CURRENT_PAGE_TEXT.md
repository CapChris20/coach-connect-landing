# Every word on the site right now

Top to bottom, exactly as it appears. Fix whatever's wrong and hand it back.

Browser tab title: Coach Connect — Find your coach. Run your business. One app.

---

## Nav bar

- COACH CONNECT (logo)
- Home (glides to hero)
- Account (glides to waitlist — placeholder)
- For trainers (opens /for-trainers page)
- For clients (opens /for-clients page)
- FAQs (glides to FAQs)
- Contact us (glides to waitlist — placeholder)
- Get Started (button — glides to waitlist)

## Hero

- Left column: COACH / CONNECT (stacked title), **One Day or Day One.** (tagline under it), 3D CC logo (bouncing) under both
- Right column: Apple Watch-style card (stretched wide, band running the full hero height up toward the nav), whose screen reads:
  - **All in one app**
  - Find trainers — In the marketplace · Track progress — Photos + history
  - Exercise help — Plans + AI Coach · Log nutrition — Barcode · cross-checked
  - Messaging — Message your coach · In-app payments — Through Stripe
  - Scheduling — Book sessions · AI Coach — Asks before changes
  - COACH CONNECT (mini wordmark at the bottom of the screen)
- (headline, pitch paragraph, and buttons were removed Oct 19 — new hero text to come from owner)

## Scrolling ribbon

- Find your coach · Run your business · One app · No per-client fees · AI that asks first · Plans · Nutrition · Payments (repeats)

## 01 — What is Coach Connect?

- 01 · What Is Coach Connect
- **What is Coach Connect?**
- Coach Connect is the all-in-one app for coaching. Trainers run their whole business from it — and clients get their coach, their plan, and their progress in one place.
- Find a trainer in the marketplace. Follow workout plans, log nutrition with a barcode scan, message your coach, book sessions, and pay in the app — while the AI Coach handles the day-to-day logging and asks before it changes anything.
- Buttons: **For Trainers** (opens /for-trainers) · **For Clients** (opens /for-clients)

## 02 — FAQs

- 02 · FAQs
- **Questions, answered.**
- The short version of everything people ask before joining the waitlist.
- (Tap a question to open its answer. Starter Q&A written from page facts — owner to replace with the real ones.)

Questions:

- **When does Coach Connect launch?** — Coach Connect is coming soon — we open late 2026, founding trainers first. Join the waitlist below and you will hear from us before the doors open.
- **How much does it cost?** — Coach Connect Pro is $59.99/mo, or $49/mo billed annually at $588/yr (Save $132/yr). Every plan starts with a 3-day free trial.
- **Is there a per-client fee?** — No. One flat price covers your whole roster — there are no per-client fees as it grows. Coach Connect takes a 10% platform fee per payment. Stripe's standard card processing fees also apply.
- **I'm a client — do I pay for the app?** — The app is free for clients. You find your coach in the marketplace, follow your plan, log your nutrition, and pay your coach in the app.
- **What does the AI Coach do?** — It can log a meal, water, sleep or steps for you, or edit a workout — and it asks you to confirm before anything changes.
- **How do payments work?** — Clients pay through Stripe right in the app. No payment links over DM, no separate invoicing tool — payouts are part of the same system as the coaching.

## 03 — Subscription

- 03 · Subscription
- **Everything included. One price.**
- One flat price, no per-client fees. One subscription runs the whole practice.

Pricing box:

- COACH CONNECT PRO
- $59.99/mo
- Annual: $49/mo, billed $588/yr — Save $132/yr
- 3-day free trial
- No per-client fees
- AI workout plans (3 per month)
- Nutrition tracking
- Progress photos and history
- Messaging
- Start free trial (button)
- Clients use the app free and pay their coach in the app. Coach Connect takes a 10% platform fee per payment. Stripe's standard card processing fees also apply.

Wide tile:

- **Get paid in the app.**
- Clients pay through Stripe right in the app. No payment links over DM, no separate invoicing tool — payouts are part of the same system as the coaching.

Small tiles:

- **No per-client fees** — One flat price as your roster grows.
- **AI workout plans** — Three AI-built plans included each month.
- **Nutrition tracking** — Cross-checked numbers, plus barcode scanning.
- **Progress photos and history** — Photos and history, kept in one place.
- **Messaging** — Client messaging beside plans and payments.

## 04 — Waitlist (finale)

- 04 · Waitlist
- COMING SOON · LATE 2026 (chip above the headline — wording to confirm)
- **One Day or Day One!**
- Join the waitlist to register ahead of time. When Coach Connect opens, founding trainers and their clients are first in.
- Email field ("you@example.com") + **Join the waitlist** button
- Error if the address looks wrong: "That email doesn't look right — check it and try again."
- After joining: "You're on the list. We'll email you when Coach Connect opens."
- One email when we open. The app is free for clients; coaches start with a 3-day free trial.
- OR SKIP THE LINE (divider)
- LIVE · IOS BETA chip — **Can't wait 'til late 2026? Good — don't.** Coach Connect is already on iPhones through TestFlight. Grab the beta now, sign in with the login you just made above, and make today Day One — rough edges, early features, and all.
- **Get the beta** button (Apple icon — opens https://testflight.apple.com/join/rArzZF5v in a new tab; URL lives in `src/config/siteConfig.js` as `TESTFLIGHT_URL`)
- Steps: 1 Tap "Get the beta" · 2 Install TestFlight — Apple's free beta app · 3 Open Coach Connect & sign in — Opens in Apple TestFlight · about 2 minutes · no waitlist spot needed
- See how it works (button — glides back up to section 01)
- NOTE: the form's save is a stub for now (see src/waitlist/saveWaitlistEmail.js) — Firestore hookup is one function swap once credentials are confirmed.

## Footer

- COACH CONNECT
- © 2026 Coach Connect
- Privacy
- Terms

---

## Separate pages

### /for-trainers (placeholder — owner's layout comes next)

- FOR TRAINERS
- **The trainer page is on its way.**
- We're building the full trainer breakdown — the marketplace, your roster, scheduling, and getting paid in the app. Until it lands, join the founding trainer waitlist.
- Buttons: Join the waitlist · Back to home

### /for-clients (placeholder — owner's layout comes next)

- FOR CLIENTS
- **The client page is on its way.**
- We're building the full client breakdown — finding your coach, following your plan, and logging nutrition. Until it lands, join the waitlist and we'll tell you when it opens.
- Buttons: Join the waitlist · Back to home

## Parked sections (built, not on the homepage — seed copy for the pages above)

### For Clients chapter

- 02 · For Clients
- **Your coach, in your pocket.**
- Find a trainer, follow your plan, log meals with a barcode scan, and message your coach in one place. Your AI Coach can log a meal, water, sleep or steps, or edit a workout, and it asks you to confirm first. The app is free. You pay your coach in the app.
- Cards: **Find your coach** — Search the marketplace and match with a real human coach. · **Log everything** — Log meals with a barcode scan, and track workouts, water, sleep and steps. · **AI Coach** — Ask it to log a meal or edit a workout — it confirms with you before anything changes.

### For Trainers chapter (rotating cards)

- 03 · For Trainers — Best Use Cases
- **Stop running your business out of five apps.**
- Your roster and client history, messaging, notes and files, a built-in document and spreadsheet editor, session scheduling and weekly reports, plus in-app Stripe payouts. One flat price, no per-client fees. Coach Connect takes a 10% platform fee per payment. Stripe's standard card processing fees also apply.
- ONLINE COACH — **A roster in your pocket** — Your roster, client history, plans and messages for a fully remote client list — in one app, not five.
- IN-PERSON PT — **Sessions + homework, one thread** — Schedule sessions, program the work between them, and see check-ins as they land — no more "did you go?" texts.
- HYBRID COACH — **Both lanes, one system** — In-person and online clients share plans, messaging and scheduling. Clients pay you in the app through Stripe.
- NUTRITION COACH — **Food logging clients finish** — Barcode scanning makes logging fast, and the nutrition numbers are cross-checked across multiple databases.

### Why Coach Connect list

- 04 · Why Coach Connect
- **Built different, on purpose.**
- Everything a coaching relationship needs, without the duct-tape stack.
- 01 — One flat price, no per-client fees
- 02 — AI Coach with 15 actions, each behind a confirmation step
- 03 — Nutrition numbers cross-checked across multiple databases, plus barcode scanning
- 04 — Built-in document and spreadsheet editor for your coaching files
- 05 — Weekly reports built from real check-ins, exportable to PDF
