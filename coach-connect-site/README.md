# Coach Connect site (v2)

A second Coach Connect marketing site, built to the DESIGN.md brief: dark, calm, one signature moment per page,
short pages split by question. It reuses the first site's assets (app screen recordings, the dumbbell film,
the 3D CC logo, the 3D iPhone, the watch face and the Firebase waitlist), restyled to the new tokens.

The first site in `../coachconnect landing/` is untouched.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs dist/
```

Waitlist sign-up needs the Firebase web keys. Copy `.env.example` to `.env.local` and fill it in.
The first site's `REACT_APP_FIREBASE_*` names work as-is. Without keys the form says sign-up is not connected yet.

## Pages

| Route | Question it answers | Hero piece |
|---|---|---|
| `/` | What is it, and which side am I? (5 sections) | Dumbbell film with slow light sweep and parallax |
| `/trainers` | What does a trainer get, and for how much? | Feature tour with real recordings, pricing |
| `/clients` | What does a client get? | Feature tour, the watch face (example data) |
| `/nutrition` | How does food logging work? | Scan, search, macro rings recordings |
| `/how-it-works` | What are the steps? | 3D iPhone playing the app, drag to turn |
| `/faq` | Everything else | Grouped questions |

Old URLs (`/for-trainers`, `/for-clients`, `/for-both`, `/faqs`) redirect.

## Where things live

- `src/styles/base.css`: tokens, type scale, buttons, cards, glass, aurora (DESIGN.md sections 4 to 8)
- `src/styles/site.css`: layout for every component and page
- `src/data/content.js`: all copy, clip paths, pricing and FAQ. Edit words here.
- `src/components/`: Phone (CSS frame around recordings), FeatureExplorer, HeroSignature, Watch, Logo3D, Phone3D, Accordion, JoinSection
- `src/waitlist/`: Firebase sign-up, ported from the first site

three.js and Firebase load only when needed (3D pieces are lazy, Firebase loads on submit).
