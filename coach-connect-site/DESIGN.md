# DESIGN.md: Coach Connect site (v3, as built)

This describes the site as it is now built in `coach-connect-site/`, live at
https://capchris20.github.io/coach-connect-landing/. It replaces the two earlier
DESIGN.md versions (the "premium, restrained" one and the ShaderXD method). Where those
disagree with this file, this file wins.

**Order of precedence:** the frozen hero (section 1), then the hard bans (section 3),
then everything else.

---

## 0. The direction in one paragraph

A poster site. Big uppercase display type, flat blocks of black, cream, pink and orange,
torn-paper seams, chunky buttons, small mono labels, and the real app recordings as the
visuals. Below the hero it is calm: one idea per section, one thing moving at a time, plenty
of space. The homepage hero is the one loud, animated moment and is frozen.

The brief behind it (Shane): the homepage had "too much on it" and looked "vibe coded".
The answer was to keep the poster look and cut volume: fewer sections, fewer effects, no
ambient motion, no repetition.

---

## 1. The hero is frozen

The first screen of `/` is copied from the original site and must not change: the
COACHCONNECT title plate, the "currently playing" phone, the swaying 3D CC logo, the watch
with its band and case picker, the pointer-lit pink grid, the Scroll pill, and all of their
animation. The sticky nav is part of that first screen and is frozen too.

How it is protected:
- `src/styles/hero.css` pins its own values on `.home-hero` (`--bg: #0b0a0d`, fonts, grid
  colours), so site token changes cannot reach it.
- The nav pins `--nav-muted`, `--nav-accent`, `--nav-cta` in `site.css`.
- `body` stays `#0b0a0d` because the glass nav blurs whatever sits behind it.
- `Watch.jsx` takes an optional `faceTitle` prop. The hero passes nothing and keeps the
  original face. Other pages may pass a title.
- Hero-only files: `HomeHero.jsx`, `HeroPhone.jsx`, `Logo3D.jsx` (sway mode), `Watch.jsx`,
  `hero.css`, `watch.css`. Treat them as read-only.

**Rule:** any change to a shared component, token or global CSS must leave the hero
pixel-identical. Check with a screenshot diff at 1440px and 390px, with reduced motion on
and a fixed clock (so the video, sway and watch time are still). The hero crop must
produce an empty diff.

The hero is allowed to break the rules below (gradient wordmark, pointer-lit grid, violet
in the 3D logo, ambient loops). Nothing else is.

Known issue left in place: the hero phone recordings (`videos/app-client-side.mp4`,
`videos/app-trainer-side.mp4`) show the real names "Cade" and "Chris". Swapping them
means changing the hero, so it needs an explicit decision.

---

## 2. Tokens

Defined once in `src/styles/base.css`. Components read tokens only.

| Token | Value | Use |
|---|---|---|
| `--bg`, `--ink` | `#0a0a0f` | Dark sections, text on light sections |
| `--surface`, `--surface-2` | `#1f1c24`, `#2b2731` | Panels on dark (about 10% lighter, so they separate) |
| `--paper`, `--paper-2` | `#f3ede2`, `#e6dccb` | Cream sections, torn-edge sheets |
| `--purple` | `#5b16f0` | Primary button and aurora only |
| `--pink` | `#c03c98` | Flat fields. **White text only** on it |
| `--orange` | `#f59a33` | Flat fields. **Ink text only** on it |
| `--orange-deep` | `#b45309` | Orange numerals on cream (passes 4.5:1) |
| `--text`, `--text-body`, `--text-muted` | white at 100 / 88 / 72% | Text on dark. 72% still passes 4.5:1 |
| `--ink-body`, `--ink-muted` | `#26222b`, `#4d4655` | Text on cream and orange |
| `--cta` | purple to pink, 135deg | Primary button fill |
| `--aurora` | purple, pink, orange radials over `--bg` | Final call-to-action section only |

Fonts (bundled with `@fontsource`, only the weights used):
- **Display:** Unbounded 700/800, uppercase, tight tracking. Headlines, numerals, card titles.
- **Body:** Plus Jakarta Sans 400/500/700. Paragraphs, buttons, form text.
- **Mono:** Space Mono 400/700, 12px uppercase, tracking .08em. Nav links, small labels, stamps.

Spacing: 4px base, `--space-1` to `--space-10` (4, 8, 12, 16, 24, 32, 48, 64, 96, 128).
Nothing else.

---

## 3. Hard bans

| Banned | Instead |
|---|---|
| Purple to blue, or any blue | Brand hues only |
| Gradient text, except one accent word per page in the final call to action | Solid colour, weight or size |
| A gradient on cards or on every section | Flat fields |
| Glass cards on flat colour, stacked glass, more than 3 glass elements on screen | The nav is the only glass on the site |
| Ambient loops below the hero (drifting shapes, flip boards, floating, pulsing, animated canvases) | Still visuals; motion only on user action |
| Fade-in or reveal on scroll | Content is visible on first paint |
| Cursor-following glows below the hero | Hover effects on controls only |
| Three identical cards in a row | Unequal sizes, numbered lists, staggered layouts |
| Emojis, em dashes, buzzwords (seamless, cutting-edge, unlock, supercharge, game-changer, all-in-one) | Plain, specific copy |
| Real people's names anywhere, including inside recordings | Fictional names, or a different clip |
| Fake stats, testimonials, user counts | Facts that are true today; "Example data" stamps on mock data |
| Buttons that only fade on hover | Hover moves something; press drops; focus ring shows |

---

## 4. Type scale

| Class | Size | Use |
|---|---|---|
| `.t-band` | `clamp(38px, 7.4vw, 112px)` | Inner page H1 |
| `.t-title` | `clamp(36px, 7.2vw, 108px)` | Section titles |
| `.t-title-narrow` | `clamp(36px, 5.2vw, 80px)` | Titles in a narrow column |
| `.t-reel` | `clamp(34px, 6.4vw, 104px)` | Tour scene captions |
| `.t-cta` | `clamp(44px, 10vw, 150px)` | Final call-to-action heading |
| `.t-h2` | `clamp(26px, 3.6vw, 44px)` | Group headings (FAQ) |
| `.t-card` | `clamp(22px, 2.2vw, 30px)` | Card and list titles |
| `.t-numeral` | set per use | Big step numbers |
| `.lead` | `clamp(18px, 1.5vw, 21px)`, max 560px | One-line intros |
| body | 18px / 1.55, max 62ch | Paragraphs |
| `.mono` | 12px | Labels, stamps |

Display type is uppercase, line height under 1, negative tracking. One `<h1>` per page.
Test the longest headline at 360px.

---

## 5. Building blocks

- **Section:** `.scene` plus one of `.scene-dark`, `.scene-paper`, `.scene-pink`,
  `.scene-orange`. Padding is `--section-pad` top and bottom: 128px desktop, 96px under
  768px. **Every section below the hero uses this one padding.**
- **Inner page opener:** `PageBand` (title, lead, optional aside and background).
- **Torn edge:** `TornEdge` with three sheet colours; the last one matches the next section.
- **Poster card:** `.poster` = solid fill, 2px ink border, hard `7px 7px 0` shadow,
  optional `--tilt`. Hover lifts, press drops.
- **Panel:** `.panel` = solid `--surface`, no hairline border. Forms sit in one.
- **Buttons:** `.btn-primary` (purple to pink, white text), `.btn-ink` (solid ink on light
  sections), `.btn-ghost` (on dark). Min height 52px, pill. Hover moves up 2px; press drops
  4px with the spring ease. `.link` = text with an underline that sweeps in.
- **Phone:** `Phone` = CSS iPhone frame around a real recording. Plays only on screen,
  pauses off screen, shows the poster until it can play, still frame under reduced motion.
- **Toggle:** `.toggle` pill group, selected option orange with ink text.
- **Accordion:** one open at a time, `size="lg"` for big editorial rows.
- **Stamp:** `.stamp` dashed mono label, used for "Example data".

---

## 6. Gradient and glass budget

| Allowed | Where | Limit |
|---|---|---|
| Purple-to-pink fill | `.btn-primary` | One primary button per view |
| Aurora | `JoinSection` (id `waitlist`) background | One per page, final section only |
| Gradient accent word | `JoinSection` heading (`accent` prop) | One per page |
| Glass | The sticky nav | The only glass element |
| Hero exceptions | Hero only | Frozen, see section 1 |

---

## 7. Motion

- Below the hero, **nothing moves on page load or on its own.**
- Allowed, all user-triggered, at most three kinds per page: accordion opening, toggle
  switching (the step cards re-animate only after a switch), a tour scene changing (the
  caption animates only after the first change).
- Videos play once through their list and then rest; replay is on user action. They pause
  off screen.
- Canvases below the hero (isometric blocks, ASCII sun) render once with
  `useCanvasLoop(draw, { still: true })` and redraw only on resize.
- Animate `transform` and `opacity` only. Hover motion is gated to
  `(hover: hover) and (pointer: fine)`.
- `prefers-reduced-motion: reduce` removes every transition and animation site-wide.
- Removed and not to come back: per-letter heading reveals, route fade, wireframe
  background, moving Bauhaus shapes, the split-flap board, the stepped wipe.

---

## 8. Layout rules

- One idea per section. No two neighbouring sections share a layout.
- No row of three identical cards.
- **At most two tilted elements per page.** Currently: homepage = the phone in "One app"
  and the Trainers poster card; /trainers = the tour phone and the price card;
  /clients = the explorer phone and the "Example data" stamp.
- **At most one phone mockup per section.** Vary angle and crop between sections, and
  never show the same recording in neighbouring sections.
- Two-column layouts collapse to one column at 980px.
- Content max width 1240px, gutters `clamp(20px, 4.5vw, 64px)`.
- No horizontal scroll at 360px.

---

## 9. Page map

| Route | Sections below the opener |
|---|---|
| `/` | Hero (frozen) · One app. Two sides. (dark, phone on an orange disc, Client/Trainer toggle) · Pick your side. (cream, two unequal poster cards with stills) · Before you ask. (dark, 4 FAQ items, link to /faq) · Final call to action |
| `/trainers` | Band over still isometric blocks · pinned trainer tour (4 recordings) · pricing (cream, poster price card left, copy and the two text-only features right) · Final call to action |
| `/clients` | Pink band · What you get (cream, numbered list plus one phone) · Three things a day (orange, watch with `faceTitle`, big numerals) · Final call to action |
| `/nutrition` | Band over a still halftone dot field · Three ways in (cream, steps plus one straight cropped phone) · Numbers worth coaching from (orange, numbered 2x2) · Final call to action |
| `/how-it-works` | Orange band with the draggable 3D phone · Four steps (staggered cards, I train / I coach toggle) · Final call to action |
| `/faq` | Pink band with a torn edge · every question by topic (cream) · Final call to action |

Every page ends with the ASCII-sun footer (still). Old URLs `/for-trainers`,
`/for-clients`, `/for-both` and `/faqs` redirect.

**Homepage budget:** hero plus four sections, no more. A new idea goes on its own page.

---

## 10. Media

- Use only `public/videos/clean/`. Each clip has a matching `.jpg` poster.
- `media-source/` holds the untouched originals. Several show real names (account names,
  roster entries, trainer cards, YouTube creators). The site never serves them.
- Making a new clip: trim with ffmpeg from `media-source/`, then check **every** frame,
  first and last included. Names often sit in the first or last second. Export the first
  frame as the poster.
- Stills for poster cards (`still-trainer.jpg`, `still-client.jpg`) must come from a
  different clip than the neighbouring section plays.
- No name-free recording exists yet for the trainer home and the roster. Those two
  features are text on /trainers until the app is re-recorded with demo accounts.
- The Abraham Lincoln quote appears only in the hero recording, which is frozen.

---

## 11. Copy

- Say what it does, for whom, with specifics. Short sentences. True today.
- No em dashes, emojis or buzzwords (section 3). No invented numbers, testimonials or
  user counts. Mock data carries an "Example data" stamp.
- All copy and clip paths live in `src/data/content.js`.
- Facts in use: Pro is $59.99 a month or $49 a month billed yearly ($588, saves $132);
  3-day free trial; no per-client fees; 10% platform fee plus Stripe card fees; free for
  clients; launch late 2026; iOS beta on TestFlight.

---

## 12. Accessibility

- Text contrast at least 4.5:1 (3:1 for large text), mono labels included. Pink fields
  take white text, orange and cream take ink.
- Focus: 3px outline in the current colour, forced to ink on cream and orange sections.
- Touch targets at least 44px. The watch picker dots off the hero have an invisible 44px
  hit area.
- Real `<button>` and `<a>`, labelled fields, alt text on stills, `aria-hidden` on
  decoration, one `<h1>` per page, unique title and description per page (`Seo`).

---

## 13. Signup form (behaviour is fixed, style may change)

Files: `src/waitlist/`. Do not change the Firebase config, the `anatrox-auth` project, the
rules or the account logic without the owner's sign-off. On submit it:
1. creates a real Firebase Auth login (email and password) in `anatrox-auth`, the same
   project the app uses,
2. sets the display name,
3. writes `users/{uid}` with `name`, `email`, `onboardingCompleted: false`, `createdAt`,
   `source: "landing_waitlist"`, `signedUpAt`,
4. signs the browser out.

The I coach / I train choice is not stored; the app asks for the role during onboarding.
Firebase keys come from `.env.local`; without them the form says sign-up is not connected
(this is the state of the live GitHub Pages build).

---

## 14. Builds and deploy

| Command | Output | For |
|---|---|---|
| `npm run dev` | dev server | Local work |
| `npm run build` | `dist/` | Any host at the domain root |
| `npm run build:pages` | `dist-pages/` | GitHub Pages under `/coach-connect-landing/`; adds `404.html` so deep links work |
| `npm run build:artifact` | `dist-artifact/` | claude.ai artifact (in-memory routing, models as `.glb.json`) |

Live deploy: push the contents of `dist-pages/` to the `gh-pages` branch. GitHub Pages
publishes it automatically.

---

## 15. Review gate (every change, every page)

- [ ] Hero diff at 1440px and 390px is empty.
- [ ] Homepage has the hero plus at most four sections.
- [ ] Nothing below the hero moves on load or on its own; reduced motion works.
- [ ] No neighbouring sections share a layout; at most two tilts; one phone per section.
- [ ] Gradient and glass only where section 6 allows.
- [ ] Every section uses `--section-pad`.
- [ ] Contrast passes, focus visible, targets 44px, no horizontal scroll at 360px.
- [ ] One h1, unique title and description.
- [ ] Copy scan: no em dashes, emojis, buzzwords or real names (open every accordion).
- [ ] Every clip on the page comes from `videos/clean/` and was checked frame by frame.
