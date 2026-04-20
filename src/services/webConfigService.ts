import { doc, getDoc, onSnapshot, serverTimestamp, setDoc, type Unsubscribe } from 'firebase/firestore';
import { auth, db } from './firebase';

const DOC_PATH = 'config/web';

function sanitize(raw: unknown): boolean {
  return raw === true;
}

export async function getWebFullAppEnabled(): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db, DOC_PATH));
    return sanitize(snap.data()?.fullAppEnabled);
  } catch {
    return false;
  }
}

export async function setWebFullAppEnabled(enabled: boolean): Promise<void> {
  const uid = auth.currentUser?.uid ?? null;
  await setDoc(
    doc(db, DOC_PATH),
    {
      fullAppEnabled: Boolean(enabled),
      updatedAt: serverTimestamp(),
      updatedBy: uid,
    },
    { merge: true },
  );
}

export function subscribeWebFullAppEnabled(
  callback: (enabled: boolean) => void,
): Unsubscribe {
  return onSnapshot(
    doc(db, DOC_PATH),
    (snap) => callback(sanitize(snap.data()?.fullAppEnabled)),
    () => callback(false),
  );
}
