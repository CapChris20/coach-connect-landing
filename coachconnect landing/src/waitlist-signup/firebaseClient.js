// firebaseClient — the one door from this landing site into Coach Connect's
// Firebase project (anatrox-auth). Same project the phone app signs into.
// Flow: read the public web config → start the app once → hand back Auth + Firestore.
// Used by: createWaitlistAccount.js, saveOnboardingProfile.js.

import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ===== NAMED CONSTANTS =====

// Public web keys for project anatrox-auth. These are the same kind of keys
// the phone app ships. They are not the admin secret.
// vocab: REACT_APP_* = Create React App only exposes env vars with this prefix
const FIREBASE_WEB_CONFIG = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// ===== HELPERS =====

/**
 * True when the public web config was actually filled in.
 * @returns {boolean}
 */
function hasFirebaseWebConfig() {
  return Boolean(FIREBASE_WEB_CONFIG.apiKey && FIREBASE_WEB_CONFIG.projectId && FIREBASE_WEB_CONFIG.appId);
}

// ===== MAIN FUNCTION =====

/**
 * Auth + Firestore for anatrox-auth. Starts Firebase once per page load.
 * @returns {{ auth: import('firebase/auth').Auth, db: import('firebase/firestore').Firestore }}
 */
export function readCoachConnectFirebase() {
  // 1. Refuse to invent a project if .env.local was never filled in.
  if (!hasFirebaseWebConfig()) {
    throw new Error('Firebase web config is missing. Add the anatrox-auth REACT_APP_FIREBASE_* keys to .env.local and restart the dev server.');
  }

  // 2. Reuse the app if this page already started it (hot reload calls this twice).
  // vocab: getApps = list of Firebase apps already started in this browser tab
  const alreadyStarted = getApps().length > 0;
  const firebaseApp = alreadyStarted ? getApp() : initializeApp(FIREBASE_WEB_CONFIG);

  // 3. Auth creates the login. Firestore stores the profile the phone app reads.
  return {
    auth: getAuth(firebaseApp),
    db: getFirestore(firebaseApp),
  };
}
