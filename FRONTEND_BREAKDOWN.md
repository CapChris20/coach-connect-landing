# Coach Connect — Landing Frontend Breakdown (Handoff for Claude)

> **Purpose of this doc:** Give Claude (or any builder) the complete state of the Coach Connect
> landing page frontend — structure, every word of copy, 3D sections, background shader,
> known improvement ideas, and the planned Firebase waitlist — so the owner (Chris) can
> decide what to keep, cut, and add.
>
> **Owner decisions still needed are marked `OWNER DECISION:` throughout.**
>
> Working app: `frontend/` (CRA). Run with `cd frontend && yarn && yarn start` → http://localhost:3000
> Code style rule for any edits: follow `docs/INLINE_COMMENT_STYLE.md` (frame-depth inline
> comments — file-top summary, `// vocab:`, `// Manipulate here:`).

---

## 1. Product / Brand (never dilute)

Coach Connect is a two-sided coaching platform:

- **Trainers** run their business: CRM, plan builder, notes/files, in-app Stripe payments (they keep 90%).
- **Clients** find coaches in a marketplace, log training/nutrition, close wellness rings,
  message their coach, and use an AI companion with executable tools (log a meal, swap an exercise).

**Palette:**
- Void background `#0A0A0F` · elevated surface `#141419`
- Hot pink `#FF6B9D` (clients/energy) · soft purple `#C084FC` (AI/workouts)
- Cyan `#06B6D4` / `#64D2FF` (messaging) · orange `#F97316` (nutrition/CTA warmth)
- Green `#10B981` / `#34D399` (success/progress)
- CTA gradient: `#BE185D → #C2410C`
- Glass: fills `rgba(255,255,255,0.05–0.08)`, hairline borders `rgba(255,255,255,0.08–0.15)`

**Typography:** Syne 500–800 (display/brand) + Plus Jakarta Sans 300–700 (UI), Google Fonts.
Wordmark: "COACH" solid white / "CONNECT" pink→orange gradient, stacked, extrabold.

**Hard bans:** flat single-color backgrounds, purple→indigo SaaS gradients, cream/terracotta,
newspaper layouts, dashboard clutter/cards/stat-strips in the first viewport, promo badges,
rainbow blast.

---

## 2. Tech Stack (exact)

- react 19.2.0, react-dom 19.2.0, react-scripts (CRA, port 3000)
- three ^0.186.0, @react-three/fiber ^9.7.0, @react-three/drei ^10.7.8, three-stdlib
- framer-motion ^11, tailwindcss ^3.4.17, react-router-dom ^7.5.1, lucide-react ^0.507
- GLB assets served from `frontend/public/models/`:
  `cell_phone, metal_dumbell, food_cover_cloche, fiji_water_bottle, heart_emoji,`
  `lightning_bolt, deskcalendar, clipboard, coins, trophy`
- `gymbro.glb` exists in the source zip but is corrupted (broken skinning) — unused, do not add.
- Yarn 4 via corepack (`corepack yarn install`). System yarn 1 will fail on the lockfile.
- Production build verified: `corepack yarn build` → `frontend/build/`.
  SPA fallback files exist: `frontend/vercel.json`, `frontend/public/_redirects`.

---

## 3. File Map

```
frontend/
  public/
    models/                 10 GLB files listed above
    llms.txt                LLM-readable product summary
    _redirects              SPA fallback (Netlify / Cloudflare Pages)
  vercel.json               SPA rewrite fallback (Vercel)
  src/
    App.js                  Router — only route is "/" → Landing
    index.js                React root (StrictMode + BrowserRouter)
    index.css               Fonts, CSS vars, glass/CTA utilities, aurora fallback, keyframes
    pages/Landing.jsx       Composition: Seo, fixed Canvas (or aurora), Nav, 7 sections, Footer
    scene/
      Experience.jsx        <Canvas>, fog, lights, Rig (camera), ambient Sparkles, 7 acts
      models.jsx            ACTS=7, GAP=30, GLB loader/normalizer, ActGroup, all act scenes
      VoidAura.jsx          Background shader — Oxygene IV (see §6)
    hud/Overlays.jsx        ALL HTML copy: Nav, Hero, Captions, PricingPanel, FinaleCta, Footer
    hooks/useLanding.js     usePrefersReducedMotion, useScrollProgress
    components/Seo.jsx      Meta/OG/canonical/JSON-LD manager
docs/INLINE_COMMENT_STYLE.md  Required comment style for all code edits
.cursor/rules/inline-comment-style.mdc  Cursor rule pointing at the style doc
```

---

## 4. How It Works (architecture)

- Page is normal document flow: 7 sections × `min-h-screen` ≈ 700vh of scroll.
- Canvas is `position: fixed inset-0 z-0`; all HTML sits above at `z-10`.
- `useScrollProgress`: writes `scrollY / (scrollHeight − innerHeight)`, clamped 0..1,
  into a mutable ref on scroll/resize (rAF-coalesced). **No React re-renders** — critical for 60fps.
- Act `i` sits at `z = −i·30` (GAP=30). Camera home z=8.
- Rig (inside Canvas, `useFrame`):
  - `targetZ = 8 − progress·30·6` (8 → −172)
  - Camera position damped (`THREE.MathUtils.damp`, λ=2.5 for z, 1.5 for x/y)
  - Mouse parallax: `x = pointer.x·0.8`, `y = 0.3 + pointer.y·0.5` (window pointer listener,
    canvas itself is `pointer-events: none` so HTML owns clicks and no raycasting cost)
  - `camera.lookAt(0, 0, camera.z − 12)`
- Fog `#0A0A0F` near=9 far=42 → acts fade in/out of the void automatically.
- ActGroup per act: `f = progress·6 − index`; visible = `|f| < 1.6` (hard cull);
  `rotation.y = f·0.22`, `position.y = −f·1.4`. Child animations are gated on the same
  active flag (`ActActiveContext`) so off-screen acts cost almost nothing.
- GLB pipeline: `useGLTF` → `SkeletonUtils.clone` → center + uniform-scale to desired size
  → optional emissive brand tint. All models preloaded at module load.
- Reflections: PMREM + `RoomEnvironment` (three-stdlib), `environmentIntensity 0.55` — offline, no HDR fetch.
- Perf: canvas dpr `[1, 1.5]`, background shader rendered at ~0.55× into an FBO with a
  sharpen blit (see §6), frustum culling on for normal meshes, light `decay=2` on point lights.
- Reduced motion (`prefers-reduced-motion`): no WebGL at all — fixed `.aurora-static` div
  (4 layered radial gradients over `#0A0A0F`).
- SEO: title "Coach Connect — Find your coach. Run your business. One app.", canonical/OG
  derived from `window.location` (never hardcoded), JSON-LD SoftwareApplication, Offer $59.99 USD,
  exactly one `<h1>` (the wordmark).

---

## 5. Sections (scroll order = 3D act order)

| # | Anchor | HTML content | 3D act | Alignment / accent |
|---|--------|--------------|--------|--------------------|
| Nav | — | Wordmark, For Clients / For Trainers / Pricing, Get Started | — | fixed, blur, hairline border |
| 0 Arrival | `#act-arrival` | Hero (below) | `cell_phone` size 5.6 floating in pink neon torus ring; pink + cyan point lights | left, max-w-2xl |
| 1 Connection | `#act-connection` | Caption | Mini phone center; 2 glass human figures (sphere + capsule, pink/purple) orbit r=3.2; 4 dashed neon bezier threads (pink/purple/cyan/orange) | left, purple accent |
| 2 Client Lane | `#act-client` | Caption | Metal dumbbell center-left; orbiting cloche (nutrition), water bottle, heart, lightning bolt (AI companion), each bobbing + spinning | right, pink accent |
| 3 Trainer Lane | `#act-trainer` | Caption | Clipboard (purple tint) + desk calendar (orange tint) + glass chat bubble; 10 green particles stream into `coins` model (payments → trainer; pink coin shard on top = 10% platform fee) | left, purple accent |
| 4 Differentiators | `#act-diffs` | Caption + etched list | Phone center with 6 orbiting items (dumbbell, bolt, cloche, calendar, heart, chat bubble) at r=2.7 | right, cyan accent |
| 5 Pricing | `#act-pricing` | Glass pricing panel | `trophy` size 3.6 rotating, pink top light / orange bottom light rim | left panel, orange accent |
| 6 Finale | `#act-finale` | Finale CTA (center) | Large dumbbell size 3.8 tilted above, thin orange orbit ring, cyan sparkles | center |
| Footer | — | Mini wordmark, © 2026 Coach Connect, Privacy, Terms (links currently loop to `#act-arrival`) | — | — |

**Known redundancy (OWNER DECISION: keep / cut / merge?):** Act 1 (Connection) and Act 4
(Differentiators) are both "objects orbiting a phone." One is the natural merge/cut candidate.

Caption animation: framer-motion `whileInView`, y 50→0, opacity 0→1, 0.9s,
cubic-bezier(.22,1,.36,1), viewport once at 35%.

---

## 6. Background Shader (already implemented)

- File: `frontend/src/scene/VoidAura.jsx`
- Source: **"Oxygene IV" by Tonny Espeset (2024)** — https://www.shadertoy.com/view/4fsyDn
  (credit + link preserved in the file header; terrain + lake + aurora, audio stubbed).
- Port strategy: heavy shader renders at `BG_SCALE = 0.55` resolution into a manual
  `THREE.WebGLRenderTarget` (FBO), then a fullscreen blit applies a cheap unsharp mask
  (`uSharpen 0.42`) so it reads crisp without full-res cost. Main canvas stays dpr [1, 1.5].
- Current in-shader settings: MARCH_STEPS 96, terrain OCTAVES 4, AURORA_LAYERS 11,
  aurora peak exponent 1.5 (defined curtains, not fog).
- Do NOT use drei's `useFBO` here — it fails under this CRA/webpack setup
  ("useFBO is not a function"). The manual WebGLRenderTarget is deliberate.
- Scroll coupling: shader camera fly-through also advances with `uProgress`
  (page scroll), so the background evolves as you dolly through acts.

**Improvement options for the shader (OWNER DECISION):**
1. Brand-tune hue toward pink `#FF6B9D` / cyan `#06B6D4` / orange `#F97316`
   (current aurora leans green/purple like the original).
2. Darken left half / add vignette so white copy always pops over bright terrain.
3. Swap entirely (starfield, FBM nebula, plasma) — `VoidAura.jsx` is self-contained.
4. Tune knobs: `BG_SCALE` 0.45 = faster, 0.65 = sharper; march steps/octaves trade quality vs fps.

---

## 7. FULL COPY INVENTORY (every word on the page today)

### Nav
- Wordmark: `COACH CONNECT`
- Links: For Clients · For Trainers · Pricing
- Button: **Get Started** → `#act-finale`

### Hero (Act 0)
- H1 wordmark: `COACH` / `CONNECT` (stacked)
- Headline: **Find your coach. Run your business. One app.**
- Support: "Trainers and clients finally share the same system — plans, nutrition, messaging,
  payments, and optional AI tools."
- CTAs: **Get Started** (gradient pill → `#act-finale`) · **Browse the marketplace** (ghost, dumbbell icon → `#act-client`)
- Floating quote (bottom-right, rotated −4°, white/30): “One Day or Day One!”
- Scroll hint: "SCROLL TO ENTER" + pulsing chevron

### Act 1 — The Connection (caption, left)
- Eyebrow: `THE CONNECTION` (purple)
- Title: **Two people. One system.**
- Body: "Coach and client orbit the same core — plans, messages, check-ins and payments flow
  along the same thread. Relationships, not another calorie tracker."

### Act 2 — For Clients (caption, right)
- Eyebrow: `FOR CLIENTS` (pink)
- Title: **Find your coach. Stay accountable.**
- Body: "Browse the marketplace, log training and nutrition, close your wellness rings, and
  talk to an AI companion that actually does things: log a meal, swap an exercise."

### Act 3 — For Trainers (caption, left)
- Eyebrow: `FOR TRAINERS` (purple)
- Title: **Your whole business, in glass.**
- Body: "CRM, plan builder, notes, files, and payments in one place. Get paid in-app with
  Stripe — you keep 90% of every dollar you earn."

### Act 4 — Why Coach Connect (caption, right)
- Eyebrow: `WHY COACH CONNECT` (cyan)
- Title: **Built different, on purpose.**
- Body: "Everything a coaching relationship needs — without the duct-tape stack."
- Etched list (hairline dividers, colored dot bullets):
  1. Human marketplace + full CRM (pink)
  2. AI with executable tools, not a chatbot blob (purple)
  3. Nutrition consensus from multiple sources (orange)
  4. Notes, files, PDFs & spreadsheets — real depth (cyan)
  5. Week-in-review narratives that keep clients hooked (green)

### Act 5 — Pricing (glass panel, left)
- Eyebrow: `COACH CONNECT PRO` (orange)
- Price: **$59.99/mo** (Syne 5xl)
- Annual line: "Annual: $49/mo — billed $588/yr" + `Save 20%` green chip
- Trial line (cyan): "3-day free trial — no card games."
- Benefits (gradient dash bullets): Unlimited clients · AI workouts · Nutrition · Progress · Chat
- CTA: **Start free trial** (→ `#act-finale`, currently anchor only)
- Note: "Clients use the app free. They pay their coach in-app via Stripe — trainers keep
  90% of every payment."

### Act 6 — Finale (center)
- Headline: **One Day `or` Day One!** ("or" in gradient)
- Subline: "Start free. Build your roster. Keep 90%."
- CTAs: **Get Started** (→ `#act-pricing`) · **Browse the marketplace** (→ `#act-client`)

### Footer
- Mini wordmark · © 2026 Coach Connect · Privacy · Terms (both currently link to top — placeholders)

### Invisible / meta copy
- `<title>`: Coach Connect — Find your coach. Run your business. One app.
- Meta description: same as hero support line (via Seo.jsx).
- JSON-LD: SoftwareApplication, Offer $59.99 USD.
- `public/llms.txt`: LLM-readable product summary (product, pricing, brand, tagline).

### ⚠️ Conversion gap
Every CTA today is an **anchor link scrolling within the page**. There is no signup, email
capture, waitlist, or app-store link. The page currently converts to nothing — the waitlist
(§9) is the fix.

---

## 8. Improvement Ideas (discussed, not yet built)

Priority order suggested by current state:

1. **Waitlist with Firebase** — see §9. Gives every CTA a real destination.
2. **3D phones playing vertical MP4 video** — hero phone (Act 0) and/or a 3-phone fan
   showing app clips. Plan:
   - `THREE.VideoTexture` / drei `useVideoTexture` on a plane fitted inside the phone bezel
     (or swap the GLB screen material if it has a separate screen mesh — needs calibration).
   - `meshBasicMaterial` + `toneMapped={false}` so the screen glows like a real display.
   - Video: vertical 9:16, prefer 720×1280 H.264, `muted + loop + playsInline + autoplay`.
   - Same video on multiple phones = shared texture (cheap). Different videos = one decode
     each — max 2–3, and pause/play with the existing ActGroup active gate.
   - Poster-frame fallback for iOS Low Power Mode (autoplay blocked until interaction).
   - Assets would live in `frontend/public/videos/`. **OWNER DECISION: 1 phone or 3-phone
     fan? Same clip or different per phone (client app / trainer CRM / AI companion)?**
3. **Readability scrim** — subtle dark gradient behind left/right captions so white text
   never fights bright shader terrain.
4. **Social proof section** — one testimonial quote mid-scroll breaks the caption rhythm.
   **OWNER DECISION: real testimonials available yet?**
5. **How it works** — 3-step strip after Act 1 (Find coach → Get plan → Train + check in).
6. **FAQ section** before the finale — pricing objection, "clients pay nothing?", "why not texts/PDFs?".
   Draft questions exist implicitly in copy; owner to approve answers.
7. **Real Privacy / Terms pages** — footer links are placeholders today.
8. **Brand-tune the background shader** — see §6.
9. **App-store / TestFlight buttons** — only when builds exist; waitlist covers pre-launch.

**OWNER DECISION: which sections do you like / dislike?** (Especially Acts 1 vs 4 redundancy,
pricing placement, and whether the "One Day or Day One!" quote appears twice — hero + finale.)

---

## 9. PLANNED: Waitlist on the Existing Coach Connect Firebase

**Goal:** Landing page waitlist signups land in the *same* Firebase project as the Coach
Connect mobile app, so the waitlist becomes the launch invite list.

### Firebase facts (from the app repo — do not change)
- **Production Firebase project ID: `anatrox-auth`** (all app user data + auth live there).
- **NEVER** rename the project ID to match branding, and never bulk-replace `anatrox`.
- App web/native config lives in the app repo `.env` as `EXPO_PUBLIC_FIREBASE_*`
  (API_KEY, AUTH_DOMAIN, PROJECT_ID, STORAGE_BUCKET, MESSAGING_SENDER_ID, APP_ID).
- App Firebase init reference: `../7th-Project--Coach-Connect/src/app-start/cloudConnection.js`.

### Landing implementation plan
1. Add `firebase` (web SDK) to `frontend/package.json`.
2. `frontend/.env` (gitignored) with the same values re-prefixed for CRA:
   `REACT_APP_FIREBASE_API_KEY`, `REACT_APP_FIREBASE_AUTH_DOMAIN`,
   `REACT_APP_FIREBASE_PROJECT_ID=anatrox-auth`, `REACT_APP_FIREBASE_STORAGE_BUCKET`,
   `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`, `REACT_APP_FIREBASE_APP_ID`.
   (Firebase web config is safe to ship in the browser; security comes from Firestore rules.
   Never put admin/service-account keys in the frontend.)
3. New module `frontend/src/lib/waitlist.js`: init Firebase app (guard against double-init),
   export `joinWaitlist(email, role)` writing to Firestore.
4. **Collection: `landing_waitlist`**, doc ID = normalized email (trim + lowercase) —
   gives free duplicate handling via `setDoc`.
   Doc fields (only these):
   ```json
   {
     "email": "string, validated",
     "role": "trainer | client",
     "source": "landing",
     "createdAt": "serverTimestamp"
   }
   ```
5. **UI:** glass panel styled like the pricing card:
   - Email input + Trainer/Client role toggle + submit button (`.cta-primary`).
   - States: idle → loading (disabled, spinner) → success ("You're on the list 🏋️" style,
     brand voice) → error (invalid email, network, permission).
   - Client-side email validation before write; friendly duplicate message
     ("You're already on the list").
   - Placement (**OWNER DECISION**): (a) inside Finale replacing dead-end CTAs,
     (b) new section between Pricing and Finale, (c) both + hero "Join the waitlist" button.
     Suggested: hero secondary CTA + full form in the finale.
   - Small privacy line under the form ("One email at launch. No spam.").
6. **Firestore security rules** — append to the *app repo's* `firestore.rules` (deploy from
   the app repo with the Firebase CLI; do not disturb existing rules):
   ```
   match /landing_waitlist/{email} {
     allow create: if request.resource.data.keys().hasOnly(['email', 'role', 'source', 'createdAt'])
       && request.resource.data.email is string
       && request.resource.data.email.matches('^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$')
       && request.resource.data.role in ['trainer', 'client']
       && request.resource.data.source == 'landing'
       && request.resource.data.createdAt == request.time;
     allow read, update, delete: if false;
   }
   ```
   Note: with doc ID = email, a repeat signup is an *update*, which the rule denies —
   handle `permission-denied` on an existing doc as "already on the list" in the UI,
   or use `addDoc` + a uniqueness approach. Decide during implementation; do not loosen
   the read rule to check duplicates (that would leak the list).
7. **Optional later:** Firebase "Trigger Email" extension or a small Cloud Function to
   send a confirmation + notify Chris per signup; aggregate counter doc for
   "Join N+ coaches" social proof (only via function — public reads stay off).
8. On app launch: export `landing_waitlist` emails → invite/TestFlight list.

### Waitlist open questions (OWNER DECISION)
- Email only, or email + role (trainer/client)? (Suggested: + role, it segments the launch.)
- Also capture name / Instagram handle? (Suggested: no — friction kills conversion.)
- Where does the form live? (Suggested: finale + hero button.)
- Confirmation email now or later? (Suggested: later, with the launch email.)

---

## 10. Deployment / Domain Status

- Hosting target: free static hosting (Cloudflare Pages / Vercel / Netlify) from
  `frontend/build`. Framework preset: Create React App, build `yarn build`, output `build`.
- Domain status: owner wants a **one-dot** domain (e.g. `coachconnect.something`),
  not a two-dot subdomain like `coachconnect.pages.dev`.
  - Taken: `coachconnect.com`, `.app`, `.xyz`, `.online`, `.site`, `.space`, `.one`, `.plus`,
    `.training`, `.fitness`.
  - Likely available when checked (Oct 2026, RDAP): `.io`, `.dev`, `.page`, `.coach`, `.run`,
    `.click`, `.link`, `.gg`, `.to`, `.pro`, `.club`, `.today`, `.zone`, `.guru`, `.tech`, `.live`.
  - Student route (owner is a student): GitHub Student Developer Pack —
    Namecheap's free domain is only `.me` (owner rejected `.me`); `.tech` via Namecheap is
    ~$0.48. The Pack also lists a free 1-year `.TECH` domain offer and Name.com free domain
    (25+ TLDs incl. `.live`, `.dev` — verify $0 at checkout). Candidates: `coachconnect.tech`,
    `coachconnect.dev`, `coachconnect.live`.
  - If registering at an external registrar, prefer a host that supports apex DNS easily
    (Vercel A-record or Netlify) or transfer DNS to Cloudflare for Pages.

---

## 11. Rules for Anyone Editing This Codebase

1. Follow `docs/INLINE_COMMENT_STYLE.md` at frame depth for every new/significantly edited
   `.ts/.tsx/.js/.jsx/.css` file: file-top summary, block explanations, `// vocab:`,
   `// Manipulate here:`. No separate explanations files.
2. Brand §1 is non-negotiable (palette, fonts, bans).
3. Copy changes: get owner approval — §7 is the current approved copy.
4. Perf budget: 60fps target. Canvas dpr [1, 1.5], no post-processing, gate all per-frame
   work behind ActGroup's active flag, never write scroll progress through React state.
5. Never hardcode the production domain in Seo.jsx — it derives from `window.location`.
6. Firebase: project `anatrox-auth` only; no admin keys in frontend; rules changes are
   append-only and deployed from the app repo.
7. Every interactive element gets a `data-testid` (kebab-case).

---

*Generated from the live codebase on Oct 19, 2026. Sections marked OWNER DECISION are the
questions to answer before the next build pass.*
