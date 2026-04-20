import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { calculateWesternChart } from './calculations/western';
import { calculateVedicChart } from './calculations/vedic';
import { calculateChineseChart } from './calculations/chinese';
import { calculateKPChart } from './calculations/kp';
import { buildTransitReading } from './dailyPrediction';
import { extractPredictionFeatures } from './ml/featureExtraction';
import { runPredictionModel } from './ml/modelScoring';
import type { PredictionFeedbackRecord, PredictionRunRecord, PredictionWindow } from './ml/types';
import { geocodePlace, localToUtc } from './utils/geocoding';

export { askAkasha } from './akasha/askAkasha';
export { getSharedReading } from './sharing/getSharedReading';

admin.initializeApp();
const db = admin.firestore();
const DAILY_READING_VERSION = 5;
const HIGH_IMPACT_TRANSIT_ORB = 1.25;

type JsonSafeValue = null | boolean | number | string | JsonSafeValue[] | { [key: string]: JsonSafeValue };
type JsonSafeObject = { [key: string]: JsonSafeValue };

type TransitNotificationHit = {
  transitPlanet?: unknown;
  natalPlanet?: unknown;
  aspect?: unknown;
  orb?: unknown;
  nature?: unknown;
  brief?: unknown;
};

function toJsonSafe(value: unknown): JsonSafeValue {
  if (value === null || value === undefined) return null;

  if (typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (value instanceof Date) return value.toISOString();
  if (value instanceof admin.firestore.Timestamp) return value.toDate().toISOString();
  if (value instanceof admin.firestore.GeoPoint) {
    return { latitude: value.latitude, longitude: value.longitude };
  }
  if (value instanceof admin.firestore.DocumentReference) {
    return { path: value.path };
  }
  if (Array.isArray(value)) return value.map((item) => toJsonSafe(item));
  if (typeof value === 'object') {
    const maybeBytes = value as { toBase64?: () => string };
    if (typeof maybeBytes.toBase64 === 'function') {
      return { base64: maybeBytes.toBase64() };
    }

    const output: JsonSafeObject = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      output[key] = toJsonSafe(nested);
    }
    return output;
  }

  return String(value);
}

function toJsonSafeObject(value: Record<string, unknown>): JsonSafeObject {
  return toJsonSafe(value) as JsonSafeObject;
}

function sanitizeProfileForExport(value: FirebaseFirestore.DocumentData): JsonSafeObject {
  const profile = { ...value };
  delete profile.fcmToken;
  return toJsonSafeObject(profile);
}

type AdminCallableRequest = {
  auth?: {
    uid?: string;
    token?: Record<string, unknown>;
  } | null;
};

type AdminSubscriptionTier = 'free' | 'premium';
type AdminSubscriptionStatus = 'active' | 'expired' | 'trial' | 'unknown';
type AdminBillingPeriod = 'monthly' | 'yearly';

interface AdminUserListItem {
  uid: string;
  name: string;
  email: string | null;
  subscriptionTier: AdminSubscriptionTier;
  subscriptionStatus: AdminSubscriptionStatus;
  onboardingComplete: boolean;
  chartCalculated: boolean;
  disabled: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface AdminUserDetail extends AdminUserListItem {
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

interface AdminDashboardSummary {
  totals: {
    users: number;
    premiumUsers: number;
    disabledUsers: number;
    chartReadyUsers: number;
    pushReadyUsers: number;
  };
  recentUsers: AdminUserListItem[];
  settings: {
    maintenanceMode: boolean;
    supportEmail: string;
    broadcastPushEnabled: boolean;
    latestBroadcastAt?: string | null;
  };
}

function assertAdmin(request: AdminCallableRequest) {
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
  if (typeof value === 'object' && value !== null && 'toDate' in (value as Record<string, unknown>)) {
    const converted = (value as { toDate?: () => Date }).toDate?.();
    if (converted instanceof Date && !Number.isNaN(converted.getTime())) {
      return converted.toISOString();
    }
  }
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function normalizeAdminSubscriptionTier(value: unknown): AdminSubscriptionTier {
  return value === 'premium' || value === 'family' ? 'premium' : 'free';
}

function normalizeAdminSubscriptionStatus(value: unknown): AdminSubscriptionStatus {
  return value === 'active' || value === 'expired' || value === 'trial' ? value : 'unknown';
}

function compareAdminUsersByRecency(a: AdminUserListItem, b: AdminUserListItem): number {
  const aUpdated = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
  const bUpdated = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
  if (aUpdated !== bUpdated) return bUpdated - aUpdated;

  const aCreated = new Date(a.createdAt ?? 0).getTime();
  const bCreated = new Date(b.createdAt ?? 0).getTime();
  return bCreated - aCreated;
}

function buildAdminUserListItem(
  authUser: admin.auth.UserRecord,
  profileData?: FirebaseFirestore.DocumentData | null
): AdminUserListItem {
  const name = typeof profileData?.name === 'string' && profileData.name.trim()
    ? profileData.name.trim()
    : authUser.displayName?.trim() || authUser.email?.split('@')[0] || authUser.uid;

  return {
    uid: authUser.uid,
    name,
    email: authUser.email ?? null,
    subscriptionTier: normalizeAdminSubscriptionTier(profileData?.subscription?.tier),
    subscriptionStatus: normalizeAdminSubscriptionStatus(profileData?.subscription?.status),
    onboardingComplete: Boolean(profileData?.onboardingComplete),
    chartCalculated: Boolean(profileData?.chartCalculated),
    disabled: Boolean(profileData?.adminFlags?.disabled),
    createdAt: toIso(profileData?.createdAt) ?? toIso(authUser.metadata.creationTime),
    updatedAt: toIso(profileData?.updatedAt) ?? toIso(authUser.metadata.lastRefreshTime) ?? toIso(authUser.metadata.lastSignInTime),
  };
}

async function writeAdminAuditLog(input: {
  actorUid: string;
  action: string;
  targetUid: string;
  details?: Record<string, unknown>;
}) {
  await db.collection('adminAuditLogs').add({
    actorUid: input.actorUid,
    action: input.action,
    targetUid: input.targetUid,
    details: toJsonSafeObject(input.details ?? {}),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

function getDefaultAdminSettings() {
  return {
    maintenanceMode: false,
    supportEmail: 'admin@cosmicself.app',
    broadcastPushEnabled: true,
    latestBroadcastAt: null as string | null,
  };
}

async function getAdminSettings() {
  const snap = await db.doc('admin/config').get();
  const defaults = getDefaultAdminSettings();
  const data = snap.exists ? snap.data() ?? {} : {};
  return {
    maintenanceMode: Boolean(data.maintenanceMode ?? defaults.maintenanceMode),
    supportEmail: typeof data.supportEmail === 'string' && data.supportEmail.trim()
      ? data.supportEmail.trim()
      : defaults.supportEmail,
    broadcastPushEnabled: Boolean(data.broadcastPushEnabled ?? defaults.broadcastPushEnabled),
    latestBroadcastAt: toIso(data.latestBroadcastAt) ?? defaults.latestBroadcastAt,
  };
}

async function listAllAuthUsers(maxPages = 10) {
  const users: admin.auth.UserRecord[] = [];
  let pageToken: string | undefined;
  let page = 0;
  do {
    const result = await admin.auth().listUsers(1000, pageToken);
    users.push(...result.users);
    pageToken = result.pageToken;
    page += 1;
  } while (pageToken && page < maxPages);
  return users;
}

async function countCollectionDocuments(path: string, limit = 200): Promise<number> {
  const snap = await db.collection(path).limit(limit).get();
  return snap.size;
}

async function readCollectionForExport(path: string): Promise<JsonSafeObject[]> {
  const snap = await db.collection(path).get();
  return snap.docs
    .map((doc) => ({
      documentId: doc.id,
      ...toJsonSafeObject(doc.data()),
    }))
    .sort((a, b) => String(a.documentId).localeCompare(String(b.documentId)));
}

function isPremiumSubscriber(userData: FirebaseFirestore.DocumentData): boolean {
  const tier = userData.subscription?.tier;
  const status = userData.subscription?.status;
  return tier === 'premium' && (status === 'active' || status === 'trial');
}

function formatTransitPart(value: unknown): string {
  return String(value ?? '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim();
}

function getPremiumTransitNotification(reading: any): { title: string; body: string } | null {
  const transits: TransitNotificationHit[] = Array.isArray(reading?.activeTransits) ? reading.activeTransits : [];
  const hit = transits
    .filter((transit): transit is TransitNotificationHit & { orb: number; nature: 'support' | 'tension' } =>
      typeof transit?.orb === 'number' &&
      transit.orb <= HIGH_IMPACT_TRANSIT_ORB &&
      (transit.nature === 'support' || transit.nature === 'tension')
    )
    .sort((a, b) => a.orb - b.orb)[0];

  if (!hit) return null;

  const transitPlanet = formatTransitPart(hit.transitPlanet);
  const natalPlanet = formatTransitPart(hit.natalPlanet);
  const aspect = formatTransitPart(hit.aspect).toLowerCase();
  const label = `${transitPlanet} ${aspect} natal ${natalPlanet}`.replace(/\s+/g, ' ').trim();
  const body = String(hit.brief || `A tight ${label} transit is active today.`).trim();

  return {
    title: hit.nature === 'support' ? `Transit opening: ${transitPlanet}` : `Transit alert: ${transitPlanet}`,
    body: body.length > 100 ? `${body.slice(0, 97)}...` : body,
  };
}

// ─── calculateChart ───────────────────────────────────────────────────────────
// Called from app after user enters birth details.
// Returns full chart for all 4 systems + saves to Firestore.
export const calculateChart = onCall({ region: 'us-central1' }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required.');

  const { birthDate, birthTime, birthPlace } = request.data as {
    birthDate: string;  // 'YYYY-MM-DD'
    birthTime: string;  // 'HH:MM'
    birthPlace: string; // 'City, Country'
  };

  if (!birthDate || !birthTime || !birthPlace) {
    throw new HttpsError('invalid-argument', 'birthDate, birthTime, birthPlace required.');
  }

  try {
    // 1. Geocode birth place
    const geo = await geocodePlace(birthPlace);

    // 2. Convert local birth time to UTC
    const birthDateUtc = localToUtc(birthDate, birthTime, geo.timezone);

    // 3. Calculate all 4 systems
    const [western, vedic, chinese, kp] = await Promise.all([
      calculateWesternChart(birthDateUtc, geo.lat, geo.lng),
      calculateVedicChart(birthDateUtc, geo.lat, geo.lng),
      calculateChineseChart(birthDateUtc),
      calculateKPChart(birthDateUtc, geo.lat, geo.lng),
    ]);

    const chart = {
      western,
      vedic,
      chinese,
      kp,
      birthData: {
        date: birthDate,
        time: birthTime,
        place: birthPlace,
        lat: geo.lat,
        lng: geo.lng,
        timezone: geo.timezone,
        utcDate: birthDateUtc.toISOString(),
      },
      calculatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // 4. Save to Firestore
    await db.doc(`charts/${request.auth.uid}`).set(chart, { merge: true });

    // 5. Update user profile with derived sign data
    await db.doc(`users/${request.auth.uid}`).update({
      'western.sun': western.sun,
      'western.moon': western.moon,
      'western.rising': western.rising,
      'vedic.rashi': vedic.rashi,
      'vedic.lagna': vedic.lagna,
      'vedic.nakshatra': vedic.nakshatra,
      'chinese.animal': chinese.animal,
      'chinese.element': chinese.element,
      'kp.lagna': kp.lagna,
      'kp.lagnaSubLord': kp.lagnaSubLord,
      chartCalculated: true,
    });

    return { success: true, chart };
  } catch (err: any) {
    console.error('calculateChart error:', err);
    throw new HttpsError('internal', err.message ?? 'Calculation failed.');
  }
});

// ─── getDailyReading ──────────────────────────────────────────────────────────
// Returns personalized daily reading based on current transits vs natal chart.
export const getDailyReading = onCall({ region: 'us-central1' }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required.');

  const uid = request.auth.uid;
  const dateKey = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Check cache first
  const cached = await db.doc(`dailyReadings/${uid}/dates/${dateKey}`).get();
  if (cached.exists) {
    const cachedReading = cached.data() as Record<string, any> | undefined;
    if (cachedReading?.version === DAILY_READING_VERSION) return { reading: cachedReading, cached: true };
  }

  // Get user's natal chart
  const chartSnap = await db.doc(`charts/${uid}`).get();
  if (!chartSnap.exists) throw new HttpsError('not-found', 'No chart found. Calculate chart first.');

  const chart = chartSnap.data()!;
  const now = new Date();

  // Current transits
  const { getAllPlanets } = await import('./calculations/ephemeris');
  const transits = getAllPlanets(now);

  // Generate reading text based on transits vs natal
  const reading = buildTransitReading(chart, transits, now);

  await db.doc(`dailyReadings/${uid}/dates/${dateKey}`).set({
    ...reading,
    generatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { reading, cached: false };
});

// ─── calculateCompatibility ───────────────────────────────────────────────────
// Called when User A wants synastry against User B (via QR / uid).
export const calculateCompatibility = onCall({ region: 'us-central1' }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required.');

  const { partnerUid } = request.data as { partnerUid: string };
  if (!partnerUid) throw new HttpsError('invalid-argument', 'partnerUid required.');

  const uid = request.auth.uid;
  if (uid === partnerUid) throw new HttpsError('invalid-argument', 'Cannot compare with yourself.');

  const [mySnap, partnerSnap] = await Promise.all([
    db.doc(`charts/${uid}`).get(),
    db.doc(`charts/${partnerUid}`).get(),
  ]);

  if (!mySnap.exists) throw new HttpsError('not-found', 'Your chart has not been calculated yet.');
  if (!partnerSnap.exists) throw new HttpsError('not-found', 'Partner chart not found. They need to calculate their chart first.');

  const myChart = mySnap.data()!;
  const partnerChart = partnerSnap.data()!;

  // Synastry: compare planet positions of both charts
  const synastry = calculateSynastry(myChart, partnerChart);

  // Save to connections subcollection
  await db.doc(`connections/${uid}/partners/${partnerUid}`).set({
    ...synastry,
    calculatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { synastry };
});

function calculateSynastry(chart1: any, chart2: any) {
  const planets1 = chart1.western?.planets ?? {};
  const planets2 = chart2.western?.planets ?? {};

  // Cross-chart aspects
  const aspects: Array<{ planet1: string; planet2: string; aspect: string; orb: number }> = [];
  const ASPECT_ANGLES: Record<number, string> = { 0: 'Conjunction', 60: 'Sextile', 90: 'Square', 120: 'Trine', 180: 'Opposition' };
  const KEY_PLANETS = ['SUN','MOON','VENUS','MARS','JUPITER','SATURN'];

  for (const p1 of KEY_PLANETS) {
    for (const p2 of KEY_PLANETS) {
      const pos1 = planets1[p1];
      const pos2 = planets2[p2];
      if (!pos1 || !pos2) continue;
      let diff = Math.abs((pos1.longitude ?? 0) - (pos2.longitude ?? 0));
      if (diff > 180) diff = 360 - diff;
      for (const [angle, name] of Object.entries(ASPECT_ANGLES)) {
        const orb = Math.abs(diff - Number(angle));
        if (orb <= 8) {
          aspects.push({ planet1: `Your ${p1}`, planet2: `Their ${p2}`, aspect: name, orb: Math.round(orb * 10) / 10 });
        }
      }
    }
  }

  // Element compatibility between sun signs
  const ELEMENTS: Record<string, string> = {
    Aries:'Fire',Leo:'Fire',Sagittarius:'Fire',
    Taurus:'Earth',Virgo:'Earth',Capricorn:'Earth',
    Gemini:'Air',Libra:'Air',Aquarius:'Air',
    Cancer:'Water',Scorpio:'Water',Pisces:'Water',
  };
  const COMPAT: Record<string, Record<string, number>> = {
    Fire: { Fire:80, Air:90, Earth:50, Water:45 },
    Earth: { Earth:75, Water:85, Fire:50, Air:55 },
    Air: { Air:75, Fire:88, Water:50, Earth:55 },
    Water: { Water:80, Earth:85, Air:50, Fire:45 },
  };
  const el1 = ELEMENTS[chart1.western?.sun] ?? 'Fire';
  const el2 = ELEMENTS[chart2.western?.sun] ?? 'Fire';
  const westernScore = COMPAT[el1]?.[el2] ?? 65;

  // Vedic Guna Milan (simplified)
  const NAKSHATRA_COMPAT: Record<string, number> = {
    'Ashwini-Rohini': 28, 'Rohini-Mrigashira': 25, 'Ashwini-Ashwini': 18,
  };
  const nKey = [chart1.vedic?.nakshatra, chart2.vedic?.nakshatra].sort().join('-');
  const vedicScore = NAKSHATRA_COMPAT[nKey] ?? Math.floor(50 + Math.random() * 30);

  // Chinese compatibility
  const CHINESE_COMPAT: Record<string, string[]> = {
    Rat: ['Dragon','Monkey','Ox'], Ox: ['Rat','Snake','Rooster'],
    Tiger: ['Horse','Dog','Dragon'], Rabbit: ['Sheep','Dog','Pig'],
    Dragon: ['Rat','Monkey','Rooster'], Snake: ['Ox','Rooster'],
    Horse: ['Tiger','Dog','Sheep'], Sheep: ['Rabbit','Horse','Pig'],
    Monkey: ['Rat','Dragon'], Rooster: ['Ox','Snake','Dragon'],
    Dog: ['Tiger','Rabbit','Horse'], Pig: ['Rabbit','Sheep'],
  };
  const a1 = chart1.chinese?.animal;
  const a2 = chart2.chinese?.animal;
  const chineseScore = (CHINESE_COMPAT[a1] ?? []).includes(a2) ? 85 : 60;

  const overall = Math.round(westernScore * 0.3 + vedicScore * 0.35 + chineseScore * 0.35);

  const trines = aspects.filter(a => a.aspect === 'Trine').length;
  const conjunctions = aspects.filter(a => a.aspect === 'Conjunction').length;
  const tensions = aspects.filter(a => a.aspect === 'Square').length;

  return {
    overall: Math.max(35, Math.min(98, overall)),
    western: { score: westernScore, element1: el1, element2: el2 },
    vedic: { score: vedicScore, nakshatra1: chart1.vedic?.nakshatra, nakshatra2: chart2.vedic?.nakshatra },
    chinese: { score: chineseScore, animal1: a1, animal2: a2 },
    aspects,
    summary: `${trines} harmonious trines, ${conjunctions} powerful conjunctions, ${tensions} growth-bringing squares`,
  };
}

// ─── registerFCMToken ─────────────────────────────────────────────────────────
// Called from app when user logs in — saves their push token to Firestore.
export const registerFCMToken = onCall({ region: 'us-central1' }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required.');
  const { token } = request.data as { token: string };
  if (!token) throw new HttpsError('invalid-argument', 'token required.');

  await db.doc(`users/${request.auth.uid}`).update({
    fcmToken: token,
    fcmTokenUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { success: true };
});

export const searchAdminUsers = onCall({ region: 'us-central1' }, async (request) => {
  assertAdmin(request);

  const rawQuery = typeof request.data?.query === 'string' ? request.data.query.trim() : '';
  const normalizedQuery = rawQuery.toLowerCase();
  const limit = Math.max(1, Math.min(Number(request.data?.limit ?? 20), 50));
  const looksLikeUid = /^[A-Za-z0-9_-]{20,128}$/.test(rawQuery);
  const authUsers = new Map<string, admin.auth.UserRecord>();

  if (!rawQuery) {
    const users = await listAllAuthUsers(2);
    const profileRefs = users.map((user) => db.doc(`users/${user.uid}`));
    const profileSnaps = users.length ? await db.getAll(...profileRefs) : [];
    const profileByUid = new Map(profileSnaps.map((snap) => [snap.id, snap.exists ? snap.data() : null]));

    return {
      users: users
        .map((user) => buildAdminUserListItem(user, profileByUid.get(user.uid)))
        .sort(compareAdminUsersByRecency)
        .slice(0, limit),
    };
  }

  if (looksLikeUid) {
    try {
      const user = await admin.auth().getUser(rawQuery);
      authUsers.set(user.uid, user);
    } catch (error: any) {
      if (error?.code !== 'auth/user-not-found') {
        throw new HttpsError('internal', error?.message ?? 'Failed to search users.');
      }
    }
  }

  let pageToken: string | undefined;
  let pages = 0;
  while (authUsers.size < limit && pages < 5) {
    const page = await admin.auth().listUsers(1000, pageToken);
    for (const user of page.users) {
      const email = user.email?.toLowerCase() ?? '';
      const displayName = user.displayName?.toLowerCase() ?? '';
      const uid = user.uid.toLowerCase();

      if (email.includes(normalizedQuery) || displayName.includes(normalizedQuery) || uid.includes(normalizedQuery)) {
        authUsers.set(user.uid, user);
        if (authUsers.size >= limit) break;
      }
    }

    if (!page.pageToken || authUsers.size >= limit) break;
    pageToken = page.pageToken;
    pages += 1;
  }

  const users = Array.from(authUsers.values());
  const profileRefs = users.map((user) => db.doc(`users/${user.uid}`));
  const profileSnaps = users.length ? await db.getAll(...profileRefs) : [];
  const profileByUid = new Map(profileSnaps.map((snap) => [snap.id, snap.exists ? snap.data() : null]));

  return {
    users: users
      .map((user) => buildAdminUserListItem(user, profileByUid.get(user.uid)))
      .sort(compareAdminUsersByRecency)
      .slice(0, limit),
  };
});

export const getAdminDashboardSummary = onCall({ region: 'us-central1' }, async (request) => {
  assertAdmin(request);

  const authUsers = await listAllAuthUsers(10);
  const profileRefs = authUsers.map((user) => db.doc(`users/${user.uid}`));
  const profileSnaps = authUsers.length ? await db.getAll(...profileRefs) : [];
  const profileByUid = new Map(profileSnaps.map((snap) => [snap.id, snap.exists ? snap.data() : null]));

  let premiumUsers = 0;
  let disabledUsers = 0;
  let chartReadyUsers = 0;
  let pushReadyUsers = 0;

  const recentUsers = authUsers
    .map((user) => buildAdminUserListItem(user, profileByUid.get(user.uid)))
    .sort(compareAdminUsersByRecency)
    .slice(0, 12);

  for (const user of authUsers) {
    const profile = profileByUid.get(user.uid);
    if (normalizeAdminSubscriptionTier(profile?.subscription?.tier) === 'premium') premiumUsers += 1;
    if (Boolean(profile?.adminFlags?.disabled)) disabledUsers += 1;
    if (Boolean(profile?.chartCalculated)) chartReadyUsers += 1;
    if (typeof profile?.fcmToken === 'string' && profile.fcmToken.length > 0) pushReadyUsers += 1;
  }

  const settings = await getAdminSettings();
  const summary: AdminDashboardSummary = {
    totals: {
      users: authUsers.length,
      premiumUsers,
      disabledUsers,
      chartReadyUsers,
      pushReadyUsers,
    },
    recentUsers,
    settings,
  };

  return summary;
});

export const updateAdminGlobalSettings = onCall({ region: 'us-central1' }, async (request) => {
  assertAdmin(request);

  const settings = (request.data?.settings ?? {}) as Record<string, unknown>;
  const updates: Record<string, unknown> = {
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  if (typeof settings.maintenanceMode === 'boolean') {
    updates.maintenanceMode = settings.maintenanceMode;
  }
  if (typeof settings.broadcastPushEnabled === 'boolean') {
    updates.broadcastPushEnabled = settings.broadcastPushEnabled;
  }
  if (typeof settings.supportEmail === 'string' && settings.supportEmail.trim()) {
    updates.supportEmail = settings.supportEmail.trim().slice(0, 120);
  }

  await db.doc('admin/config').set(updates, { merge: true });
  await writeAdminAuditLog({
    actorUid: request.auth!.uid!,
    action: 'updateAdminGlobalSettings',
    targetUid: 'admin/config',
    details: { updates },
  });

  return { success: true, uid: 'admin/config', message: 'Admin settings updated.' };
});

export const sendAdminBroadcastNotification = onCall({ region: 'us-central1' }, async (request) => {
  assertAdmin(request);

  const title = typeof request.data?.title === 'string' ? request.data.title.trim() : '';
  const body = typeof request.data?.body === 'string' ? request.data.body.trim() : '';
  const target = request.data?.target === 'premium' ? 'premium' : 'all';
  const dryRun = Boolean(request.data?.dryRun);

  if (!title || !body) {
    throw new HttpsError('invalid-argument', 'title and body are required.');
  }

  const settings = await getAdminSettings();
  if (!settings.broadcastPushEnabled) {
    throw new HttpsError('failed-precondition', 'Broadcast push is disabled in admin settings.');
  }

  const authUsers = await listAllAuthUsers(10);
  const profileRefs = authUsers.map((user) => db.doc(`users/${user.uid}`));
  const profileSnaps = authUsers.length ? await db.getAll(...profileRefs) : [];
  const profileByUid = new Map(profileSnaps.map((snap) => [snap.id, snap.exists ? snap.data() : null]));

  const tokens = authUsers
    .filter((user) => {
      const profile = profileByUid.get(user.uid);
      if (!profile || typeof profile.fcmToken !== 'string' || !profile.fcmToken.length) return false;
      if (target === 'premium') return normalizeAdminSubscriptionTier(profile.subscription?.tier) === 'premium';
      return true;
    })
    .map((user) => String(profileByUid.get(user.uid)?.fcmToken));

  const attempted = tokens.length;
  let sent = 0;
  let failed = 0;

  if (!dryRun && tokens.length > 0) {
    const response = await admin.messaging().sendEachForMulticast({
      tokens,
      notification: { title: title.slice(0, 80), body: body.slice(0, 200) },
      data: { screen: 'today', kind: 'admin_broadcast' },
    });
    sent = response.successCount;
    failed = response.failureCount;
  }

  await db.doc('admin/config').set({
    latestBroadcastAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  await writeAdminAuditLog({
    actorUid: request.auth!.uid!,
    action: 'sendAdminBroadcastNotification',
    targetUid: 'broadcast',
    details: { title, body, target, dryRun, attempted, sent, failed },
  });

  return {
    success: true,
    target,
    dryRun,
    attempted,
    sent: dryRun ? 0 : sent,
    failed: dryRun ? 0 : failed,
    message: dryRun
      ? `Dry run complete. ${attempted} device tokens match the selected audience.`
      : `Broadcast sent to ${sent} devices${failed ? `, ${failed} failed.` : '.'}`,
  };
});

export const getAdminUserDetail = onCall({ region: 'us-central1' }, async (request) => {
  assertAdmin(request);

  const uid = typeof request.data?.uid === 'string' ? request.data.uid.trim() : '';
  if (!uid) {
    throw new HttpsError('invalid-argument', 'uid is required.');
  }

  let authUser: admin.auth.UserRecord;
  try {
    authUser = await admin.auth().getUser(uid);
  } catch (error: any) {
    if (error?.code === 'auth/user-not-found') {
      throw new HttpsError('not-found', 'User not found.');
    }
    throw new HttpsError('internal', error?.message ?? 'Failed to load user detail.');
  }

  const [profileSnap, chartSnap, dailyReadingsCount, predictionRunsCount, connectionsCount] = await Promise.all([
    db.doc(`users/${uid}`).get(),
    db.doc(`charts/${uid}`).get(),
    countCollectionDocuments(`dailyReadings/${uid}/dates`),
    countCollectionDocuments(`predictionRuns/${uid}/runs`),
    countCollectionDocuments(`connections/${uid}/partners`),
  ]);

  const profileData = profileSnap.exists ? profileSnap.data() ?? {} : {};
  const chartData = chartSnap.exists ? chartSnap.data() ?? {} : {};
  const listItem = buildAdminUserListItem(authUser, profileData);

  const rawProfile = profileSnap.exists ? sanitizeProfileForExport(profileData) : {};
  delete rawProfile.fcmTokenUpdatedAt;

  const birthDetails = (profileData.birthDetails ?? {}) as Record<string, unknown>;
  const birthPlace = birthDetails.place as { name?: unknown } | undefined;

  const detail: AdminUserDetail = {
    ...listItem,
    language: typeof profileData.language === 'string' ? profileData.language : null,
    activeSystems: Array.isArray(profileData.activeSystems)
      ? profileData.activeSystems.filter((system: unknown): system is string => typeof system === 'string')
      : [],
    cosmicPoints: typeof profileData.cosmicPoints === 'number' ? profileData.cosmicPoints : undefined,
    streak: typeof profileData.streak === 'number' ? profileData.streak : undefined,
    lastCheckIn: toIso(profileData.lastCheckIn),
    birthPlaceName: typeof birthPlace?.name === 'string'
      ? birthPlace.name
      : typeof birthDetails.birthPlace === 'string'
        ? birthDetails.birthPlace
        : null,
    hasFcmToken: typeof profileData.fcmToken === 'string' && profileData.fcmToken.length > 0,
    chartSummary: {
      hasWestern: Boolean(chartData.western),
      hasVedic: Boolean(chartData.vedic),
      hasChinese: Boolean(chartData.chinese),
      hasKP: Boolean(chartData.kp),
    },
    counts: {
      dailyReadings: dailyReadingsCount,
      predictionRuns: predictionRunsCount,
      connections: connectionsCount,
    },
    rawProfile,
  };

  return detail;
});

export const updateAdminUserSubscription = onCall({ region: 'us-central1' }, async (request) => {
  assertAdmin(request);

  const uid = typeof request.data?.uid === 'string' ? request.data.uid.trim() : '';
  const subscription = request.data?.subscription as {
    tier?: unknown;
    status?: unknown;
    billingPeriod?: unknown;
    productId?: unknown;
  } | undefined;

  if (!uid) {
    throw new HttpsError('invalid-argument', 'uid is required.');
  }

  if (!subscription || (subscription.tier !== 'free' && subscription.tier !== 'premium')) {
    throw new HttpsError('invalid-argument', 'subscription tier must be free or premium.');
  }

  if (subscription.status !== 'active' && subscription.status !== 'expired' && subscription.status !== 'trial') {
    throw new HttpsError('invalid-argument', 'subscription status must be active, expired, or trial.');
  }

  if (
    subscription.billingPeriod !== undefined &&
    subscription.billingPeriod !== 'monthly' &&
    subscription.billingPeriod !== 'yearly'
  ) {
    throw new HttpsError('invalid-argument', 'billingPeriod must be monthly or yearly when provided.');
  }

  const nextSubscription: {
    tier: AdminSubscriptionTier;
    status: Exclude<AdminSubscriptionStatus, 'unknown'>;
    billingPeriod?: AdminBillingPeriod;
    productId?: string;
  } = {
    tier: subscription.tier,
    status: subscription.status,
  };

  if (subscription.billingPeriod === 'monthly' || subscription.billingPeriod === 'yearly') {
    nextSubscription.billingPeriod = subscription.billingPeriod;
  }
  if (typeof subscription.productId === 'string' && subscription.productId.trim()) {
    nextSubscription.productId = subscription.productId.trim();
  }

  await db.doc(`users/${uid}`).set({
    subscription: nextSubscription,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  await writeAdminAuditLog({
    actorUid: request.auth!.uid!,
    action: 'updateAdminUserSubscription',
    targetUid: uid,
    details: { subscription: nextSubscription },
  });

  return { success: true, uid, message: 'Subscription updated.' };
});

export const setAdminUserDisabled = onCall({ region: 'us-central1' }, async (request) => {
  assertAdmin(request);

  const uid = typeof request.data?.uid === 'string' ? request.data.uid.trim() : '';
  const disabled = request.data?.disabled;

  if (!uid || typeof disabled !== 'boolean') {
    throw new HttpsError('invalid-argument', 'uid and disabled are required.');
  }

  await db.doc(`users/${uid}`).set({
    adminFlags: { disabled },
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  await writeAdminAuditLog({
    actorUid: request.auth!.uid!,
    action: 'setAdminUserDisabled',
    targetUid: uid,
    details: { disabled },
  });

  return { success: true, uid, message: disabled ? 'User disabled.' : 'User re-enabled.' };
});

export const clearAdminUserPushToken = onCall({ region: 'us-central1' }, async (request) => {
  assertAdmin(request);

  const uid = typeof request.data?.uid === 'string' ? request.data.uid.trim() : '';
  if (!uid) {
    throw new HttpsError('invalid-argument', 'uid is required.');
  }

  await db.doc(`users/${uid}`).set({
    fcmToken: admin.firestore.FieldValue.delete(),
    fcmTokenUpdatedAt: admin.firestore.FieldValue.delete(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  await writeAdminAuditLog({
    actorUid: request.auth!.uid!,
    action: 'clearAdminUserPushToken',
    targetUid: uid,
    details: {},
  });

  return { success: true, uid, message: 'Push token cleared.' };
});

const VALID_PREDICTION_WINDOWS: PredictionWindow[] = ['today', 'week', 'month', 'life'];
const PREDICTION_MODEL_VERSION = '0.1.0';
const PREDICTION_CHART_VERSION = 1;

export const getPredictionModelSnapshot = onCall({ region: 'us-central1' }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required.');

  const requestedWindow = (request.data?.window as PredictionWindow | undefined) ?? 'today';
  if (!VALID_PREDICTION_WINDOWS.includes(requestedWindow)) {
    throw new HttpsError('invalid-argument', 'window must be one of today, week, month, life.');
  }

  const uid = request.auth.uid;
  const now = new Date();
  const dateKey = now.toISOString().split('T')[0];
  const runId = `${requestedWindow}_${dateKey}`;
  const runRef = db.doc(`predictionRuns/${uid}/runs/${runId}`);
  const existing = await runRef.get();

  if (existing.exists) {
    const data = existing.data() as PredictionRunRecord | undefined;
    if (data?.snapshot?.modelVersion === PREDICTION_MODEL_VERSION) {
      return { runId, snapshot: data.snapshot, feedback: data.feedback ?? null, cached: true };
    }
  }

  const chartSnap = await db.doc(`charts/${uid}`).get();
  if (!chartSnap.exists) throw new HttpsError('not-found', 'No chart found. Calculate chart first.');

  const chart = chartSnap.data()!;
  const { getAllPlanets } = await import('./calculations/ephemeris');
  const transits = getAllPlanets(now);
  const featureVector = extractPredictionFeatures(chart, transits, now, requestedWindow);
  const snapshot = runPredictionModel(featureVector);

  const record: PredictionRunRecord = {
    runId,
    window: requestedWindow,
    dateKey,
    modelName: snapshot.modelName,
    modelVersion: snapshot.modelVersion,
    chartVersion: PREDICTION_CHART_VERSION,
    featureVector,
    snapshot,
    feedback: existing.data()?.feedback as PredictionFeedbackRecord | undefined,
  };

  await runRef.set({
    ...record,
    createdAt: existing.exists ? existing.data()?.createdAt ?? admin.firestore.FieldValue.serverTimestamp() : admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  return { runId, snapshot, feedback: record.feedback ?? null, cached: false };
});

export const savePredictionFeedback = onCall({ region: 'us-central1' }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required.');

  const { runId, verdict, resonance, note } = request.data as {
    runId?: string;
    verdict?: PredictionFeedbackRecord['verdict'];
    resonance?: number;
    note?: string;
  };

  if (!runId || !verdict || !['matched', 'mixed', 'missed'].includes(verdict)) {
    throw new HttpsError('invalid-argument', 'runId and a valid verdict are required.');
  }

  const safeResonance = Number(resonance);
  if (!Number.isFinite(safeResonance) || safeResonance < 1 || safeResonance > 5) {
    throw new HttpsError('invalid-argument', 'resonance must be between 1 and 5.');
  }

  const runRef = db.doc(`predictionRuns/${request.auth.uid}/runs/${runId}`);
  const runSnap = await runRef.get();
  if (!runSnap.exists) throw new HttpsError('not-found', 'Prediction run not found.');

  const feedback: PredictionFeedbackRecord = {
    verdict,
    resonance: safeResonance,
    note: typeof note === 'string' && note.trim() ? note.trim().slice(0, 500) : undefined,
    submittedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await runRef.set({
    feedback,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  return { success: true, feedback };
});

export const exportMyPredictionDataset = onCall({ region: 'us-central1' }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required.');

  const uid = request.auth.uid;
  const limit = Math.max(1, Math.min(Number(request.data?.limit ?? 250), 1000));
  const runsSnap = await db.collection(`predictionRuns/${uid}/runs`).get();
  type PredictionRunDoc = { id: string } & Record<string, any>;
  const docs = runsSnap.docs
    .map((doc): PredictionRunDoc => ({ id: doc.id, ...(doc.data() as Record<string, any>) }))
    .sort((a, b) => {
      const left = new Date((a.updatedAt?.toDate?.() ?? a.updatedAt ?? 0) as any).getTime();
      const right = new Date((b.updatedAt?.toDate?.() ?? b.updatedAt ?? 0) as any).getTime();
      return right - left;
    })
    .slice(0, limit);

  const rows = docs.map((run) => ({
    runId: run.runId ?? run.id,
    window: run.window,
    dateKey: run.dateKey,
    modelName: run.modelName,
    modelVersion: run.modelVersion,
    topArea: run.snapshot?.topArea ?? null,
    confidence: run.snapshot?.confidence ?? null,
    scores: run.snapshot?.scores ?? null,
    supportingSignals: run.snapshot?.supportingSignals ?? [],
    featureVector: run.featureVector ?? null,
    feedbackVerdict: run.feedback?.verdict ?? null,
    feedbackResonance: run.feedback?.resonance ?? null,
    feedbackNote: run.feedback?.note ?? null,
  }));

  const labeledRows = rows.filter((row) => row.feedbackVerdict);
  return {
    summary: {
      totalRuns: rows.length,
      labeledRuns: labeledRows.length,
      labelRate: rows.length ? Number((labeledRows.length / rows.length).toFixed(3)) : 0,
    },
    rows,
  };
});

export const exportMyData = onCall({ region: 'us-central1' }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required.');

  const uid = request.auth.uid;
  const [profileSnap, chartSnap, dailyReadings, partners, predictionRuns] = await Promise.all([
    db.doc(`users/${uid}`).get(),
    db.doc(`charts/${uid}`).get(),
    readCollectionForExport(`dailyReadings/${uid}/dates`),
    readCollectionForExport(`connections/${uid}/partners`),
    readCollectionForExport(`predictionRuns/${uid}/runs`),
  ]);

  const sortedPredictionRuns = predictionRuns.sort((a, b) => {
    const left = String(a.updatedAt ?? a.createdAt ?? a.dateKey ?? a.documentId ?? '');
    const right = String(b.updatedAt ?? b.createdAt ?? b.dateKey ?? b.documentId ?? '');
    return right.localeCompare(left);
  });

  return {
    exportVersion: 1,
    exportedAt: new Date().toISOString(),
    uid,
    profile: profileSnap.exists ? sanitizeProfileForExport(profileSnap.data()!) : null,
    chart: chartSnap.exists ? toJsonSafeObject(chartSnap.data()!) : null,
    dailyReadings,
    connections: {
      partners,
    },
    predictionRuns: sortedPredictionRuns,
    counts: {
      profile: profileSnap.exists ? 1 : 0,
      chart: chartSnap.exists ? 1 : 0,
      dailyReadings: dailyReadings.length,
      partners: partners.length,
      predictionRuns: sortedPredictionRuns.length,
      predictionRunsWithFeedback: sortedPredictionRuns.filter((run) => run.feedback !== null && run.feedback !== undefined).length,
    },
  };
});

// Deletes all server-side account data for the signed-in user, then removes auth.
export const deleteMyAccount = onCall({ region: 'us-central1' }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required.');

  const uid = request.auth.uid;

  const ownPartnerDocs = await db.collection(`connections/${uid}/partners`).get();
  const reversePartnerDocs = await db.collectionGroup('partners').get();
  const dailyReadingDocs = await db.collection(`dailyReadings/${uid}/dates`).get();
  const predictionRunDocs = await db.collection(`predictionRuns/${uid}/runs`).get();

  const deletes: Array<Promise<unknown>> = [
    ...ownPartnerDocs.docs.map((doc) => doc.ref.delete()),
    ...reversePartnerDocs.docs
      .filter((doc) => doc.id === uid)
      .map((doc) => doc.ref.delete()),
    ...dailyReadingDocs.docs.map((doc) => doc.ref.delete()),
    ...predictionRunDocs.docs.map((doc) => doc.ref.delete()),
    db.doc(`users/${uid}`).delete().catch(() => {}),
    db.doc(`charts/${uid}`).delete().catch(() => {}),
    db.doc(`dailyReadings/${uid}`).delete().catch(() => {}),
    db.doc(`connections/${uid}`).delete().catch(() => {}),
    db.doc(`predictionRuns/${uid}`).delete().catch(() => {}),
  ];

  await Promise.all(deletes);
  await admin.auth().deleteUser(uid);

  return { success: true };
});

// ─── scheduledDailyReadings ───────────────────────────────────────────────────
// Runs at midnight UTC to pre-generate readings for all users.
export const scheduledDailyReadings = onSchedule(
  { schedule: '0 0 * * *', region: 'us-central1' },
  async () => {
    const usersSnap = await db.collection('users').where('chartCalculated', '==', true).get();
    const promises = usersSnap.docs.map(async (doc) => {
      try {
        const uid = doc.id;
        const dateKey = new Date().toISOString().split('T')[0];
        const cached = await db.doc(`dailyReadings/${uid}/dates/${dateKey}`).get();
        if (cached.exists && cached.data()?.version === DAILY_READING_VERSION) return;

        const chartSnap = await db.doc(`charts/${uid}`).get();
        if (!chartSnap.exists) return;

        const { getAllPlanets } = await import('./calculations/ephemeris');
        const transits = getAllPlanets(new Date());
        const reading = buildTransitReading(chartSnap.data()!, transits, new Date());

        await db.doc(`dailyReadings/${uid}/dates/${dateKey}`).set({
          ...reading,
          generatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Send FCM push notification if token exists
        const userData = doc.data();
        const fcmToken = userData.fcmToken as string | undefined;
        if (fcmToken) {
          const premiumTransitNotification = isPremiumSubscriber(userData)
            ? getPremiumTransitNotification(reading)
            : null;
          const firstName = (userData.name as string ?? 'you').split(' ')[0];
          const vibe = (reading as any).unified?.cosmicVibe ?? 'Your cosmic reading is ready.';
          const notification = premiumTransitNotification ?? {
            title: `Good morning, ${firstName}`,
            body: vibe.length > 100 ? `${vibe.slice(0, 97)}...` : vibe,
          };
          await admin.messaging().send({
            token: fcmToken,
            notification: {
              title: notification.title,
              body: notification.body,
            },
            data: { screen: 'today', date: dateKey, alertType: premiumTransitNotification ? 'transit' : 'daily' },
            android: { notification: { channelId: 'cosmic-daily' } },
            apns: { payload: { aps: { sound: 'default' } } },
          }).catch(() => {}); // Silently ignore stale tokens
        }
      } catch (err) {
        console.error(`Failed for user ${doc.id}:`, err);
      }
    });
    await Promise.all(promises);
  }
);

// ─── Transit-based reading generator ─────────────────────────────────────────
export function generateReadingFromTransits(
  chart: any,
  transits: Record<string, any>,
  date: Date
): object {
  const natalSunSign = chart.western?.sun ?? 'Aries';
  const natalMoon = chart.western?.moon ?? 'Aries';
  const natalRashi = chart.vedic?.rashi ?? 'Mesha';
  const nakshatraName = chart.vedic?.nakshatra ?? 'Ashwini';
  const currentDasha = chart.vedic?.currentDasha?.planet ?? 'Sun';
  const subDasha = chart.vedic?.subDasha?.planet ?? 'Moon';
  const chineseAnimal = chart.chinese?.animal ?? 'Rat';
  const chineseElement = chart.chinese?.element ?? 'Wood';
  const kpLagna = chart.kp?.lagna ?? 'Aries';
  const kpSubLord = chart.kp?.lagnaSubLord ?? 'Sun';

  // Transit Moon sign
  const transitMoon = transits.MOON?.sign ?? 'Aries';
  const transitSun = transits.SUN?.sign ?? 'Aries';
  const transitJupiter = transits.JUPITER?.sign ?? 'Aries';
  const transitSaturn = transits.SATURN?.sign ?? 'Aries';

  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const seedBase = date.getFullYear() * 1000 + dayOfYear;
  const seed = (n: number) => { const x = Math.sin(seedBase * n) * 10000; return x - Math.floor(x); };

  const overallOptions = [
    `With the Sun transiting ${transitSun} and your natal ${natalSunSign} energy active, today calls for bold authentic expression. Trust your instincts.`,
    `The Moon in ${transitMoon} harmonises with your ${natalMoon} placement, bringing emotional clarity and intuitive insight today.`,
    `Today's planetary alignment supports your ${natalSunSign} nature — focus on what truly matters and let the rest fall away.`,
  ];
  const loveOptions = [
    `Venus's current position amplifies ${natalSunSign} charm. Deep conversations open new dimensions in relationships.`,
    `The ${transitMoon} Moon energises your emotional connections. Express what's been held in — timing is favourable.`,
    `With ${transitJupiter} Jupiter expanding your heart sector, generosity and openness bring unexpected warmth today.`,
  ];
  const careerOptions = [
    `Saturn in ${transitSaturn} favours disciplined effort — your ${natalSunSign} determination produces lasting results today.`,
    `Mercury's influence sharpens communication. Negotiations and proposals advanced today carry real momentum.`,
    `Jupiter's transit through ${transitJupiter} creates lucky openings in areas requiring expansion and boldness.`,
  ];

  const luckyNumber = Math.floor(seed(7.3) * 9) + 1;
  const luckyColor = ['Gold','Indigo','Crimson','Teal','Violet','Silver','Amber'][Math.floor(seed(11.7) * 7)];
  const affirmations = [
    `I am aligned with the cosmic rhythm and move with grace and intention.`,
    `My chart reveals unique gifts that I honour and share with the world.`,
    `I trust the timing of the universe — all unfolds in perfect order.`,
    `I am the bridge between heaven and earth, carrying light wherever I go.`,
  ];

  return {
    date: date.toISOString().split('T')[0],
    western: {
      overall: overallOptions[Math.floor(seed(3.1) * overallOptions.length)],
      love: loveOptions[Math.floor(seed(5.3) * loveOptions.length)],
      career: careerOptions[Math.floor(seed(7.7) * careerOptions.length)],
      luckyNumber,
      luckyColor,
      transitHighlight: `Sun in ${transitSun} · Moon in ${transitMoon}`,
    },
    vedic: {
      dasha: `${currentDasha} Mahadasha · ${subDasha} Antardasha`,
      nakshatra: `Moon transiting, natal ${nakshatraName} nakshatra active`,
      mantra: getMantrasForDasha(currentDasha),
      remedy: { source: getRemedyForDasha(currentDasha) },
      rashi: natalRashi,
    },
    chinese: {
      animal: `${chineseAnimal} energy is ${seed(9.1) > 0.5 ? 'strong' : 'reflective'} today`,
      element: `${chineseElement} element favours ${chineseElement === 'Wood' ? 'growth and planning' : chineseElement === 'Fire' ? 'passion and action' : chineseElement === 'Earth' ? 'stability and relationships' : chineseElement === 'Metal' ? 'precision and discipline' : 'flow and intuition'}`,
      luckyDirection: chart.chinese?.luckyDirections?.[0] ?? 'East',
      luckyColor: chart.chinese?.luckyColors?.[0] ?? 'Green',
    },
    kp: {
      eventTiming: `${kpLagna} lagna with ${kpSubLord} sub-lord — ${seed(13.3) > 0.5 ? 'favourable' : 'neutral'} period for new beginnings`,
      significatorInsight: `Significators of the ${transitMoon} Moon transit activate your ${kpLagna} matters today`,
      sublordGuidance: `${kpSubLord} as sub-lord indicates ${getSubLordMeaning(kpSubLord)}`,
    },
    unified: {
      cosmicVibe: getCosmicVibe(natalSunSign, transitMoon, transitJupiter, seed),
      affirmation: affirmations[Math.floor(seed(17.3) * affirmations.length)],
    },
  };
}

function getMantrasForDasha(planet: string): string {
  const mantras: Record<string, string> = {
    Sun: 'Om Suryaya Namah', Moon: 'Om Chandraya Namah', Mars: 'Om Mangalaya Namah',
    Mercury: 'Om Budhaya Namah', Jupiter: 'Om Gurave Namah', Venus: 'Om Shukraya Namah',
    Saturn: 'Om Shanaye Namah', Rahu: 'Om Rahave Namah', Ketu: 'Om Ketave Namah',
  };
  return mantras[planet] ?? 'Om Namah Shivaya';
}

function getRemedyForDasha(planet: string): string {
  const remedies: Record<string, string> = {
    Sun: 'Offer water to the Sun at sunrise · Wear ruby or red coral',
    Moon: 'Fast on Mondays · Offer milk to Shiva · Wear pearl',
    Mars: 'Chant Hanuman Chalisa · Wear red coral',
    Mercury: 'Feed green vegetables to cows · Wear emerald',
    Jupiter: 'Respect teachers · Donate yellow items · Wear yellow sapphire',
    Venus: 'Respect women · Donate white items · Wear diamond or white sapphire',
    Saturn: 'Serve the poor · Light sesame oil lamp · Wear blue sapphire',
    Rahu: 'Feed birds · Donate to leprosy charities · Wear hessonite',
    Ketu: 'Donate blankets · Worship Ganesha · Wear cat\'s eye',
  };
  return remedies[planet] ?? 'Meditate at sunrise';
}

function getSubLordMeaning(planet: string): string {
  const meanings: Record<string, string> = {
    Sun: 'authority and self-expression are highlighted',
    Moon: 'emotional sensitivity and intuition are heightened',
    Mars: 'drive and initiative yield tangible results',
    Mercury: 'communication and intellect are sharpened',
    Jupiter: 'expansion and good fortune are available',
    Venus: 'harmony, beauty and relationships are favoured',
    Saturn: 'discipline and patience bring lasting reward',
    Rahu: 'unconventional paths yield surprising gains',
    Ketu: 'spiritual insight and detachment bring clarity',
  };
  return meanings[planet] ?? 'cosmic forces align in your favour';
}

function getCosmicVibe(sun: string, moonSign: string, jupiter: string, seed: (n: number) => number): string {
  const vibes = [
    `${sun} solar force meets ${moonSign} Moon energy — a day of purposeful flow`,
    `Jupiter in ${jupiter} amplifies your ${sun} nature — expand with confidence`,
    `The cosmic currents favour deep inner work and outer bold action today`,
    `Celestial harmony between your natal chart and today's transits — trust the moment`,
  ];
  return vibes[Math.floor(seed(19.7) * vibes.length)];
}
