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
} = process.env;

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  name: 'CosmicSelf',
  slug: 'CosmicSelf',
  version: '1.0.0',
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
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0a0a2e',
    },
    edgeToEdgeEnabled: true,
    package: 'com.cosmicself.app',
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
      'react-native-google-mobile-ads',
      {
        androidAppId: EXPO_PUBLIC_ADMOB_ANDROID_APP_ID,
        iosAppId: EXPO_PUBLIC_ADMOB_IOS_APP_ID,
      },
    ],
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
  },
};
