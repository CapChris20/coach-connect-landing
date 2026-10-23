# Coach Connect — Landing Page & Web Experience

> **Find your coach. Run your business. One app.**  
> An interactive, 3D-enhanced web application showcasing the two-sided Coach Connect fitness platform for clients and personal trainers.

---

## 🌟 Overview

**Coach Connect** is an all-in-one platform connecting fitness clients with dedicated personal trainers. This web application provides:
- A high-engagement **Landing Page** with interactive 3D elements, live app screen recordings, and story chapters.
- Dedicated deep-dive feature pages for **Clients** (`/for-clients`), **Trainers** (`/for-trainers`), and shared workflows (`/for-both`).
- An interactive **Frequently Asked Questions** hub (`/faqs`).
- A multi-step **Waitlist & Onboarding** flow integrated with Firebase.

---

## 🚀 Key Features

### 1. Interactive 3D Showcase & Hardware
- **Customizable Apple Watch (`src/hero-section/HeroInteractiveWatch.jsx`)**: An interactive 3D-styled watch where visitors can switch sport band colors (Starlight, Midnight, Ocean, Sunset, Alpine) and titanium finishes (Natural, Gold, Slate) with live activity rings.
- **Hero Phone App Player (`src/hero-section/HeroPhoneAppPlayer.jsx`)**: Cycles through authentic screen recordings of the client and trainer mobile apps with story-style progress bars.
- **Interactive 3D Phone Model (`src/phone-3d-model/Phone3DShowcase.jsx`)**: A Three.js / WebGL iPhone 18 Pro Max model with real-time video texture mapping that visitors can click and drag to spin in 3D space.
- **Floating 3D Fitness Scene (`src/animations-and-backgrounds/Floating3DFitnessScene.jsx`)**: Ambient 3D gym gear (dumbbells, bottles, calendar, cloche) that responds to user interaction.

### 2. Client Experience (`/for-clients`)
- **Home Dashboard**: Daily schedule, coach workout assignments, and quick payment actions.
- **Workouts & AI Plan**: AI-generated workout plans with comprehensive exercise video libraries.
- **Nutrition & Macros**: Barcode scanning, food search, and visual macro ring tracking.
- **Daily Check-Ins**: Soreness, energy levels, and habit tracking.

### 3. Trainer Business Suite (`/for-trainers`)
- **Client Roster**: High-level overview of active client progress and alerts.
- **Client Workspace**: Shared documents, session notes, and training programs.
- **Session Scheduling**: Calendar booking and automated appointment reminders.
- **Weekly Progress Reports**: Automated digests summarizing client consistency and gains.

### 4. Background Shaders & Motion
- **Shader Backgrounds**: Real-time GLSL canvas backgrounds including Neon Gym Scene, Sunset Ocean, Liquid Twist, and Interactive Mouse Grid.
- **Accessibility First**: Respects OS `prefers-reduced-motion` settings across all 3D animations, video autoplay, and page scroll effects.

---

## 📂 Story-Driven Project Structure

The project structure is organized by human-friendly feature modules rather than abstract technical folders:

```text
src/
├── app-header-and-nav/             # Site header, top navigation, and brand logos
│   ├── NavigationBar.jsx           # Sticky navigation bar with mobile slideout menu
│   ├── CoachConnectTextLogo.jsx    # Fluid typography brand wordmark
│   ├── CoachConnectLogo.jsx        # 3D tilting CC emblem
│   └── navigation.css              # Vanilla CSS styles for navigation
│
├── hero-section/                   # Top of the landing page
│   ├── HeroPhoneAppPlayer.jsx      # Phone mockup playing real client/trainer app recordings
│   ├── HeroInteractiveWatch.jsx    # Apple Watch with live activity rings & strap customizer
│   ├── HeroVideoBackground.jsx     # Ambient dark gym background video
│   ├── HeroLeftColumn.jsx          # Hero headline & matching point cards
│   └── hero-section.css            # Regular CSS for hero components
│
├── landing-page/                   # Main landing page assembly
│   ├── LandingPage.jsx             # Assembles landing page sections with Lenis smooth scroll
│   ├── LandingPageSections.jsx     # What is Coach Connect, pricing bento, and reviews
│   ├── AutoSlidingFeatureCard.jsx  # Story-style auto-sliding feature card with progress bars
│   ├── StartupIntroAnimation.jsx   # Elegant opening curtain reveal
│   └── landing-page.css            # Regular CSS for landing page cards and buttons
│
├── phone-3d-model/                 # WebGL 3D iPhone showcase
│   ├── Phone3DShowcase.jsx         # 3D iPhone model with live video texture mapping
│   └── phone-3d-showcase.css       # Regular CSS for the 3D phone stage
│
├── animations-and-backgrounds/     # Shaders, 3D scenes, and animations
│   ├── Floating3DFitnessScene.jsx  # 3D canvas with floating fitness gear
│   ├── 3DModelsList.jsx            # GLTF models loader and normalizer
│   ├── AmbientBackgroundGlow.jsx   # Soft brand lighting aura
│   ├── GymSceneBackground.jsx      # Ambient gym shader background
│   ├── SunsetOceanBackground.jsx   # Sunset ocean shader background
│   ├── LiquidTwistBackground.jsx   # Liquid twist GLSL shader
│   ├── MouseGridBackground.jsx     # Interactive mouse-follow grid lines
│   ├── WeightliftingAnimation.jsx  # Weightlifter Lottie vector animation
│   ├── FadeInWrapper.jsx           # Scroll reveal animation wrapper
│   └── background-animations.css   # Regular CSS for background canvas layers
│
├── audience-pages/                 # In-depth pages for specific users
│   ├── for-clients/
│   │   └── ForClientsPage.jsx      # Client feature showcase and screen recordings
│   ├── for-trainers/
│   │   └── ForTrainersPage.jsx     # Trainer management suite and video clips
│   ├── for-both/
│   │   └── ForBothPage.jsx         # Combined overview of the platform
│   └── shared-phone-player/
│       ├── AudiencePageTemplate.jsx    # Reusable alternating layout template
│       ├── FeaturePhoneVideoPlayer.jsx # Video player cycling feature recordings
│       └── audience-pages.css          # Regular CSS for audience pages
│
├── waitlist-signup/                # Lead capture & onboarding modal
│   ├── WaitlistModalAndForm.jsx    # Multi-step waitlist modal and form
│   ├── createWaitlistAccount.js    # Firebase account generation
│   ├── firebaseClient.js           # Firebase configuration
│   └── saveOnboardingProfile.js    # Profile response persistence
│
├── faq-page/                       # Support & FAQ section
│   ├── FaqsPage.jsx                # Standalone FAQs page route
│   ├── FAQ.jsx                     # Categorized expandable questions list
│   └── faq.css                     # Regular CSS for FAQ accordions
│
└── app-settings-and-helpers/       # Shared site utilities and configuration
    ├── websiteSettings.js          # Pricing, trial copy, fee disclosures, beta URLs
    ├── useScreenSizeAndMotion.js   # Hooks for prefers-reduced-motion and scroll progress
    ├── smoothScrollHelper.js       # Smooth scrolling anchor jump helper
    ├── seoMetaTags.jsx             # Open Graph, Twitter cards, and JSON-LD schema
    └── PlaceholderPage.jsx         # Fallback placeholder layout
```

---

## 🛠️ Technology Stack

- **Framework**: React 19 (Create React App)
- **Styling**: Modular Vanilla CSS + CSS Custom Properties (Theme Tokens in `src/index.css`)
- **3D Graphics**: [Three.js](https://threejs.org/), [@react-three/fiber](https://r3f.docs.pmnd.rs/), [@react-three/drei](https://github.com/pmndrs/drei)
- **Animations**: [Framer Motion](https://www.framer.com/motion/), [Lottie React](https://github.com/Gamote/lottie-react)
- **Smooth Scrolling**: [Lenis](https://lenis.darkroom.engineering/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend / Auth**: Firebase (Firestore & Auth for waitlist accounts)

---

## 💻 Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- Yarn (`npm install -g yarn` or Corepack)

### Installation
```bash
# Clone the repository
git clone https://github.com/CapChris20/coach-connect-landing.git

# Enter the project directory
cd coach-connect-landing

# Install dependencies
yarn install
```

### Running Locally
To launch the development server on `http://localhost:3000`:
```bash
yarn start
```

### Building for Production
To generate an optimized production bundle in the `build/` folder:
```bash
yarn build
```

---

## 📱 Screen Recording Assets
Web-optimized video assets for the interactive phone players live in `public/videos/`:
- `public/videos/app-client-side.mp4` & `public/videos/app-trainer-side.mp4` (Hero preview clips)
- `public/videos/clients/` (Client feature screen recordings)
- `public/videos/trainers/` (Trainer feature screen recordings)

---

## 📄 License
Private & Proprietary — All rights reserved by Coach Connect.
