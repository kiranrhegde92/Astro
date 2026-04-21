import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { sanitizeSharedReading } from './sanitizeSharedReading';

type Req = { readingId: string };
type Res =
  | { ok: true; reading: ReturnType<typeof sanitizeSharedReading> }
  | { ok: false; error: string };

export const getSharedReading = onCall<Req, Promise<Res>>(
  { region: 'us-central1' },
  async (req) => {
    const id = req.data?.readingId;
    if (!id || typeof id !== 'string' || id.length > 64) {
      throw new HttpsError('invalid-argument', 'readingId required');
    }
    const snap = await admin.firestore().doc(`sharedReadings/${id}`).get();
    if (!snap.exists) return { ok: false, error: 'not_found' };
    const data = snap.data() ?? {};
    const ts = data.createdAt as admin.firestore.Timestamp | undefined;
    const clean = sanitizeSharedReading({
      question: data.question,
      answer: data.answer,
      locale: data.locale,
      createdAt: ts?.toMillis?.() ?? null,
    });
    if (!clean) return { ok: false, error: 'invalid' };
    return { ok: true, reading: clean };
  },
);
