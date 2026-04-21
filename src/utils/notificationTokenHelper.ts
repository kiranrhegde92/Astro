// Thin wrapper — avoids circular import between notifications.ts and functionsService.ts
import { getFunctions, httpsCallable } from 'firebase/functions';
import app from '../services/firebase';

export async function registerPushToken(token: string): Promise<void> {
  const functions = getFunctions(app, 'us-central1');
  const fn = httpsCallable(functions, 'registerFCMToken');
  await fn({ token });
}
