import { getFunctions, httpsCallable } from 'firebase/functions';
import { collection, getDocs, orderBy, query, limit as fbLimit } from 'firebase/firestore';
import app, { db } from './firebase';
import { getChart } from './firestoreService';
import { buildAkashaDigest } from '../engines/unified/akashaDigest';
import { useAkashaStore, type AkashaReading } from '../store/akashaStore';
import { useAuthStore } from '../store/authStore';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { logAkashaEvent } from './akashaAnalytics';
import type { AkashaAskRequest, AkashaAskResponse } from '../../functions/src/akasha/types';

function currentTier(): 'free' | 'trial' | 'premium' {
  const sub = useSubscriptionStore.getState().subscription;
  if (sub.status === 'trial') return 'trial';
  if (sub.tier === 'premium' && sub.status === 'active') return 'premium';
  return 'free';
}

const functions = getFunctions(app, 'us-central1');
const callable = httpsCallable<AkashaAskRequest, AkashaAskResponse>(functions, 'askAkasha');

export async function askAkasha(question: string, locale: string): Promise<void> {
  const store = useAkashaStore.getState();
  const uid = useAuthStore.getState().firebaseUser?.uid;
  if (!uid) {
    store.setError('unauthenticated');
    return;
  }

  const chart = await getChart(uid);
  if (!chart) {
    store.setError('no_birth_data');
    return;
  }

  store.setAsking(question);
  const tier = currentTier();
  const startedAt = Date.now();
  logAkashaEvent('akasha_question_asked', { tier, locale, questionLength: question.length });

  try {
    const digest = buildAkashaDigest(chart as any);
    const response = await callable({ question, digest, locale });
    const body = response.data;

    if (body.ok) {
      store.setAnswered({
        readingId: body.readingId,
        answer: body.answer,
        remaining: body.remaining,
      });
      store.prependReading({
        id: body.readingId,
        question,
        answer: body.answer,
        locale,
        createdAt: Date.now(),
      });
      logAkashaEvent('akasha_answer_received', {
        tier,
        locale,
        answerLength: body.answer.length,
        latencyMs: Date.now() - startedAt,
      });
      return;
    }

    if (body.error === 'rate_limited' && body.nextAvailableAt) {
      store.setRateLimited(Date.parse(body.nextAvailableAt));
      logAkashaEvent('akasha_rate_limited', { tier });
      return;
    }
    if (body.error === 'meditating') {
      store.setError('meditating');
      return;
    }
    store.setError('oracle_silent');
  } catch {
    store.setError('oracle_silent');
  }
}

export async function loadPastReadings(): Promise<void> {
  const uid = useAuthStore.getState().firebaseUser?.uid;
  if (!uid) return;
  const q = query(
    collection(db, `users/${uid}/akashaReadings`),
    orderBy('createdAt', 'desc'),
    fbLimit(50)
  );
  const snap = await getDocs(q);
  const readings: AkashaReading[] = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      question: data.question,
      answer: data.answer,
      locale: data.locale,
      createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
    };
  });
  useAkashaStore.getState().loadPastReadings(readings);
}
