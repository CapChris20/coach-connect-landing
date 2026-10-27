# Coach Connect site (v2)

A second Coach Connect marketing site. The homepage hero matches the first site (phone, 3D CC logo, watch).
Everything after it follows the updated DESIGN.md (ShaderXD method): each section is its own scene, type is
oversized, pink and orange are used as whole fields, dark scenes alternate with light paper, and the real app
recordings are the hero of each section.

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

| Route | Scenes |
|---|---|
| `/` | Hero (first site) · one app, two sides (oversized phone, big orange circle) · pick your side (paper, poster cards) · pinned scroll reel through five client recordings over a wireframe · three things a day (watch on orange) · four steps over Bauhaus shapes · FAQ on paper · waitlist on pink |
| `/trainers` | Band over isometric blocks · pinned trainer reel · pricing poster card · waitlist on orange |
| `/clients` | Band with a split-flap board · feature list with phone on paper · watch on pink · waitlist |
| `/nutrition` | Band over halftone dots · three ways to log · why the numbers hold up (orange) · waitlist |
| `/how-it-works` | Orange band with the draggable 3D iPhone · four steps · waitlist |
| `/faq` | Pink band torn into paper · every question · waitlist |

Every page ends on the ASCII-sun footer. Old URLs (`/for-trainers`, `/for-clients`, `/for-both`, `/faqs`) redirect.

## Where things live

- `src/styles/base.css`: tokens, the three type sizes, buttons, panels, poster cards
- `src/styles/hero.css`, `src/styles/watch.css`: the homepage hero and the watch, ported from the first site
- `src/backgrounds/`: wireframe, isometric blocks, ASCII sun, split-flap, Bauhaus shapes, torn edge, plus shared canvas plumbing (lazy mount, DPR cap, reduced-motion still frame)
- `src/styles/site.css`: layout for every component and page
- `src/data/content.js`: all copy, clip paths, pricing and FAQ. Edit words here.
- `src/components/`: HomeHero, Reel (pinned scroll reel), Kinetic (per-letter headings), PageBand, WatchScene, StepsScene, Phone, Watch, Logo3D, Phone3D, Accordion, JoinSection
- `src/waitlist/`: Firebase sign-up, ported from the first site

three.js and Firebase load only when needed (3D pieces are lazy, Firebase loads on submit).
