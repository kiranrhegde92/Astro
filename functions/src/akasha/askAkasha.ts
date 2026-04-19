import { onCall } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { logger } from 'firebase-functions';
import { evaluateRateLimit } from './rateLimit';
import { askOracle, resolveProvider } from './oracleClient';
import { STATIC_SYSTEM_PROMPT, buildUserMessage } from './systemPrompt';
import type {
  AkashaAskRequest,
  AkashaAskResponse,
  AkashaTier,
} from './types';

const QUESTION_MAX_CHARS = 400;

interface UserDocSnapshot {
  subscription?: {
    tier?: 'free' | 'premium' | 'family';
    status?: 'active' | 'expired' | 'trial' | string;
  };
}

interface AkashaStateDoc {
  tier: AkashaTier;
  timestamps: admin.firestore.Timestamp[];
  totalAsked: number;
}

export const askAkasha = onCall<AkashaAskRequest, Promise<AkashaAskResponse>>(
  { region: 'us-central1', secrets: ['ANTHROPIC_API_KEY', 'GEMINI_API_KEY'], timeoutSeconds: 60 },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      return { ok: false, error: 'unauthenticated', message: 'sign in required' };
    }
    const { question, digest, locale } = request.data;
    if (!question || typeof question !== 'string' || question.length > QUESTION_MAX_CHARS) {
      return { ok: false, error: 'invalid_request', message: 'question missing or too long' };
    }
    if (!digest || !locale) {
      return { ok: false, error: 'invalid_request', message: 'digest and locale required' };
    }

    const db = admin.firestore();
    const stateRef = db.doc(`users/${uid}/akasha/state`);
    const userRef = db.doc(`users/${uid}`);
    const now = admin.firestore.Timestamp.now();

    const limitDecision = await db.runTransaction(async (tx) => {
      const [stateSnap, userSnap] = await Promise.all([tx.get(stateRef), tx.get(userRef)]);
      const userData = userSnap.data() as UserDocSnapshot | undefined;
      const tier = resolveTier(userData);

      const prev = (stateSnap.data() as AkashaStateDoc | undefined) ?? {
        tier,
        timestamps: [],
        totalAsked: 0,
      };

      const evaluation = evaluateRateLimit({
        tier,
        timestamps: prev.timestamps.map((t) => t.toMillis()),
        now: now.toMillis(),
      });

      if (!evaluation.allowed) {
        return {
          allowed: false as const,
          tier,
          nextAvailableAt: evaluation.nextAvailableAt!,
          remaining: 0,
        };
      }

      const newTimestamps = [...evaluation.prunedTimestamps, now.toMillis()].map((ms) =>
        admin.firestore.Timestamp.fromMillis(ms)
      );

      tx.set(
        stateRef,
        {
          tier,
          timestamps: newTimestamps,
          totalAsked: (prev.totalAsked ?? 0) + 1,
        },
        { merge: true }
      );

      const limit = tier === 'free' ? 1 : 3;
      return { allowed: true as const, tier, remaining: limit - newTimestamps.length };
    });

    if (!limitDecision.allowed) {
      return {
        ok: false,
        error: 'rate_limited',
        message: 'rate limited',
        nextAvailableAt: new Date(limitDecision.nextAvailableAt).toISOString(),
      };
    }

    const provider = resolveProvider();
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    const keyMissing =
      (provider === 'claude' && !anthropicKey) || (provider === 'gemini' && !geminiKey);
    if (keyMissing) {
      logger.error('oracle key missing', { provider });
      await rollback(stateRef, now);
      return { ok: false, error: 'oracle_silent', message: 'configuration error' };
    }

    try {
      const result = await askOracle({
        systemPrompt: STATIC_SYSTEM_PROMPT,
        userMessage: buildUserMessage({ digest, question, locale }),
        provider,
        anthropicKey,
        geminiKey,
      });

      const readingRef = db.collection(`users/${uid}/akashaReadings`).doc();
      await readingRef.set({
        question,
        answer: result.answer,
        locale,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        digestSnapshot: digest,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        provider: result.provider,
      });

      return {
        ok: true,
        answer: result.answer,
        readingId: readingRef.id,
        remaining: limitDecision.remaining,
        nextAvailableAt: null,
      };
    } catch (err) {
      logger.error('askOracle failed', { err, provider });
      await rollback(stateRef, now);
      return { ok: false, error: 'oracle_silent', message: 'llm error' };
    }
  }
);

function resolveTier(userData: UserDocSnapshot | undefined): AkashaTier {
  const sub = userData?.subscription;
  if (!sub) return 'free';
  if (sub.status === 'trial') return 'trial';
  if (sub.tier === 'premium' && sub.status === 'active') return 'premium';
  if (sub.tier === 'family' && sub.status === 'active') return 'premium';
  return 'free';
}

async function rollback(
  stateRef: FirebaseFirestore.DocumentReference,
  ts: admin.firestore.Timestamp
) {
  await admin.firestore().runTransaction(async (tx) => {
    const snap = await tx.get(stateRef);
    const prev = snap.data() as AkashaStateDoc | undefined;
    if (!prev) return;
    const filtered = prev.timestamps.filter((t) => t.toMillis() !== ts.toMillis());
    tx.update(stateRef, { timestamps: filtered });
  });
}
