# waitlist/

The founding signup on the landing page. It does not keep a separate email list.

Joining creates a real login in the Coach Connect Firebase project `anatrox-auth` (the same project the phone app uses), then walks through a short onboarding and writes the profile the app already knows how to read.

- `WaitlistForm.jsx` — account form, then the setup questions
- `createWaitlistAccount.js` — `createUserWithEmailAndPassword` + `users/{uid}`
- `saveOnboardingProfile.js` — sends setup to `POST /api/onboarding/complete` (the API writes `role`, because live Firestore rules reject that field from the browser)
- `firebaseClient.js` — public web config from `.env.local` (`REACT_APP_FIREBASE_*`)

After someone finishes, they open the Coach Connect app and sign in with that email and password. The app sees onboarding already completed and opens straight in.

The admin service-account key never belongs in this site. Only the public web config does.
