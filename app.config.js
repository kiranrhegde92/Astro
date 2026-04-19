// Dynamic Expo config — reads all sensitive values from .env
// Run: cp .env.example .env  then fill in your values before building.
//
// EXPO_PUBLIC_* vars are loaded by Expo automatically from .env at build time.
// They are bundled into the app binary — do not put server-side secrets here.

const {
  EXPO_PUBLIC_FIREBASE_API_KEY,
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  EXPO_PUBLIC_FIREBASE_APP_ID,
  EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
  EXPO_PUBLIC_REVENUECAT_IOS_KEY = '',
  EXPO_PUBLIC_REVENUECAT_ANDROID_KEY = '',
  EXPO_PUBLIC_ADMOB_ANDROID_APP_ID = 'ca-app-pub-3940256099942544~3347511713',
  EXPO_PUBLIC_ADMOB_IOS_APP_ID = 'ca-app-pub-3940256099942544~1458002511',
  EXPO_PUBLIC_ADMOB_REWARDED_ANDROID = '',
  EXPO_PUBLIC_ADMOB_REWARDED_IOS = '',
  EXPO_PUBLIC_ADMOB_USE_PRODUCTION = 'false',
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = '',
  EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID = '',
  EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME = '',
} = process.env;

const googleSignInPlugin = EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME
  ? ['@react-native-google-signin/google-signin', { iosUrlScheme: EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME }]
  : '@react-native-google-signin/google-signin';

// Google AdMob test IDs — only safe for non-production builds.
const ADMOB_TEST_ANDROID = 'ca-app-pub-3940256099942544~3347511713';
const ADMOB_TEST_IOS = 'ca-app-pub-3940256099942544~1458002511';
const useProductionAds = EXPO_PUBLIC_ADMOB_USE_PRODUCTION === 'true';

if (
  useProductionAds &&
  (EXPO_PUBLIC_ADMOB_ANDROID_APP_ID === ADMOB_TEST_ANDROID ||
    EXPO_PUBLIC_ADMOB_IOS_APP_ID === ADMOB_TEST_IOS ||
    !EXPO_PUBLIC_ADMOB_REWARDED_ANDROID ||
    !EXPO_PUBLIC_ADMOB_REWARDED_IOS)
) {
  throw new Error(
    'Production AdMob build requested but test IDs or missing ad-unit IDs detected. ' +
      'Set EXPO_PUBLIC_ADMOB_ANDROID_APP_ID / IOS_APP_ID and REWARDED_ANDROID / IOS in .env.',
  );
}

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  name: 'CosmicSelf',
  slug: 'CosmicSelf',
  version: '1.0.0',
  runtimeVersion: { policy: 'appVersion' },
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  scheme: 'cosmicself',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#0a0a2e',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.cosmicself.app',
    buildNumber: '1',
    config: {
      usesNonExemptEncryption: false,
    },
    infoPlist: {
      NSCameraUsageDescription:
        'CosmicSelf uses the camera so you can scan a friend\u2019s shared QR code to connect.',
      NSUserTrackingUsageDescription:
        'Allow CosmicSelf to use your advertising identifier to show more relevant ads and support the free tier.',
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0a0a2e',
    },
    package: 'com.cosmicself.app',
    versionCode: 1,
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: [
    'expo-router',
    'expo-localization',
    [
      'expo-camera',
      {
        cameraPermission: 'Allow CosmicSelf to scan shared QR codes',
        barcodeScannerEnabled: true,
      },
    ],
    'expo-sharing',
    [
      'expo-notifications',
      {
        icon: './assets/adaptive-icon.png',
        color: '#0a0a2e',
      },
    ],
    [
      'react-native-google-mobile-ads',
      {
        androidAppId: EXPO_PUBLIC_ADMOB_ANDROID_APP_ID,
        iosAppId: EXPO_PUBLIC_ADMOB_IOS_APP_ID,
        userTrackingUsageDescription:
          'Allow CosmicSelf to use your advertising identifier to show more relevant ads and support the free tier.',
      },
    ],
    googleSignInPlugin,
  ],
  extra: {
    firebase: {
      apiKey: EXPO_PUBLIC_FIREBASE_API_KEY,
      authDomain: EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: EXPO_PUBLIC_FIREBASE_APP_ID,
      measurementId: EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
    },
    revenueCat: {
      iosApiKey: EXPO_PUBLIC_REVENUECAT_IOS_KEY,
      androidApiKey: EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
    },
    adMob: {
      useProductionAds: EXPO_PUBLIC_ADMOB_USE_PRODUCTION === 'true',
      rewardedAndroidUnitId: EXPO_PUBLIC_ADMOB_REWARDED_ANDROID,
      rewardedIosUnitId: EXPO_PUBLIC_ADMOB_REWARDED_IOS,
    },
    googleAuth: {
      webClientId: EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      iosClientId: EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      iosUrlScheme: EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME,
    },
    eas: {
      projectId: '9c57c6ef-4966-4774-ae00-9871c43b7a19',
    },
  },
  owner: 'kiranrh',
  updates: {
    url: 'https://u.expo.dev/9c57c6ef-4966-4774-ae00-9871c43b7a19',
  },
};
