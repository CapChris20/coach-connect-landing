// firebaseClient.js — the one door from this site into Coach Connect's Firebase
// project (anatrox-auth), the same project the phone app signs into.
// Ported from the first landing site. Keys come from .env.local; the old
// REACT_APP_FIREBASE_* names still work (see envPrefix in vite.config.js).
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const env = import.meta.env;

// Public web keys only. The admin service account never belongs in this site.
const FIREBASE_WEB_CONFIG = {
  apiKey: env.REACT_APP_FIREBASE_API_KEY || env.VITE_FIREBASE_API_KEY,
  authDomain: env.REACT_APP_FIREBASE_AUTH_DOMAIN || env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.REACT_APP_FIREBASE_PROJECT_ID || env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.REACT_APP_FIREBASE_STORAGE_BUCKET || env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.REACT_APP_FIREBASE_APP_ID || env.VITE_FIREBASE_APP_ID,
};

/**
 * True when the public web config was filled in.
 * @returns {boolean}
 */
export function hasFirebaseWebConfig() {
  return Boolean(FIREBASE_WEB_CONFIG.apiKey && FIREBASE_WEB_CONFIG.projectId && FIREBASE_WEB_CONFIG.appId);
}

/**
 * Auth + Firestore for anatrox-auth. Starts Firebase once per page load.
 * @returns {{ auth: import('firebase/auth').Auth, db: import('firebase/firestore').Firestore }}
 */
export function readCoachConnectFirebase() {
  if (!hasFirebaseWebConfig()) {
    throw new Error('Firebase web config is missing. Add the anatrox-auth keys to .env.local and restart the dev server.');
  }
  const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(FIREBASE_WEB_CONFIG);
  return { auth: getAuth(firebaseApp), db: getFirestore(firebaseApp) };
}
