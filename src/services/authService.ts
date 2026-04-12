import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithCredential,
  signOut as firebaseSignOut,
  updateProfile,
  onAuthStateChanged,
  deleteUser as firebaseDeleteUser,
  sendEmailVerification,
  reload,
  User,
} from 'firebase/auth';
import Constants from 'expo-constants';
import { auth } from './firebase';

type GoogleSignInModule = typeof import('@react-native-google-signin/google-signin');

const googleAuthConfig = Constants.expoConfig?.extra?.googleAuth as
  | {
      webClientId?: string;
      iosClientId?: string;
    }
  | undefined;

let googleConfigured = false;
let googleSignInModule: GoogleSignInModule | null = null;

function getGoogleWebClientId() {
  return googleAuthConfig?.webClientId || process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '';
}

function getGoogleIosClientId() {
  return googleAuthConfig?.iosClientId || process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '';
}

function loadGoogleSignInModule(): GoogleSignInModule {
  if (googleSignInModule) return googleSignInModule;

  try {
    googleSignInModule = require('@react-native-google-signin/google-signin') as GoogleSignInModule;
    return googleSignInModule;
  } catch (cause) {
    const error = new Error('Google Sign-In needs a dev build that includes the RNGoogleSignin native module.') as Error & { code?: string; cause?: unknown };
    error.code = 'google/native-module-unavailable';
    error.cause = cause;
    throw error;
  }
}

function configureGoogleSignIn(GoogleSignin: GoogleSignInModule['GoogleSignin']) {
  if (googleConfigured) return;
  GoogleSignin.configure({
    webClientId: getGoogleWebClientId(),
    iosClientId: getGoogleIosClientId() || undefined,
    offlineAccess: false,
  });
  googleConfigured = true;
}

export function getGoogleSignInSetupIssue(): string | null {
  if (!getGoogleWebClientId()) {
    return 'Google Sign-In is missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID.';
  }
  return null;
}

export function isUserEmailVerified(user: User | null): boolean {
  if (!user) return false;
  if (user.emailVerified) return true;
  return user.providerData.some((provider) => provider.providerId === 'google.com');
}

export async function signUp(email: string, password: string, displayName: string): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  await sendEmailVerification(credential.user);
  return credential.user;
}

export async function signIn(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function signInWithGoogle(): Promise<User | null> {
  const setupIssue = getGoogleSignInSetupIssue();
  if (setupIssue) {
    const error = new Error(setupIssue) as Error & { code?: string };
    error.code = 'google/missing-client-id';
    throw error;
  }

  const { GoogleSignin, isSuccessResponse } = loadGoogleSignInModule();

  configureGoogleSignIn(GoogleSignin);
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();
  if (!isSuccessResponse(response)) return null;

  const idToken = response.data.idToken ?? (await GoogleSignin.getTokens()).idToken;
  if (!idToken) {
    const error = new Error('Google did not return an ID token for Firebase Auth.') as Error & { code?: string };
    error.code = 'google/missing-id-token';
    throw error;
  }

  const credential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(auth, credential);
  const googleName = response.data.user.name?.trim();
  if (googleName && !result.user.displayName) {
    await updateProfile(result.user, { displayName: googleName });
  }
  return result.user;
}

export function getGoogleAuthErrorMessage(error: unknown): string {
  const code = error && typeof error === 'object' && 'code' in error
    ? String((error as { code?: unknown }).code)
    : '';

  if (code === 'SIGN_IN_CANCELLED') {
    return '';
  }
  if (code === 'PLAY_SERVICES_NOT_AVAILABLE') {
    return 'Google Play Services is not available or needs an update.';
  }
  if (code === 'google/missing-client-id') {
    return 'Google Sign-In is not configured yet. Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID and rebuild the app.';
  }
  if (code === 'google/missing-id-token') {
    return 'Google did not return the ID token Firebase needs. Check the web client ID configuration.';
  }
  if (code === 'google/native-module-unavailable') {
    return 'Google Sign-In is not available in Expo Go or this installed build. Rebuild the Android/iOS app after installing @react-native-google-signin/google-signin.';
  }

  if (error instanceof Error && error.message) return error.message;
  return 'Google sign-in failed. Please try again.';
}

export async function sendCurrentUserVerificationEmail(): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');
  await sendEmailVerification(user);
}

export async function reloadCurrentUser(): Promise<User | null> {
  const user = auth.currentUser;
  if (!user) return null;
  await reload(user);
  return auth.currentUser;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export function currentUser(): User | null {
  return auth.currentUser;
}

export async function deleteCurrentUser(): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');
  await firebaseDeleteUser(user);
}
