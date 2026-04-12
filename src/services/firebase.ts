import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseConfig } from '../config';

const firebaseConfig = FirebaseConfig;

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const authPersistenceFactory = (require('@firebase/auth') as any).getReactNativePersistence as
  | ((storage: typeof AsyncStorage) => unknown)
  | undefined;

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
