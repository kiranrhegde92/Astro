import { getFunctions, httpsCallable } from 'firebase/functions';
import app from './firebase';

type SharedReading = { question: string; answer: string; locale: string; createdAt: number };
type InviteMeta = { inviterDisplayName: string; remaining: number };
type CosmicCard = { sunSign: string; moonSign: string; risingSign: string; displayName: string };

type Ok<T> = { ok: true } & T;
type Err = { ok: false; error: string };

const functions = getFunctions(app, 'us-central1');

export async function fetchSharedReading(readingId: string) {
  const fn = httpsCallable<{ readingId: string }, Ok<{ reading: SharedReading }> | Err>(functions, 'getSharedReading');
  return (await fn({ readingId })).data;
}

export async function fetchInviteMeta(code: string) {
  const fn = httpsCallable<{ code: string }, Ok<{ meta: InviteMeta }> | Err>(functions, 'getInviteMeta');
  return (await fn({ code })).data;
}

export async function fetchPublicCosmicCard(token: string) {
  const fn = httpsCallable<{ token: string }, Ok<{ card: CosmicCard }> | Err>(functions, 'getPublicCosmicCard');
  return (await fn({ token })).data;
}
