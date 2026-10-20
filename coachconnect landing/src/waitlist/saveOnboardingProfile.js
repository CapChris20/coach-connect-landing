// saveOnboardingProfile — sends the finished setup to the Coach Connect API,
// then signs this browser out.
// Flow: pack the answers → POST /api/onboarding/complete with the Firebase
// token → the API writes users/{uid} (and trainers/{uid}) → sign out.
// The phone app then sees a finished profile and opens straight in.
// Used by: WaitlistForm.jsx.
// Letters that must stay: finalRole, onboardingData, role, inviteCode.

import { signOut } from 'firebase/auth';
import { readCoachConnectFirebase } from './firebaseClient';

// The phone app's Cloud Run API. It writes `role` with the admin SDK.
// A browser is not allowed to set that field itself.
// Manipulate here: point this at a local server only when you are testing offline
const ONBOARDING_API_BASE = process.env.REACT_APP_API_BASE_URL || 'https://coachconnect-api-421005574501.us-central1.run.app';

// ===== HELPERS =====

/**
 * Drop undefined fields. Firestore rejects them.
 * @param {Record<string, unknown>} record
 * @returns {Record<string, unknown>}
 */
function dropUndefinedFields(record) {
  const cleaned = {};
  Object.entries(record).forEach(([fieldName, fieldValue]) => {
    if (fieldValue === undefined) return;
    cleaned[fieldName] = fieldValue;
  });
  return cleaned;
}

/**
 * Trainer invite code in the app's XXX-XXX shape.
 * @returns {string}
 */
function buildInviteCode() {
  // Skip easily confused characters (0/O, 1/I).
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let letters = '';
  for (let index = 0; index < 6; index += 1) {
    const pick = Math.floor(Math.random() * alphabet.length);
    letters += alphabet.charAt(pick);
  }
  return `${letters.slice(0, 3)}-${letters.slice(3)}`;
}

// ===== MAIN FUNCTION =====

/**
 * Save onboarding onto the signed-in user, then leave this browser signed out.
 * @param {{ role: 'client' | 'trainer', fullName: string, answers: Record<string, unknown> }} profile
 * @returns {Promise<void>}
 */
export async function saveOnboardingProfile(profile) {
  // 1. The account step already signed this browser in. The API checks that token.
  const { auth } = readCoachConnectFirebase();
  const signedInUser = auth.currentUser;
  if (!signedInUser) {
    throw new Error('The login session ended before setup finished. Open the app and sign in to finish onboarding there.');
  }

  const inviteCode = profile.role === 'trainer' ? buildInviteCode() : undefined;
  const weight = profile.answers.weight;
  const onboardingData = dropUndefinedFields({
    ...profile.answers,
    name: profile.fullName,
    inviteCode,
    source: 'landing_waitlist',
    startingWeight: weight != null && weight !== '' ? weight : undefined,
  });

  // 2. The API writes users/{uid} (including role) and, for trainers, trainers/{uid}.
  //    Those role writes are rejected if the browser tries them directly.
  // vocab: getIdToken = proof this person is the account we just created
  const idToken = await signedInUser.getIdToken();
  const response = await fetch(`${ONBOARDING_API_BASE}/api/onboarding/complete`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      finalRole: profile.role,
      onboardingData,
      displayName: profile.fullName,
    }),
  });

  if (!response.ok) {
    throw new Error('Setup could not be saved. Your login exists — open the app and sign in to finish onboarding there.');
  }

  // 3. The app login is a separate session. Do not leave the marketing site signed in.
  await signOut(auth);
}
