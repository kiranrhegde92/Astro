# Admin Console Implementation Plan

> For Hermes: Use subagent-driven-development skill to implement this plan task-by-task.

Goal: Build a secure admin console that lets trusted staff search, inspect, and manage CosmicSelf users without granting broad client-side Firestore access.

Architecture: Keep all privileged reads and writes behind Firebase Callable Functions guarded by a server-side admin check. Expose a small admin surface in the Expo Router app (optimized for web first, but usable anywhere) that calls those functions, renders user summaries, and supports high-value actions such as viewing profile state, subscription state, and disabling push / correcting subscription data.

Tech Stack: Expo Router, React Native Web, Zustand, Firebase Auth, Firebase Callable Functions v2, Firestore, firebase-admin.

---

## Current codebase facts

Relevant existing files:
- `functions/src/index.ts` already hosts all privileged backend callables.
- `src/services/functionsService.ts` already wraps callable functions for the client.
- `src/store/authStore.ts` already tracks the signed-in Firebase user, but not admin claims.
- `src/services/firestoreService.ts` reads only the signed-in user's own data.
- `firestore.rules` currently allow only self-access and do not model admin access.
- There is no existing `app/admin/*` route.

Recommended principle:
- Do not give the admin UI direct Firestore reads over arbitrary users.
- Do not widen Firestore rules for admins in phase 1.
- Use callable functions with a server-side `request.auth.token.admin === true` check.

---

## Data and permissions design

Admin authorization:
- Store admin authority in Firebase custom claims: `{ admin: true }`
- Add a tiny allowlist fallback in functions config only for emergency bootstrap if needed.

Admin actions in v1:
- Search users by email prefix / display name / uid
- View a user detail page
- View profile, subscription, onboarding, chart presence, push token presence, and latest activity timestamps
- View recent daily readings count and prediction run count
- Set subscription tier/status manually
- Clear stored FCM token
- Soft-disable account access via `adminFlags.disabled = true`

Non-goals for v1:
- Full chat/support tooling
- Bulk edits
- Direct Firestore browsing
- Hard deletion from admin console
- Role editor for arbitrary staff accounts from inside the UI

---

## Task 1: Add shared admin types

Objective: Define typed admin payloads so client and server stay aligned.

Files:
- Create: `src/types/admin.ts`

Step 1: Create the shared types file with:
- `AdminUserListItem`
- `AdminUserDetail`
- `AdminSubscriptionPatch`
- `AdminUserSearchResponse`
- `AdminUserActionResult`

Suggested shape:

```ts
export interface AdminUserListItem {
  uid: string;
  name: string;
  email: string | null;
  subscriptionTier: 'free' | 'premium';
  subscriptionStatus: 'active' | 'expired' | 'trial' | 'unknown';
  onboardingComplete: boolean;
  chartCalculated: boolean;
  disabled: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface AdminUserDetail extends AdminUserListItem {
  language?: string | null;
  activeSystems: string[];
  cosmicPoints?: number;
  streak?: number;
  lastCheckIn?: string | null;
  birthPlaceName?: string | null;
  hasFcmToken: boolean;
  chartSummary: {
    hasWestern: boolean;
    hasVedic: boolean;
    hasChinese: boolean;
    hasKP: boolean;
  };
  counts: {
    dailyReadings: number;
    predictionRuns: number;
    connections: number;
  };
  rawProfile: Record<string, unknown>;
}

export interface AdminSubscriptionPatch {
  tier: 'free' | 'premium';
  status: 'active' | 'expired' | 'trial';
  billingPeriod?: 'monthly' | 'yearly';
  productId?: string;
}
```

Step 2: Verify the file type-checks.

Run: `npx tsc --noEmit`
Expected: PASS

Step 3: Commit.

```bash
git add src/types/admin.ts
git commit -m "feat: add shared admin console types"
```

---

## Task 2: Add server-side admin guard helpers

Objective: Centralize admin auth checks inside Cloud Functions.

Files:
- Modify: `functions/src/index.ts`

Step 1: Add helper functions near the top:

```ts
function assertAdmin(request: { auth?: { uid?: string; token?: Record<string, unknown> } | null }) {
  if (!request.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Sign in required.');
  }

  if (request.auth.token?.admin !== true) {
    throw new HttpsError('permission-denied', 'Admin access required.');
  }
}

function toIso(value: unknown): string | null {
  if (!value) return null;
  if (value instanceof admin.firestore.Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}
```

Step 2: Add a mapper from auth record + Firestore user doc to compact admin list item shape.

Step 3: Build functions after editing.

Run: `cd functions && npm run build`
Expected: PASS

Step 4: Commit.

```bash
git add functions/src/index.ts functions/lib/index.js functions/lib/index.js.map
git commit -m "feat: add admin auth helpers for callable functions"
```

---

## Task 3: Add admin user search callable

Objective: Let admins search users safely by email/name/uid.

Files:
- Modify: `functions/src/index.ts`

Step 1: Add `searchAdminUsers` callable.

Input:

```ts
{ query?: string; limit?: number }
```

Behavior:
- `assertAdmin(request)` first
- default `limit = 20`, cap at 50
- if query looks like a uid, try exact user doc lookup
- otherwise use `admin.auth().listUsers(1000, pageToken?)` and filter in memory for v1 by:
  - email includes query
  - displayName includes query
  - uid includes query
- join auth users to `users/{uid}` Firestore docs when present
- return compact `AdminUserListItem[]`

Step 2: Keep results sorted by most recently updated profile first, then createdAt.

Step 3: Rebuild functions.

Run: `cd functions && npm run build`
Expected: PASS

Step 4: Commit.

```bash
git add functions/src/index.ts functions/lib/index.js functions/lib/index.js.map
git commit -m "feat: add admin user search callable"
```

---

## Task 4: Add admin user detail callable

Objective: Fetch a complete user snapshot for one selected user.

Files:
- Modify: `functions/src/index.ts`

Step 1: Add `getAdminUserDetail` callable.

Input:

```ts
{ uid: string }
```

Behavior:
- `assertAdmin(request)`
- fetch:
  - `admin.auth().getUser(uid)`
  - `db.doc('users/${uid}')`
  - `db.doc('charts/${uid}')`
  - `db.collection('dailyReadings/${uid}/dates').limit(200)` or count-by-scan for v1
  - `db.collection('predictionRuns/${uid}/runs').limit(200)` or count-by-scan for v1
  - `db.collection('connections/${uid}/partners').limit(200)` or count-by-scan for v1
- return `AdminUserDetail`
- include `rawProfile` with `fcmToken` removed

Step 2: Rebuild functions.

Run: `cd functions && npm run build`
Expected: PASS

Step 3: Commit.

```bash
git add functions/src/index.ts functions/lib/index.js functions/lib/index.js.map
git commit -m "feat: add admin user detail callable"
```

---

## Task 5: Add admin mutation callables

Objective: Let admins make a small set of safe, auditable changes.

Files:
- Modify: `functions/src/index.ts`

Step 1: Add `updateAdminUserSubscription` callable.

Input:

```ts
{ uid: string; subscription: AdminSubscriptionPatch }
```

Behavior:
- `assertAdmin(request)`
- validate enum values strictly
- update `users/{uid}.subscription`
- stamp `updatedAt`
- write audit log entry to `adminAuditLogs/{autoId}`

Step 2: Add `setAdminUserDisabled` callable.

Input:

```ts
{ uid: string; disabled: boolean }
```

Behavior:
- write `users/{uid}.adminFlags.disabled`
- mirror to custom claims only if needed later; skip in v1 if the app does not enforce it yet
- write audit log

Step 3: Add `clearAdminUserPushToken` callable.

Input:

```ts
{ uid: string }
```

Behavior:
- remove `fcmToken` and `fcmTokenUpdatedAt`
- write audit log

Step 4: Rebuild functions.

Run: `cd functions && npm run build`
Expected: PASS

Step 5: Commit.

```bash
git add functions/src/index.ts functions/lib/index.js functions/lib/index.js.map
git commit -m "feat: add admin user mutation callables"
```

---

## Task 6: Add client admin service wrappers

Objective: Expose typed helpers for the new admin callables.

Files:
- Create: `src/services/adminService.ts`
- Modify: `src/services/functionsService.ts` only if you prefer to colocate wrappers there

Step 1: Prefer a separate admin-specific service file.

Add wrappers:
- `searchAdminUsers(query?: string, limit?: number)`
- `getAdminUserDetail(uid: string)`
- `updateAdminUserSubscription(uid, subscription)`
- `setAdminUserDisabled(uid, disabled)`
- `clearAdminUserPushToken(uid)`

Step 2: Use `httpsCallable` exactly as in `src/services/functionsService.ts`.

Step 3: Type-check.

Run: `npx tsc --noEmit`
Expected: PASS

Step 4: Commit.

```bash
git add src/services/adminService.ts src/services/functionsService.ts src/types/admin.ts
git commit -m "feat: add admin service wrappers"
```

---

## Task 7: Surface admin claim state in auth store

Objective: Let the UI know whether the current signed-in user is an admin.

Files:
- Modify: `src/store/authStore.ts`

Step 1: Extend auth store state with:
- `isAdmin: boolean`
- `refreshClaims: () => Promise<void>`

Step 2: On auth change, call:

```ts
const tokenResult = user ? await user.getIdTokenResult(true) : null;
const isAdmin = tokenResult?.claims?.admin === true;
```

Step 3: Save `isAdmin` in Zustand state and clear it on logout.

Step 4: Type-check.

Run: `npx tsc --noEmit`
Expected: PASS

Step 5: Commit.

```bash
git add src/store/authStore.ts
git commit -m "feat: expose admin claims in auth store"
```

---

## Task 8: Add admin route shell

Objective: Create a guarded admin route in the Expo Router app.

Files:
- Create: `app/admin/_layout.tsx`
- Create: `app/admin/index.tsx`
- Modify: `app/_layout.tsx` if route registration needs adjustment

Step 1: Create `app/admin/_layout.tsx` with a simple stack layout.

Step 2: In `app/admin/index.tsx`, handle 3 states:
- loading auth claims
- signed in but not admin -> access denied message
- admin -> show console UI

Step 3: Reuse existing components where possible:
- `ScreenHeader`
- `ResetScrollView`
- `GradientCard`
- `CosmicButton`
- `CosmicAlert`

Step 4: Type-check.

Run: `npx tsc --noEmit`
Expected: PASS

Step 5: Commit.

```bash
git add app/admin/_layout.tsx app/admin/index.tsx app/_layout.tsx
git commit -m "feat: add guarded admin console route"
```

---

## Task 9: Add user search UI

Objective: Let admins search and select users quickly.

Files:
- Modify: `app/admin/index.tsx`

Step 1: Add a search input with local state:
- `query`
- `results`
- `loading`
- `selectedUid`

Step 2: On submit, call `searchAdminUsers(query, 20)`.

Step 3: Render result cards with:
- name
- email
- uid
- subscription badge
- disabled badge if set
- onboarding/chart status

Step 4: Clicking a result should either:
- expand inline detail below, or
- route to `app/admin/user/[uid].tsx`

Recommendation: choose route-based detail page for cleaner code.

Step 5: Commit.

```bash
git add app/admin/index.tsx
git commit -m "feat: add admin user search interface"
```

---

## Task 10: Add user detail page

Objective: Show a full admin-readable view of one user.

Files:
- Create: `app/admin/user/[uid].tsx`

Step 1: Load the `uid` param from Expo Router.

Step 2: Call `getAdminUserDetail(uid)` and render:
- profile header
- subscription state
- onboarding + chart readiness
- active systems
- push token presence
- usage counters
- raw profile JSON section (collapsed by default)

Step 3: Add action buttons:
- Refresh
- Clear push token
- Disable / Enable account

Step 4: Add an inline subscription edit form for:
- tier
- status
- billing period
- product id optional text field

Step 5: Type-check.

Run: `npx tsc --noEmit`
Expected: PASS

Step 6: Commit.

```bash
git add app/admin/user/[uid].tsx
git commit -m "feat: add admin user detail screen"
```

---

## Task 11: Add audit logging on the backend

Objective: Record who changed what in the admin console.

Files:
- Modify: `functions/src/index.ts`

Step 1: Add helper:

```ts
async function writeAdminAuditLog(actorUid: string, action: string, targetUid: string, payload?: Record<string, unknown>) {
  await db.collection('adminAuditLogs').add({
    actorUid,
    action,
    targetUid,
    payload: toJsonSafeObject(payload ?? {}),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}
```

Step 2: Call this helper from every admin mutation callable.

Step 3: Rebuild functions.

Run: `cd functions && npm run build`
Expected: PASS

Step 4: Commit.

```bash
git add functions/src/index.ts functions/lib/index.js functions/lib/index.js.map
git commit -m "feat: add admin audit logging"
```

---

## Task 12: Add bootstrap instructions for the first admin

Objective: Make it possible to grant the first admin claim safely.

Files:
- Create: `docs/plans/admin-bootstrap.md`

Step 1: Document one of these flows:
- Firebase Admin SDK script
- `firebase functions:shell` snippet
- temporary Node script using service account

Suggested script:

```js
const admin = require('firebase-admin');
admin.initializeApp();

async function main() {
  const uid = process.argv[2];
  await admin.auth().setCustomUserClaims(uid, { admin: true });
  console.log(`Granted admin to ${uid}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

Step 2: Explain how to revoke:

```js
await admin.auth().setCustomUserClaims(uid, { admin: false });
```

Step 3: Commit.

```bash
git add docs/plans/admin-bootstrap.md
git commit -m "docs: add admin bootstrap instructions"
```

---

## Task 13: Verify end-to-end manually

Objective: Confirm the admin console works against real auth and functions.

Files:
- No new files required

Step 1: Deploy updated functions.

Run:
```bash
cd functions && npm run build
firebase deploy --only functions
```

Expected: Functions deploy successfully.

Step 2: Grant admin claim to one test account.

Step 3: Sign into the app as that account and open `/admin` on web.

Step 4: Verify:
- non-admin user sees access denied
- admin can search a known user
- detail page loads
- subscription update persists to Firestore
- clear push token removes `fcmToken`
- disable toggle writes `adminFlags.disabled`
- audit log document is created

Step 5: Commit any follow-up fixes.

---

## Future phase ideas

After v1 ships, consider:
- pagination with `pageToken`
- trend analytics / cohort stats
- support notes per user
- impersonation-safe preview mode
- resend push test notification
- hard lockout enforced in app auth flow using `adminFlags.disabled`
- admin analytics dashboard cards (DAU, premium conversion, retention, churn)

---

## Acceptance criteria

The feature is complete when:
- admin authorization is enforced server-side, not just in the UI
- no broad admin Firestore read rule is added for v1
- admins can search users and open a detail page
- admins can view profile + subscription + activity state
- admins can update subscription, clear push token, and disable/enable users
- admin mutations are audit-logged
- non-admin users cannot access any admin callable successfully
