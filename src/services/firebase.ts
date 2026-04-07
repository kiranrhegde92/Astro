import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Replace with your Firebase project config ───────────────────────────────
// Firebase Console → Project Settings → Your apps → Web app → Config
const firebaseConfig = {
  apiKey: "AIzaSyCJZmvAeg3CB2LHcjzgcZnsYTrm5mkAfgA",
  authDomain: "cosmicself-66472.firebaseapp.com",
  projectId: "cosmicself-66472",
  storageBucket: "cosmicself-66472.firebasestorage.app",
  messagingSenderId: "713381145492",
  appId: "1:713381145492:web:f1638aec53e28b6de83d81",
  measurementId: "G-JQ45K9NM0F"
};
// ─────────────────────────────────────────────────────────────────────────────

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);

export default app;
