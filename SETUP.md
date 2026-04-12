# CosmicSelf — Developer Setup Guide

Everything you need to clone, configure, run, and deploy this project from scratch.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Clone the Repository](#2-clone-the-repository)
3. [Install Dependencies](#3-install-dependencies)
4. [All Credentials & Keys — Quick Reference](#4-all-credentials--keys--quick-reference)
5. [Firebase Setup](#5-firebase-setup)
6. [Cloud Functions Setup](#6-cloud-functions-setup)
7. [RevenueCat Setup](#7-revenuecat-setup)
8. [AdMob Setup](#8-admob-setup)
9. [Run the App Locally](#9-run-the-app-locally)
10. [Run on a Real Device](#10-run-on-a-real-device)
11. [Cloudflare Pages (Web Deploy)](#11-cloudflare-pages-web-deploy)
12. [Project Structure](#12-project-structure)
13. [Common Commands](#13-common-commands)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. Prerequisites

Install these tools before anything else.

### Node.js & npm
Download from https://nodejs.org — use the **LTS** version (v20 or later).

```bash
node -v   # should print v20.x or higher
npm -v    # should print 10.x or higher
```

### Git
```bash
# Windows: download from https://git-scm.com
git --version
```

### Expo CLI
```bash
npm install -g expo-cli
```

### Firebase CLI
```bash
npm install -g firebase-tools
firebase --version   # should print 13.x or higher
```

### Wrangler (Cloudflare CLI) — only needed for web deployment
```bash
npm install -g wrangler
wrangler --version
```

### Expo Go (for quick device testing)
- iOS: https://apps.apple.com/app/expo-go/id982107779
- Android: https://play.google.com/store/apps/details?id=host.exp.exponent

> **Note**: Some features (RevenueCat IAP, AdMob rewarded ads, push notifications) require a **native build** via Expo EAS. Expo Go is fine for UI/logic work.

### EAS CLI — only needed for native builds and App Store / Play Store submissions
```bash
npm install -g eas-cli
eas --version
```

---

## 2. Clone the Repository

```bash
git clone <your-repo-url> CosmicSelf
cd CosmicSelf
```

If you already have the repo and need to pull the latest changes:
```bash
git pull origin main
```

Check which branch you're on:
```bash
git status
git branch
```

---

## 3. Install Dependencies

### App dependencies
```bash
cd CosmicSelf
npm install
```

### Cloud Functions dependencies
```bash
cd functions
npm install
cd ..
```

---

## 4. All Credentials & Keys — Quick Reference

Here is every credential, API key, and secret this project needs. Use this as a checklist before going to production.

---

### Where each credential lives

| Credential | File / Location | Currently set? | Required for |
|-----------|----------------|---------------|--------------|
| Firebase `apiKey` | `src/services/firebase.ts` | Yes (hardcoded) | All Firebase features |
| Firebase `authDomain` | `src/services/firebase.ts` | Yes | Auth |
| Firebase `projectId` | `src/services/firebase.ts` | Yes | Firestore, Functions |
| Firebase `storageBucket` | `src/services/firebase.ts` | Yes | Storage |
| Firebase `messagingSenderId` | `src/services/firebase.ts` | Yes | FCM push notifications |
| Firebase `appId` | `src/services/firebase.ts` | Yes | Firebase SDK init |
| Firebase `measurementId` | `src/services/firebase.ts` | Yes | Analytics |
| RevenueCat iOS API key | `app.json → extra.revenueCat.iosApiKey` | **Empty** | iOS subscriptions |
| RevenueCat Android API key | `app.json → extra.revenueCat.androidApiKey` | **Empty** | Android subscriptions |
| AdMob Android App ID | `app.json → plugins[react-native-google-mobile-ads].androidAppId` | Test ID | Android ads |
| AdMob iOS App ID | `app.json → plugins[react-native-google-mobile-ads].iosAppId` | Test ID | iOS ads |
| AdMob Rewarded Android Unit ID | `app.json → extra.adMob.rewardedAndroidUnitId` | **Empty** | Android rewarded ads |
| AdMob Rewarded iOS Unit ID | `app.json → extra.adMob.rewardedIosUnitId` | **Empty** | iOS rewarded ads |
| Firebase Service Account JSON | Environment variable `GOOGLE_APPLICATION_CREDENTIALS` | Not set | Admin scripts (local) |
| Cloudflare account | `wrangler login` (browser auth) | Per-machine | Web deployment |
| Expo / EAS account | `eas login` (browser auth) | Per-machine | Native builds |
| Apple Developer account | EAS credentials flow | Per-project | iOS builds + App Store |
| Google Play service account | EAS credentials flow | Per-project | Android builds + Play Store |

> **Note on Firebase web API key**: Firebase web `apiKey` is NOT secret. It is safe to commit. Security is enforced by Firestore Rules and Firebase Auth, not by hiding the key. See: https://firebase.google.com/docs/projects/api-keys

---

### app.json — fill these in before a production build

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX",
          "iosAppId":     "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"
        }
      ]
    ],
    "extra": {
      "revenueCat": {
        "iosApiKey":     "appl_XXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        "androidApiKey": "goog_XXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
      },
      "adMob": {
        "useProductionAds":      true,
        "rewardedAndroidUnitId": "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
        "rewardedIosUnitId":     "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX"
      }
    }
  }
}
```

---

### Firebase Service Account (for admin scripts only)

The script `scripts/admin/set-admin-claim.js` uses Firebase Admin SDK, which needs credentials when run locally (outside Cloud Functions).

1. Go to **Firebase Console → Project Settings → Service accounts**
2. Click **Generate new private key** → download the JSON file
3. Save it somewhere safe (e.g. `~/.firebase/cosmicself-service-account.json`)
4. Set the environment variable before running the script:

```bash
# Windows (Command Prompt)
set GOOGLE_APPLICATION_CREDENTIALS=C:\Users\YourName\.firebase\cosmicself-service-account.json
node scripts/admin/set-admin-claim.js <uid>

# Windows (PowerShell)
$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\Users\YourName\.firebase\cosmicself-service-account.json"
node scripts/admin/set-admin-claim.js <uid>

# macOS / Linux
export GOOGLE_APPLICATION_CREDENTIALS=~/.firebase/cosmicself-service-account.json
node scripts/admin/set-admin-claim.js <uid>
```

> **Never commit the service account JSON to git.** Add it to `.gitignore`.

---

### External APIs — No keys required

These APIs are used in the app and require no sign-up or API keys:

| API | Used for | Rate limit |
|-----|---------|------------|
| OpenStreetMap Nominatim (`nominatim.openstreetmap.org`) | Geocoding birth place → lat/lng | 1 request/second (fair use) |
| timeapi.io (`timeapi.io/api/timezone/coordinate`) | Timezone lookup from coordinates | Free, no limit documented |

---

## 5. Firebase Setup

The app uses Firebase for Authentication, Firestore database, and Cloud Functions.

### 4a. Log in to Firebase
```bash
firebase login
```

This opens a browser. Log in with the Google account that owns the Firebase project.

### 4b. Select the project
```bash
firebase use cosmicself_stage
```

If the alias isn't recognized, list available projects and set it manually:
```bash
firebase projects:list
firebase use cosmicself-66472
```

### 4c. Firebase config in the app

The Firebase config is already hardcoded in `src/services/firebase.ts`:

```
Project ID:        cosmicself-66472
Auth Domain:       cosmicself-66472.firebaseapp.com
Storage Bucket:    cosmicself-66472.firebasestorage.app
Messaging Sender:  713381145492
App ID:            1:713381145492:web:f1638aec53e28b6de83d81
```

If you create a new Firebase project, replace these values with yours from:
**Firebase Console → Project Settings → Your apps → Web app → Config**

### 4d. Firestore rules
```bash
firebase deploy --only firestore:rules
```

### 4e. Firestore indexes
```bash
firebase deploy --only firestore:indexes
```

### 4f. Authentication setup

In the Firebase Console:
1. Go to **Authentication → Sign-in method**
2. Enable **Email/Password**
3. Enable **Google** (optional)
4. Add your app's SHA-1 fingerprint for Android (from `eas credentials` or `keytool`)

### 4g. Bootstrap admin user (optional)

To grant admin access to your own account after first sign-up:
```bash
node scripts/admin/set-admin-claim.js <your-uid>
```

Find your UID in: **Firebase Console → Authentication → Users → copy UID**

---

## 6. Cloud Functions Setup

The functions handle chart calculations, daily readings, ML prediction, and push notifications.

### 5a. Build the functions
```bash
cd functions
npm run build
cd ..
```

This compiles TypeScript from `functions/src/` to `functions/lib/`.

### 5b. Deploy functions to Firebase
```bash
firebase deploy --only functions
```

This deploys all functions in `functions/src/index.ts`. Takes 2-5 minutes first time.

### 5c. Run functions locally (emulator)
```bash
cd functions
npm run serve
```

This starts the Firebase emulator on port **5001**. Useful for testing without deploying.

If you want the app to hit local emulators instead of production, uncomment the emulator connect lines in `src/services/firebase.ts`.

### 5d. Functions deployed

| Function | Trigger | Description |
|----------|---------|-------------|
| `calculateChart` | HTTPS call | Computes natal chart across all 4 systems |
| `getDailyReading` | HTTPS call | Returns today's reading (cached in Firestore) |
| `calculateCompatibility` | HTTPS call | Cross-system synastry between two users |
| `registerFCMToken` | HTTPS call | Saves push token for transit alerts |
| `deleteMyAccount` | HTTPS call | Deletes user data + auth account |
| `getPredictionModelSnapshot` | HTTPS call | ML prediction for given window |
| `savePredictionFeedback` | HTTPS call | Labels prediction for ML training |
| `exportMyPredictionDataset` | HTTPS call | Exports labeled rows as dataset |
| `scheduledDailyReadings` | Cron (daily) | Pre-generates readings for all users |

---

## 7. RevenueCat Setup

RevenueCat handles subscriptions for iOS and Android.

> **Note**: RevenueCat does NOT work in Expo Go or on web. It requires a native build (`eas build`).

### 6a. Create a RevenueCat account
Go to https://app.revenuecat.com and create a project named **CosmicSelf**.

### 6b. Get your API keys
In RevenueCat Dashboard → **Project Settings → API Keys**:
- Copy the **iOS Public SDK key** (starts with `appl_`)
- Copy the **Android Public SDK key** (starts with `goog_`)

### 6c. Add keys to app.json

Open `app.json` and fill in the `extra.revenueCat` block:

```json
"extra": {
  "revenueCat": {
    "iosApiKey": "appl_XXXXXXXXXXXXXXXXXXXXX",
    "androidApiKey": "goog_XXXXXXXXXXXXXXXXXXXXX"
  }
}
```

### 6d. Configure products in App Store Connect / Google Play

Create two subscription products:
- Monthly: `com.cosmicself.app.premium.monthly`
- Yearly: `com.cosmicself.app.premium.yearly`

Then in RevenueCat Dashboard → **Products**, attach both. Create an **Entitlement** named `premium` and link both products to it.

### 6e. Connect app stores to RevenueCat

Follow RevenueCat's official guides:
- iOS: https://www.revenuecat.com/docs/ios
- Android: https://www.revenuecat.com/docs/android

---

## 8. AdMob Setup

AdMob handles rewarded ads for one-time premium feature unlocks.

> **Note**: The app currently uses **Google test ad IDs** — safe for development, no real revenue.

### 7a. Create a Google AdMob account
Go to https://admob.google.com and register.

### 7b. Create ad units

Create two **Rewarded** ad units (one iOS, one Android).

### 7c. Add production ad unit IDs to app.json

```json
"extra": {
  "adMob": {
    "useProductionAds": true,
    "rewardedAndroidUnitId": "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
    "rewardedIosUnitId": "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX"
  }
}
```

Also update the AdMob App IDs in the `plugins` section:

```json
[
  "react-native-google-mobile-ads",
  {
    "androidAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX",
    "iosAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"
  }
]
```

---

## 9. Run the App Locally

### Start the Expo dev server
```bash
npm start
```

This prints a QR code. Options:
- Press `i` — open iOS Simulator (requires Xcode on Mac)
- Press `a` — open Android Emulator (requires Android Studio)
- Press `w` — open in browser (web mode, limited native features)
- Scan QR with Expo Go app on your phone

### Web only (no simulator needed)
```bash
npm run web
```

Opens at `http://localhost:8081`

---

## 10. Run on a Real Device

For features requiring native code (IAP, push notifications, camera):

### 9a. Install EAS CLI and log in
```bash
npm install -g eas-cli
eas login
```

### 9b. Initialize EAS (first time only)
```bash
eas build:configure
```

This creates `eas.json`. Add profiles for `development`, `preview`, and `production`.

### 9c. Build a development client
```bash
# iOS (requires Apple Developer account)
eas build --profile development --platform ios

# Android
eas build --profile development --platform android
```

Install the resulting `.ipa` / `.apk` on your device, then start the dev server:
```bash
npm start
```

Scan the QR from the installed dev client (not Expo Go).

---

## 11. Cloudflare Pages (Web Deploy)

The web build deploys to Cloudflare Pages as a static site.

### 10a. Log in to Cloudflare
```bash
wrangler login
```

### 10b. Create the Pages project (first time only)
```bash
wrangler pages project create cosmicself
```

### 10c. Build and deploy
```bash
npm run deploy:cloudflare
```

This runs:
1. `expo export --platform web --output-dir dist` — builds the static web bundle
2. `wrangler pages deploy dist --project-name cosmicself` — pushes to Cloudflare

### 10d. View your deployment
After deploy completes, Cloudflare prints a URL like:
`https://cosmicself.pages.dev`

### 10e. Custom domain (optional)
In Cloudflare Dashboard → Pages → cosmicself → Custom Domains → Add domain.

---

## 12. Environment Configuration Reference

All configuration lives in `app.json` under the `extra` key. No `.env` file is used.

| Key | Where to get it | Required for |
|-----|----------------|--------------|
| `revenueCat.iosApiKey` | RevenueCat Dashboard → API Keys | iOS subscriptions |
| `revenueCat.androidApiKey` | RevenueCat Dashboard → API Keys | Android subscriptions |
| `adMob.rewardedAndroidUnitId` | AdMob Console → Ad units | Android rewarded ads |
| `adMob.rewardedIosUnitId` | AdMob Console → Ad units | iOS rewarded ads |
| `adMob.useProductionAds` | Set `true` for production builds | Production ad revenue |

Firebase config is hardcoded in `src/services/firebase.ts` (no secret — Firebase web keys are public by design, protected by Firestore Rules).

---

## 13. Project Structure

```
CosmicSelf/
├── app/                          # Screens (Expo Router file-based routing)
│   ├── (tabs)/                   # Tab bar screens
│   │   ├── today.tsx             # Main daily reading screen
│   │   ├── profile.tsx           # User profile + badges
│   │   ├── compatibility.tsx     # Match checking
│   │   └── share.tsx             # Share cards + archive
│   ├── (auth)/                   # Login / Signup
│   ├── (onboarding)/             # 4-step onboarding flow
│   ├── reading/                  # Detail screens per system
│   │   ├── western.tsx
│   │   ├── vedic.tsx
│   │   ├── chinese.tsx
│   │   ├── kp.tsx
│   │   ├── unified.tsx
│   │   ├── transits.tsx
│   │   └── archive.tsx
│   ├── profile/
│   │   ├── birth-details.tsx     # Edit birth details
│   │   └── family-profiles.tsx   # Managed profiles
│   ├── qr/
│   │   ├── my-code.tsx           # Show your QR
│   │   └── scan.tsx              # Scan another's QR
│   ├── share/card.tsx            # Share card builder
│   ├── legal/
│   │   ├── privacy.tsx
│   │   └── terms.tsx
│   ├── journal.tsx
│   ├── settings.tsx
│   ├── subscription.tsx
│   └── _layout.tsx               # Root layout (Firebase init, fonts, notifications)
│
├── src/
│   ├── components/ui/            # Reusable UI components
│   ├── components/charts/        # SVG chart components (NatalWheel, BaZiPillars)
│   ├── components/share/         # Share card templates
│   ├── constants/
│   │   ├── theme.ts              # COLORS, FONTS, SPACING, etc.
│   │   └── badges.ts             # Badge definitions + earning logic
│   ├── engines/                  # All astrology calculation engines (client-side)
│   │   ├── western/
│   │   ├── vedic/
│   │   ├── chinese/
│   │   ├── kp/
│   │   ├── common/transits.ts
│   │   └── unified/
│   ├── services/                 # External service integrations
│   │   ├── firebase.ts           # Firebase app init
│   │   ├── authService.ts
│   │   ├── firestoreService.ts
│   │   ├── functionsService.ts   # Cloud Function callers
│   │   ├── revenueCat.ts         # RevenueCat IAP
│   │   ├── rewardedAds.ts        # AdMob rewarded ads
│   │   └── ttsService.ts         # Text-to-speech
│   ├── store/                    # Zustand state stores
│   │   ├── userStore.ts
│   │   ├── readingStore.ts
│   │   ├── journalStore.ts
│   │   ├── settingsStore.ts
│   │   ├── adUnlockStore.ts
│   │   ├── connectionsStore.ts
│   │   ├── managedProfilesStore.ts
│   │   └── authStore.ts
│   ├── types/                    # TypeScript type definitions
│   └── utils/                    # Helpers (geocoding, moon phase, dates, subscription)
│
├── functions/                    # Firebase Cloud Functions (Node 20)
│   └── src/
│       ├── index.ts              # All function exports
│       ├── calculations/         # Server-side chart engines
│       ├── ml/                   # Prediction model + feedback
│       ├── dailyPrediction.ts
│       └── utils/geocoding.ts
│
├── assets/                       # Icons, images, splash screen
├── app.json                      # Expo config + API key placeholders
├── firebase.json                 # Firebase project config
├── .firebaserc                   # Firebase project alias
├── firestore.rules               # Firestore security rules
├── firestore.indexes.json        # Firestore composite indexes
└── tsconfig.json
```

---

## 14. Common Commands

| Task | Command |
|------|---------|
| Start dev server | `npm start` |
| Run on web | `npm run web` |
| Build web for deploy | `npm run build:web` |
| Deploy to Cloudflare | `npm run deploy:cloudflare` |
| Build Cloud Functions | `cd functions && npm run build` |
| Run Functions locally | `cd functions && npm run serve` |
| Deploy all Firebase | `firebase deploy` |
| Deploy Functions only | `firebase deploy --only functions` |
| Deploy Firestore rules | `firebase deploy --only firestore:rules` |
| Deploy Firestore indexes | `firebase deploy --only firestore:indexes` |
| Build native (iOS) | `eas build --platform ios` |
| Build native (Android) | `eas build --platform android` |
| Submit to App Store | `eas submit --platform ios` |
| Submit to Play Store | `eas submit --platform android` |
| Pull latest code | `git pull origin main` |
| Check TypeScript | `npx tsc --noEmit` |

---

## 15. Troubleshooting

### "Metro bundler can't resolve module"
```bash
npx expo start --clear
```
Clears the Metro cache and restarts.

### "npm install" fails with peer dependency errors
```bash
npm install --legacy-peer-deps
```

### Firebase "permission denied" on Firestore
- Check `firestore.rules` — authenticated users need read/write on their own documents
- Redeploy rules: `firebase deploy --only firestore:rules`
- Make sure the user is signed in before any Firestore calls

### RevenueCat "Not configured" error
- RevenueCat only works in a **native build**, not in Expo Go
- Make sure `iosApiKey` / `androidApiKey` are filled in `app.json`
- Call `configure(userId)` before any purchase calls — this happens in `_layout.tsx` after login

### Push notifications not arriving
- Notifications require a native build (not Expo Go)
- The FCM token must be registered: check that `registerPushToken` Cloud Function call succeeds after login
- Check that the user enabled notification permissions in device settings

### Cloud Functions deploy fails
```bash
cd functions
npm run build   # check for TypeScript errors first
firebase deploy --only functions
```
Make sure you're on Node 20 locally — the functions target `"engines": { "node": "20" }`.

### Wrangler "No such project" error
```bash
wrangler pages project create cosmicself
```
You need to create the Cloudflare Pages project once before deploying.

### App crashes on launch after `npm install`
```bash
npx expo install --fix
```
This auto-corrects package versions to match your Expo SDK version.

### iOS Simulator not showing up
- Install Xcode from the Mac App Store
- Open Xcode → Preferences → Platforms → download an iOS simulator
- Run `sudo xcode-select --switch /Applications/Xcode.app`
