// createWaitlistAccount — turns a waitlist signup into a real Coach Connect login.
// Flow: create the Auth user → set the display name → write users/{uid} with
// onboarding still unfinished. The browser stays signed in so the next step
// can save onboarding onto that same user.
// Used by: WaitlistForm.jsx.
// Firestore path that must stay: users/{uid}. Field letters that must stay:
// name, email, role, onboardingCompleted, createdAt.

import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { readCoachConnectFirebase } from './firebaseClient';

// ===== HELPERS =====

/**
 * Turn a Firebase Auth error into a sentence the visitor can act on.
 * @param {Error & { code?: string }} authError
 * @returns {string}
 */
export function explainAuthError(authError) {
  // vocab: authError.code = Firebase's stable id, like auth/email-already-in-use
  if (authError.code === 'auth/email-already-in-use') {
    return 'That email already has a Coach Connect login. Open the app and sign in with it.';
  }
  if (authError.code === 'auth/invalid-email') {
    return 'That email does not look valid. Check it and try again.';
  }
  if (authError.code === 'auth/weak-password') {
    return 'Use a password of at least 6 characters.';
  }
  if (authError.code === 'auth/operation-not-allowed') {
    return 'Email sign-up is turned off in Firebase. Enable Email/Password on the anatrox-auth project.';
  }
  return authError.message || 'Could not create the account. Try again.';
}

// ===== MAIN FUNCTION =====

/**
 * Create the Auth user and the starter profile the app expects after signup.
 * @param {{ fullName: string, emailAddress: string, password: string, role: 'client' | 'trainer' }} account
 * @returns {Promise<{ userId: string }>}
 */
export async function createWaitlistAccount(account) {
  // 1. Open the same Firebase project the phone app uses.
  const { auth, db } = readCoachConnectFirebase();

  // 2. Create the login. This also signs this browser in, which the rules require
  //    before anyone can write users/{their own id}.
  // vocab: createUserWithEmailAndPassword = Firebase Auth "sign up"
  const userCredential = await createUserWithEmailAndPassword(auth, account.emailAddress, account.password);
  const userId = userCredential.user.uid;

  // 3. Wait until Auth has a token. Firestore rejects the profile write if the
  //    request goes out before that token is attached ("Missing or insufficient permissions").
  // vocab: getIdToken = the signed-in user's proof, which Firestore rules check
  await userCredential.user.getIdToken();

  // 4. The app shows this name on the profile.
  await updateProfile(userCredential.user, { displayName: account.fullName });

  // 5. Starter profile only. Live rules reject a browser write that includes
  //    `role` (that field is server-only). The chosen role is sent later, with
  //    onboarding, to the Coach Connect API, which writes it with the admin SDK.
  // vocab: setDoc = create or replace one Firestore document
  // vocab: serverTimestamp = Firestore fills in the clock on its side, not the laptop's
  await setDoc(doc(db, 'users', userId), {
    name: account.fullName,
    email: account.emailAddress,
    onboardingCompleted: false,
    createdAt: new Date().toISOString(),
    source: 'landing_waitlist',
    signedUpAt: serverTimestamp(),
  });

  return { userId };
}
