import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { UserProfile } from '../types/user';

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
  return {
    ...data,
    birthDetails: {
      ...data.birthDetails,
      date: data.birthDetails?.date?.toDate?.() ?? new Date(data.birthDetails?.date),
    },
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
    subscription: {
      ...data.subscription,
      expiresAt: data.subscription?.expiresAt?.toDate?.(),
      trialEndsAt: data.subscription?.trialEndsAt?.toDate?.(),
    },
  } as UserProfile;
}

export async function updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
  await updateDoc(doc(db, 'users', uid), {
    ...updates,
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
