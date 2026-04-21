import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

type Req = { code: string };
type Res =
  | { ok: true; meta: { inviterDisplayName: string; remaining: number } }
  | { ok: false; error: string };

export const getInviteMeta = onCall<Req, Promise<Res>>({ region: 'us-central1' }, async (req) => {
  const code = req.data?.code;
  if (!code || typeof code !== 'string' || code.length > 32) {
    throw new HttpsError('invalid-argument', 'code required');
  }
  const snap = await admin.firestore().doc(`referralCodes/${code}`).get();
  if (!snap.exists) return { ok: false, error: 'not_found' };
  const d = snap.data() ?? {};
  const remaining = typeof d.remaining === 'number' ? d.remaining : 0;
  if (remaining <= 0) return { ok: false, error: 'exhausted' };
  const inviterDisplayName = typeof d.inviterDisplayName === 'string' ? d.inviterDisplayName : 'A friend';
  return { ok: true, meta: { inviterDisplayName, remaining } };
});
