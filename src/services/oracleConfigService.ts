import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export type OracleProvider = 'gemini' | 'claude';

const DOC_PATH = 'config/oracle';

function sanitize(raw: unknown): OracleProvider {
  return raw === 'gemini' ? 'gemini' : 'claude';
}

export async function getOracleProvider(): Promise<OracleProvider> {
  const snap = await getDoc(doc(db, DOC_PATH));
  return sanitize(snap.data()?.provider);
}

export async function setOracleProvider(provider: OracleProvider): Promise<void> {
  if (provider !== 'gemini' && provider !== 'claude') {
    throw new Error(`invalid provider: ${provider}`);
  }
  const uid = auth.currentUser?.uid ?? null;
  await setDoc(
    doc(db, DOC_PATH),
    {
      provider,
      updatedAt: serverTimestamp(),
      updatedBy: uid,
    },
    { merge: true },
  );
}
