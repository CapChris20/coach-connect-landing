// createWaitlistAccount.js — turns a waitlist signup into a real Coach Connect login.
// Flow: create the Auth user → set the display name → write users/{uid} with
// onboarding unfinished → sign this browser out. The app then runs its own
// onboarding the first time the person signs in.
// Ported from the first landing site. Firestore path and field names must stay:
// users/{uid} · name, email, onboardingCompleted, createdAt.
import { createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { readCoachConnectFirebase } from './firebaseClient';

/**
 * Turn a Firebase Auth error into a sentence the visitor can act on.
 * @param {Error & { code?: string }} authError
 * @returns {string}
 */
export function explainAuthError(authError) {
  if (authError.code === 'auth/email-already-in-use') return 'That email already has a Coach Connect login. Open the app and sign in with it.';
  if (authError.code === 'auth/invalid-email') return 'That email does not look right. Check it and try again.';
  if (authError.code === 'auth/weak-password') return 'Use a password of at least 6 characters.';
  if (authError.code === 'auth/network-request-failed') return 'No connection. Check your internet and try again.';
  return 'We could not create your login just now. Try again in a minute.';
}

/**
 * Create the Auth user and the starter profile the app expects.
 * @param {{ fullName: string, emailAddress: string, password: string }} account
 * @returns {Promise<{ userId: string }>}
 */
export async function createWaitlistAccount(account) {
  // 1. Same Firebase project the phone app uses.
  const { auth, db } = readCoachConnectFirebase();

  // 2. Create the login. This signs the browser in, which the rules need for step 4.
  const userCredential = await createUserWithEmailAndPassword(auth, account.emailAddress, account.password);
  const userId = userCredential.user.uid;
  await userCredential.user.getIdToken();

  // 3. The app shows this name on the profile.
  await updateProfile(userCredential.user, { displayName: account.fullName });

  // 4. Starter profile, same fields the first site wrote. `role` is server-only
  //    under the live rules, so the app asks for it during onboarding.
  await setDoc(doc(db, 'users', userId), {
    name: account.fullName,
    email: account.emailAddress,
    onboardingCompleted: false,
    createdAt: new Date().toISOString(),
    source: 'landing_waitlist',
    signedUpAt: serverTimestamp(),
  });

  // 5. The app login is its own session. Do not leave the marketing site signed in.
  await signOut(auth);
  return { userId };
}
