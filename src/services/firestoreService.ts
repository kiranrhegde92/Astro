import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  serverTimestamp,
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
