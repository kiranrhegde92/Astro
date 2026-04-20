import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

type Req = { token: string };
type Res =
  | { ok: true; card: { sunSign: string; moonSign: string; risingSign: string; displayName: string } }
  | { ok: false; error: string };

export const getPublicCosmicCard = onCall<Req, Promise<Res>>({ region: 'us-central1' }, async (req) => {
  const token = req.data?.token;
  if (!token || typeof token !== 'string' || token.length > 48) {
    throw new HttpsError('invalid-argument', 'token required');
  }
  const snap = await admin.firestore().doc(`publicQr/${token}`).get();
  if (!snap.exists) return { ok: false, error: 'not_found' };
  const d = snap.data() ?? {};
  if (d.revoked === true) return { ok: false, error: 'revoked' };
  const card = {
    sunSign: String(d.sunSign ?? ''),
    moonSign: String(d.moonSign ?? ''),
    risingSign: String(d.risingSign ?? ''),
    displayName: String(d.displayName ?? 'A cosmic self'),
  };
  if (!card.sunSign || !card.moonSign || !card.risingSign) return { ok: false, error: 'invalid' };
  return { ok: true, card };
});
