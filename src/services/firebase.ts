import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseConfig } from '../config';

const firebaseConfig = FirebaseConfig;

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

function loadReactNativePersistence():
  | ((storage: typeof AsyncStorage) => unknown)
  | undefined {
  try {
    const factory = (require('firebase/auth') as any).getReactNativePersistence;
    if (typeof factory === 'function') return factory;
  } catch {}

  try {
    const factory = (require('@firebase/auth') as any).getReactNativePersistence;
    if (typeof factory === 'function') return factory;
  } catch {}

  return undefined;
}

const authPersistenceFactory = loadReactNativePersistence();

export const auth = (() => {
  try {
    if (authPersistenceFactory) {
      return initializeAuth(app, {
        persistence: authPersistenceFactory(AsyncStorage) as any,
      });
    }
  } catch {}

  return getAuth(app);
})();

export const db = getFirestore(app);

export default app;
