import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  serverTimestamp,
  runTransaction,
  increment,
} from 'firebase/firestore';
import { db } from './firebase';
import type { UserProfile } from '../types/user';
import { normalizeUserProfile } from '../utils/normalizeUserProfile';

// ─── User profile ─────────────────────────────────────────────────────────────

export async function createUserProfile(uid: string, profile: Partial<UserProfile>): Promise<void> {
  await setDoc(doc(db, 'users', uid), {
    ...profile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return normalizeUserProfile({ ...data, id: uid } as Partial<UserProfile>);
}

export async function updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
  // Strip undefined values — Firestore rejects them outright
  const clean = JSON.parse(JSON.stringify(updates));
  await updateDoc(doc(db, 'users', uid), {
    ...clean,
    updatedAt: serverTimestamp(),
  });
}

// ─── Astrology chart (calculated by Cloud Functions later) ───────────────────

export async function saveChart(uid: string, chartData: Record<string, any>): Promise<void> {
  await setDoc(doc(db, 'charts', uid), {
    ...chartData,
    updatedAt: serverTimestamp(),
  });
}

export async function getChart(uid: string): Promise<Record<string, any> | null> {
  const snap = await getDoc(doc(db, 'charts', uid));
  return snap.exists() ? snap.data() : null;
}

// ─── Daily readings ───────────────────────────────────────────────────────────

export async function getDailyReading(uid: string, dateKey: string): Promise<Record<string, any> | null> {
  const snap = await getDoc(doc(db, 'dailyReadings', uid, 'dates', dateKey));
  return snap.exists() ? snap.data() : null;
}

export async function saveDailyReading(
  uid: string,
  dateKey: string,
  reading: Record<string, any>
): Promise<void> {
  await setDoc(doc(db, 'dailyReadings', uid, 'dates', dateKey), {
    ...reading,
    generatedAt: serverTimestamp(),
  });
}

// ─── Referral system ──────────────────────────────────────────────────────────

const REFERRAL_MAX_USES = 3;
const REFERRAL_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no O/0/I/1

function makeReferralCode(): string {
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += REFERRAL_CODE_CHARS[Math.floor(Math.random() * REFERRAL_CODE_CHARS.length)];
  }
  return code;
}

export async function generateUniqueReferralCode(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = makeReferralCode();
    const snap = await getDoc(doc(db, 'referralCodes', code));
    if (!snap.exists()) return code;
  }
  // Extremely rare — extend to 10 chars
  return makeReferralCode() + makeReferralCode().slice(0, 2);
}

export async function createReferralCodeDoc(code: string, uid: string): Promise<void> {
  await setDoc(doc(db, 'referralCodes', code), {
    uid,
    usedCount: 0,
    createdAt: serverTimestamp(),
  });
}

export interface ReferralValidation {
  valid: boolean;
  referrerId?: string;
  error?: string;
}

export async function validateReferralCode(code: string): Promise<ReferralValidation> {
  if (!code || code.length < 6) {
    return { valid: false, error: 'Invalid referral code.' };
  }
  const snap = await getDoc(doc(db, 'referralCodes', code.toUpperCase().trim()));
  if (!snap.exists()) {
    return { valid: false, error: 'Referral code not found.' };
  }
  const data = snap.data() as { uid: string; usedCount: number };
  if (data.usedCount >= REFERRAL_MAX_USES) {
    return { valid: false, error: 'This referral code has already been fully used.' };
  }
  return { valid: true, referrerId: data.uid };
}

export async function applyReferralTransaction(
  newUid: string,
  code: string
): Promise<{ success: boolean; referrerId?: string; error?: string }> {
  const normalizedCode = code.toUpperCase().trim();
  const codeRef = doc(db, 'referralCodes', normalizedCode);
  const newUserRef = doc(db, 'users', newUid);

  let referrerId = '';
  try {
    await runTransaction(db, async (tx) => {
      const codeSnap = await tx.get(codeRef);
      if (!codeSnap.exists()) throw new Error('invalid-code');

      const codeData = codeSnap.data() as { uid: string; usedCount: number };
      if (codeData.usedCount >= REFERRAL_MAX_USES) throw new Error('limit-reached');
      if (codeData.uid === newUid) throw new Error('self-referral');

      referrerId = codeData.uid;
      const referrerRef = doc(db, 'users', referrerId);

      tx.update(codeRef, { usedCount: codeData.usedCount + 1 });
      tx.update(referrerRef, { referralCount: increment(1) });
      tx.update(newUserRef, { referredBy: referrerId });
    });
    return { success: true, referrerId };
  } catch (e: any) {
    const error =
      e.message === 'invalid-code' ? 'Referral code not found.' :
      e.message === 'limit-reached' ? 'This referral code has been fully used.' :
      e.message === 'self-referral' ? 'You cannot use your own referral code.' :
      'Failed to apply referral. Please try again.';
    return { success: false, error };
  }
}

// ─── Account deletion ─────────────────────────────────────────────────────────

export async function deleteAllUserData(uid: string): Promise<void> {
  // Delete user profile
  await deleteDoc(doc(db, 'users', uid)).catch(() => {});
  // Delete chart
  await deleteDoc(doc(db, 'charts', uid)).catch(() => {});
  // Delete all daily reading sub-documents then the parent
  try {
    const datesSnap = await getDocs(collection(db, 'dailyReadings', uid, 'dates'));
    await Promise.all(datesSnap.docs.map((d) => deleteDoc(d.ref)));
    await deleteDoc(doc(db, 'dailyReadings', uid));
  } catch {
    // ignore if collection doesn't exist
  }
}
