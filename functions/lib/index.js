"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduledDailyReadings = exports.deleteMyAccount = exports.exportMyData = exports.exportMyPredictionDataset = exports.savePredictionFeedback = exports.getPredictionModelSnapshot = exports.clearAdminUserPushToken = exports.setAdminUserDisabled = exports.updateAdminUserSubscription = exports.getAdminUserDetail = exports.searchAdminUsers = exports.registerFCMToken = exports.calculateCompatibility = exports.getDailyReading = exports.calculateChart = void 0;
exports.generateReadingFromTransits = generateReadingFromTransits;
const admin = __importStar(require("firebase-admin"));
const https_1 = require("firebase-functions/v2/https");
const scheduler_1 = require("firebase-functions/v2/scheduler");
const western_1 = require("./calculations/western");
const vedic_1 = require("./calculations/vedic");
const chinese_1 = require("./calculations/chinese");
const kp_1 = require("./calculations/kp");
const dailyPrediction_1 = require("./dailyPrediction");
const featureExtraction_1 = require("./ml/featureExtraction");
const modelScoring_1 = require("./ml/modelScoring");
const geocoding_1 = require("./utils/geocoding");
admin.initializeApp();
const db = admin.firestore();
const DAILY_READING_VERSION = 4;
const HIGH_IMPACT_TRANSIT_ORB = 1.25;
function toJsonSafe(value) {
    if (value === null || value === undefined)
        return null;
    if (typeof value === 'string' || typeof value === 'boolean')
        return value;
    if (typeof value === 'number')
        return Number.isFinite(value) ? value : null;
    if (value instanceof Date)
        return value.toISOString();
    if (value instanceof admin.firestore.Timestamp)
        return value.toDate().toISOString();
    if (value instanceof admin.firestore.GeoPoint) {
        return { latitude: value.latitude, longitude: value.longitude };
    }
    if (value instanceof admin.firestore.DocumentReference) {
        return { path: value.path };
    }
    if (Array.isArray(value))
        return value.map((item) => toJsonSafe(item));
    if (typeof value === 'object') {
        const maybeBytes = value;
        if (typeof maybeBytes.toBase64 === 'function') {
            return { base64: maybeBytes.toBase64() };
        }
        const output = {};
        for (const [key, nested] of Object.entries(value)) {
            output[key] = toJsonSafe(nested);
        }
        return output;
    }
    return String(value);
}
function toJsonSafeObject(value) {
    return toJsonSafe(value);
}
function sanitizeProfileForExport(value) {
    const profile = Object.assign({}, value);
    delete profile.fcmToken;
    return toJsonSafeObject(profile);
}
function assertAdmin(request) {
    var _a, _b;
    if (!((_a = request.auth) === null || _a === void 0 ? void 0 : _a.uid)) {
        throw new https_1.HttpsError('unauthenticated', 'Sign in required.');
    }
    if (((_b = request.auth.token) === null || _b === void 0 ? void 0 : _b.admin) !== true) {
        throw new https_1.HttpsError('permission-denied', 'Admin access required.');
    }
}
function toIso(value) {
    var _a, _b;
    if (!value)
        return null;
    if (value instanceof admin.firestore.Timestamp)
        return value.toDate().toISOString();
    if (value instanceof Date)
        return value.toISOString();
    if (typeof value === 'object' && value !== null && 'toDate' in value) {
        const converted = (_b = (_a = value).toDate) === null || _b === void 0 ? void 0 : _b.call(_a);
        if (converted instanceof Date && !Number.isNaN(converted.getTime())) {
            return converted.toISOString();
        }
    }
    const parsed = new Date(String(value));
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}
function normalizeAdminSubscriptionTier(value) {
    return value === 'premium' || value === 'family' ? 'premium' : 'free';
}
function normalizeAdminSubscriptionStatus(value) {
    return value === 'active' || value === 'expired' || value === 'trial' ? value : 'unknown';
}
function compareAdminUsersByRecency(a, b) {
    var _a, _b, _c, _d, _e, _f;
    const aUpdated = new Date((_b = (_a = a.updatedAt) !== null && _a !== void 0 ? _a : a.createdAt) !== null && _b !== void 0 ? _b : 0).getTime();
    const bUpdated = new Date((_d = (_c = b.updatedAt) !== null && _c !== void 0 ? _c : b.createdAt) !== null && _d !== void 0 ? _d : 0).getTime();
    if (aUpdated !== bUpdated)
        return bUpdated - aUpdated;
    const aCreated = new Date((_e = a.createdAt) !== null && _e !== void 0 ? _e : 0).getTime();
    const bCreated = new Date((_f = b.createdAt) !== null && _f !== void 0 ? _f : 0).getTime();
    return bCreated - aCreated;
}
function buildAdminUserListItem(authUser, profileData) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const name = typeof (profileData === null || profileData === void 0 ? void 0 : profileData.name) === 'string' && profileData.name.trim()
        ? profileData.name.trim()
        : ((_a = authUser.displayName) === null || _a === void 0 ? void 0 : _a.trim()) || ((_b = authUser.email) === null || _b === void 0 ? void 0 : _b.split('@')[0]) || authUser.uid;
    return {
        uid: authUser.uid,
        name,
        email: (_c = authUser.email) !== null && _c !== void 0 ? _c : null,
        subscriptionTier: normalizeAdminSubscriptionTier((_d = profileData === null || profileData === void 0 ? void 0 : profileData.subscription) === null || _d === void 0 ? void 0 : _d.tier),
        subscriptionStatus: normalizeAdminSubscriptionStatus((_e = profileData === null || profileData === void 0 ? void 0 : profileData.subscription) === null || _e === void 0 ? void 0 : _e.status),
        onboardingComplete: Boolean(profileData === null || profileData === void 0 ? void 0 : profileData.onboardingComplete),
        chartCalculated: Boolean(profileData === null || profileData === void 0 ? void 0 : profileData.chartCalculated),
        disabled: Boolean((_f = profileData === null || profileData === void 0 ? void 0 : profileData.adminFlags) === null || _f === void 0 ? void 0 : _f.disabled),
        createdAt: (_g = toIso(profileData === null || profileData === void 0 ? void 0 : profileData.createdAt)) !== null && _g !== void 0 ? _g : toIso(authUser.metadata.creationTime),
        updatedAt: (_j = (_h = toIso(profileData === null || profileData === void 0 ? void 0 : profileData.updatedAt)) !== null && _h !== void 0 ? _h : toIso(authUser.metadata.lastRefreshTime)) !== null && _j !== void 0 ? _j : toIso(authUser.metadata.lastSignInTime),
    };
}
async function writeAdminAuditLog(input) {
    var _a;
    await db.collection('adminAuditLogs').add({
        actorUid: input.actorUid,
        action: input.action,
        targetUid: input.targetUid,
        details: toJsonSafeObject((_a = input.details) !== null && _a !== void 0 ? _a : {}),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
}
async function countCollectionDocuments(path, limit = 200) {
    const snap = await db.collection(path).limit(limit).get();
    return snap.size;
}
async function readCollectionForExport(path) {
    const snap = await db.collection(path).get();
    return snap.docs
        .map((doc) => (Object.assign({ documentId: doc.id }, toJsonSafeObject(doc.data()))))
        .sort((a, b) => String(a.documentId).localeCompare(String(b.documentId)));
}
function isPremiumSubscriber(userData) {
    var _a, _b;
    const tier = (_a = userData.subscription) === null || _a === void 0 ? void 0 : _a.tier;
    const status = (_b = userData.subscription) === null || _b === void 0 ? void 0 : _b.status;
    return tier === 'premium' && (status === 'active' || status === 'trial');
}
function formatTransitPart(value) {
    return String(value !== null && value !== void 0 ? value : '')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .trim();
}
function getPremiumTransitNotification(reading) {
    const transits = Array.isArray(reading === null || reading === void 0 ? void 0 : reading.activeTransits) ? reading.activeTransits : [];
    const hit = transits
        .filter((transit) => typeof (transit === null || transit === void 0 ? void 0 : transit.orb) === 'number' &&
        transit.orb <= HIGH_IMPACT_TRANSIT_ORB &&
        (transit.nature === 'support' || transit.nature === 'tension'))
        .sort((a, b) => a.orb - b.orb)[0];
    if (!hit)
        return null;
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
exports.calculateChart = (0, https_1.onCall)({ region: 'us-central1' }, async (request) => {
    var _a;
    if (!request.auth)
        throw new https_1.HttpsError('unauthenticated', 'Sign in required.');
    const { birthDate, birthTime, birthPlace } = request.data;
    if (!birthDate || !birthTime || !birthPlace) {
        throw new https_1.HttpsError('invalid-argument', 'birthDate, birthTime, birthPlace required.');
    }
    try {
        // 1. Geocode birth place
        const geo = await (0, geocoding_1.geocodePlace)(birthPlace);
        // 2. Convert local birth time to UTC
        const birthDateUtc = (0, geocoding_1.localToUtc)(birthDate, birthTime, geo.timezone);
        // 3. Calculate all 4 systems
        const [western, vedic, chinese, kp] = await Promise.all([
            (0, western_1.calculateWesternChart)(birthDateUtc, geo.lat, geo.lng),
            (0, vedic_1.calculateVedicChart)(birthDateUtc, geo.lat, geo.lng),
            (0, chinese_1.calculateChineseChart)(birthDateUtc),
            (0, kp_1.calculateKPChart)(birthDateUtc, geo.lat, geo.lng),
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
    }
    catch (err) {
        console.error('calculateChart error:', err);
        throw new https_1.HttpsError('internal', (_a = err.message) !== null && _a !== void 0 ? _a : 'Calculation failed.');
    }
});
// ─── getDailyReading ──────────────────────────────────────────────────────────
// Returns personalized daily reading based on current transits vs natal chart.
exports.getDailyReading = (0, https_1.onCall)({ region: 'us-central1' }, async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError('unauthenticated', 'Sign in required.');
    const uid = request.auth.uid;
    const dateKey = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    // Check cache first
    const cached = await db.doc(`dailyReadings/${uid}/dates/${dateKey}`).get();
    if (cached.exists) {
        const cachedReading = cached.data();
        if ((cachedReading === null || cachedReading === void 0 ? void 0 : cachedReading.version) === DAILY_READING_VERSION)
            return { reading: cachedReading, cached: true };
    }
    // Get user's natal chart
    const chartSnap = await db.doc(`charts/${uid}`).get();
    if (!chartSnap.exists)
        throw new https_1.HttpsError('not-found', 'No chart found. Calculate chart first.');
    const chart = chartSnap.data();
    const now = new Date();
    // Current transits
    const { getAllPlanets } = await Promise.resolve().then(() => __importStar(require('./calculations/ephemeris')));
    const transits = getAllPlanets(now);
    // Generate reading text based on transits vs natal
    const reading = (0, dailyPrediction_1.buildTransitReading)(chart, transits, now);
    await db.doc(`dailyReadings/${uid}/dates/${dateKey}`).set(Object.assign(Object.assign({}, reading), { generatedAt: admin.firestore.FieldValue.serverTimestamp() }));
    return { reading, cached: false };
});
// ─── calculateCompatibility ───────────────────────────────────────────────────
// Called when User A wants synastry against User B (via QR / uid).
exports.calculateCompatibility = (0, https_1.onCall)({ region: 'us-central1' }, async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError('unauthenticated', 'Sign in required.');
    const { partnerUid } = request.data;
    if (!partnerUid)
        throw new https_1.HttpsError('invalid-argument', 'partnerUid required.');
    const uid = request.auth.uid;
    if (uid === partnerUid)
        throw new https_1.HttpsError('invalid-argument', 'Cannot compare with yourself.');
    const [mySnap, partnerSnap] = await Promise.all([
        db.doc(`charts/${uid}`).get(),
        db.doc(`charts/${partnerUid}`).get(),
    ]);
    if (!mySnap.exists)
        throw new https_1.HttpsError('not-found', 'Your chart has not been calculated yet.');
    if (!partnerSnap.exists)
        throw new https_1.HttpsError('not-found', 'Partner chart not found. They need to calculate their chart first.');
    const myChart = mySnap.data();
    const partnerChart = partnerSnap.data();
    // Synastry: compare planet positions of both charts
    const synastry = calculateSynastry(myChart, partnerChart);
    // Save to connections subcollection
    await db.doc(`connections/${uid}/partners/${partnerUid}`).set(Object.assign(Object.assign({}, synastry), { calculatedAt: admin.firestore.FieldValue.serverTimestamp() }));
    return { synastry };
});
function calculateSynastry(chart1, chart2) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
    const planets1 = (_b = (_a = chart1.western) === null || _a === void 0 ? void 0 : _a.planets) !== null && _b !== void 0 ? _b : {};
    const planets2 = (_d = (_c = chart2.western) === null || _c === void 0 ? void 0 : _c.planets) !== null && _d !== void 0 ? _d : {};
    // Cross-chart aspects
    const aspects = [];
    const ASPECT_ANGLES = { 0: 'Conjunction', 60: 'Sextile', 90: 'Square', 120: 'Trine', 180: 'Opposition' };
    const KEY_PLANETS = ['SUN', 'MOON', 'VENUS', 'MARS', 'JUPITER', 'SATURN'];
    for (const p1 of KEY_PLANETS) {
        for (const p2 of KEY_PLANETS) {
            const pos1 = planets1[p1];
            const pos2 = planets2[p2];
            if (!pos1 || !pos2)
                continue;
            let diff = Math.abs(((_e = pos1.longitude) !== null && _e !== void 0 ? _e : 0) - ((_f = pos2.longitude) !== null && _f !== void 0 ? _f : 0));
            if (diff > 180)
                diff = 360 - diff;
            for (const [angle, name] of Object.entries(ASPECT_ANGLES)) {
                const orb = Math.abs(diff - Number(angle));
                if (orb <= 8) {
                    aspects.push({ planet1: `Your ${p1}`, planet2: `Their ${p2}`, aspect: name, orb: Math.round(orb * 10) / 10 });
                }
            }
        }
    }
    // Element compatibility between sun signs
    const ELEMENTS = {
        Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
        Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
        Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
        Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water',
    };
    const COMPAT = {
        Fire: { Fire: 80, Air: 90, Earth: 50, Water: 45 },
        Earth: { Earth: 75, Water: 85, Fire: 50, Air: 55 },
        Air: { Air: 75, Fire: 88, Water: 50, Earth: 55 },
        Water: { Water: 80, Earth: 85, Air: 50, Fire: 45 },
    };
    const el1 = (_h = ELEMENTS[(_g = chart1.western) === null || _g === void 0 ? void 0 : _g.sun]) !== null && _h !== void 0 ? _h : 'Fire';
    const el2 = (_k = ELEMENTS[(_j = chart2.western) === null || _j === void 0 ? void 0 : _j.sun]) !== null && _k !== void 0 ? _k : 'Fire';
    const westernScore = (_m = (_l = COMPAT[el1]) === null || _l === void 0 ? void 0 : _l[el2]) !== null && _m !== void 0 ? _m : 65;
    // Vedic Guna Milan (simplified)
    const NAKSHATRA_COMPAT = {
        'Ashwini-Rohini': 28, 'Rohini-Mrigashira': 25, 'Ashwini-Ashwini': 18,
    };
    const nKey = [(_o = chart1.vedic) === null || _o === void 0 ? void 0 : _o.nakshatra, (_p = chart2.vedic) === null || _p === void 0 ? void 0 : _p.nakshatra].sort().join('-');
    const vedicScore = (_q = NAKSHATRA_COMPAT[nKey]) !== null && _q !== void 0 ? _q : Math.floor(50 + Math.random() * 30);
    // Chinese compatibility
    const CHINESE_COMPAT = {
        Rat: ['Dragon', 'Monkey', 'Ox'], Ox: ['Rat', 'Snake', 'Rooster'],
        Tiger: ['Horse', 'Dog', 'Dragon'], Rabbit: ['Sheep', 'Dog', 'Pig'],
        Dragon: ['Rat', 'Monkey', 'Rooster'], Snake: ['Ox', 'Rooster'],
        Horse: ['Tiger', 'Dog', 'Sheep'], Sheep: ['Rabbit', 'Horse', 'Pig'],
        Monkey: ['Rat', 'Dragon'], Rooster: ['Ox', 'Snake', 'Dragon'],
        Dog: ['Tiger', 'Rabbit', 'Horse'], Pig: ['Rabbit', 'Sheep'],
    };
    const a1 = (_r = chart1.chinese) === null || _r === void 0 ? void 0 : _r.animal;
    const a2 = (_s = chart2.chinese) === null || _s === void 0 ? void 0 : _s.animal;
    const chineseScore = ((_t = CHINESE_COMPAT[a1]) !== null && _t !== void 0 ? _t : []).includes(a2) ? 85 : 60;
    const overall = Math.round(westernScore * 0.3 + vedicScore * 0.35 + chineseScore * 0.35);
    const trines = aspects.filter(a => a.aspect === 'Trine').length;
    const conjunctions = aspects.filter(a => a.aspect === 'Conjunction').length;
    const tensions = aspects.filter(a => a.aspect === 'Square').length;
    return {
        overall: Math.max(35, Math.min(98, overall)),
        western: { score: westernScore, element1: el1, element2: el2 },
        vedic: { score: vedicScore, nakshatra1: (_u = chart1.vedic) === null || _u === void 0 ? void 0 : _u.nakshatra, nakshatra2: (_v = chart2.vedic) === null || _v === void 0 ? void 0 : _v.nakshatra },
        chinese: { score: chineseScore, animal1: a1, animal2: a2 },
        aspects,
        summary: `${trines} harmonious trines, ${conjunctions} powerful conjunctions, ${tensions} growth-bringing squares`,
    };
}
// ─── registerFCMToken ─────────────────────────────────────────────────────────
// Called from app when user logs in — saves their push token to Firestore.
exports.registerFCMToken = (0, https_1.onCall)({ region: 'us-central1' }, async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError('unauthenticated', 'Sign in required.');
    const { token } = request.data;
    if (!token)
        throw new https_1.HttpsError('invalid-argument', 'token required.');
    await db.doc(`users/${request.auth.uid}`).update({
        fcmToken: token,
        fcmTokenUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { success: true };
});
exports.searchAdminUsers = (0, https_1.onCall)({ region: 'us-central1' }, async (request) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    assertAdmin(request);
    const rawQuery = typeof ((_a = request.data) === null || _a === void 0 ? void 0 : _a.query) === 'string' ? request.data.query.trim() : '';
    const normalizedQuery = rawQuery.toLowerCase();
    const limit = Math.max(1, Math.min(Number((_c = (_b = request.data) === null || _b === void 0 ? void 0 : _b.limit) !== null && _c !== void 0 ? _c : 20), 50));
    const looksLikeUid = /^[A-Za-z0-9_-]{20,128}$/.test(rawQuery);
    if (!rawQuery) {
        return { users: [] };
    }
    const authUsers = new Map();
    if (looksLikeUid) {
        try {
            const user = await admin.auth().getUser(rawQuery);
            authUsers.set(user.uid, user);
        }
        catch (error) {
            if ((error === null || error === void 0 ? void 0 : error.code) !== 'auth/user-not-found') {
                throw new https_1.HttpsError('internal', (_d = error === null || error === void 0 ? void 0 : error.message) !== null && _d !== void 0 ? _d : 'Failed to search users.');
            }
        }
    }
    let pageToken;
    let pages = 0;
    while (authUsers.size < limit && pages < 5) {
        const page = await admin.auth().listUsers(1000, pageToken);
        for (const user of page.users) {
            const email = (_f = (_e = user.email) === null || _e === void 0 ? void 0 : _e.toLowerCase()) !== null && _f !== void 0 ? _f : '';
            const displayName = (_h = (_g = user.displayName) === null || _g === void 0 ? void 0 : _g.toLowerCase()) !== null && _h !== void 0 ? _h : '';
            const uid = user.uid.toLowerCase();
            if (email.includes(normalizedQuery) || displayName.includes(normalizedQuery) || uid.includes(normalizedQuery)) {
                authUsers.set(user.uid, user);
                if (authUsers.size >= limit)
                    break;
            }
        }
        if (!page.pageToken || authUsers.size >= limit)
            break;
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
exports.getAdminUserDetail = (0, https_1.onCall)({ region: 'us-central1' }, async (request) => {
    var _a, _b, _c, _d, _e;
    assertAdmin(request);
    const uid = typeof ((_a = request.data) === null || _a === void 0 ? void 0 : _a.uid) === 'string' ? request.data.uid.trim() : '';
    if (!uid) {
        throw new https_1.HttpsError('invalid-argument', 'uid is required.');
    }
    let authUser;
    try {
        authUser = await admin.auth().getUser(uid);
    }
    catch (error) {
        if ((error === null || error === void 0 ? void 0 : error.code) === 'auth/user-not-found') {
            throw new https_1.HttpsError('not-found', 'User not found.');
        }
        throw new https_1.HttpsError('internal', (_b = error === null || error === void 0 ? void 0 : error.message) !== null && _b !== void 0 ? _b : 'Failed to load user detail.');
    }
    const [profileSnap, chartSnap, dailyReadingsCount, predictionRunsCount, connectionsCount] = await Promise.all([
        db.doc(`users/${uid}`).get(),
        db.doc(`charts/${uid}`).get(),
        countCollectionDocuments(`dailyReadings/${uid}/dates`),
        countCollectionDocuments(`predictionRuns/${uid}/runs`),
        countCollectionDocuments(`connections/${uid}/partners`),
    ]);
    const profileData = profileSnap.exists ? (_c = profileSnap.data()) !== null && _c !== void 0 ? _c : {} : {};
    const chartData = chartSnap.exists ? (_d = chartSnap.data()) !== null && _d !== void 0 ? _d : {} : {};
    const listItem = buildAdminUserListItem(authUser, profileData);
    const rawProfile = profileSnap.exists ? sanitizeProfileForExport(profileData) : {};
    delete rawProfile.fcmTokenUpdatedAt;
    const birthDetails = ((_e = profileData.birthDetails) !== null && _e !== void 0 ? _e : {});
    const birthPlace = birthDetails.place;
    const detail = Object.assign(Object.assign({}, listItem), { language: typeof profileData.language === 'string' ? profileData.language : null, activeSystems: Array.isArray(profileData.activeSystems)
            ? profileData.activeSystems.filter((system) => typeof system === 'string')
            : [], cosmicPoints: typeof profileData.cosmicPoints === 'number' ? profileData.cosmicPoints : undefined, streak: typeof profileData.streak === 'number' ? profileData.streak : undefined, lastCheckIn: toIso(profileData.lastCheckIn), birthPlaceName: typeof (birthPlace === null || birthPlace === void 0 ? void 0 : birthPlace.name) === 'string'
            ? birthPlace.name
            : typeof birthDetails.birthPlace === 'string'
                ? birthDetails.birthPlace
                : null, hasFcmToken: typeof profileData.fcmToken === 'string' && profileData.fcmToken.length > 0, chartSummary: {
            hasWestern: Boolean(chartData.western),
            hasVedic: Boolean(chartData.vedic),
            hasChinese: Boolean(chartData.chinese),
            hasKP: Boolean(chartData.kp),
        }, counts: {
            dailyReadings: dailyReadingsCount,
            predictionRuns: predictionRunsCount,
            connections: connectionsCount,
        }, rawProfile });
    return detail;
});
exports.updateAdminUserSubscription = (0, https_1.onCall)({ region: 'us-central1' }, async (request) => {
    var _a, _b;
    assertAdmin(request);
    const uid = typeof ((_a = request.data) === null || _a === void 0 ? void 0 : _a.uid) === 'string' ? request.data.uid.trim() : '';
    const subscription = (_b = request.data) === null || _b === void 0 ? void 0 : _b.subscription;
    if (!uid) {
        throw new https_1.HttpsError('invalid-argument', 'uid is required.');
    }
    if (!subscription || (subscription.tier !== 'free' && subscription.tier !== 'premium')) {
        throw new https_1.HttpsError('invalid-argument', 'subscription tier must be free or premium.');
    }
    if (subscription.status !== 'active' && subscription.status !== 'expired' && subscription.status !== 'trial') {
        throw new https_1.HttpsError('invalid-argument', 'subscription status must be active, expired, or trial.');
    }
    if (subscription.billingPeriod !== undefined &&
        subscription.billingPeriod !== 'monthly' &&
        subscription.billingPeriod !== 'yearly') {
        throw new https_1.HttpsError('invalid-argument', 'billingPeriod must be monthly or yearly when provided.');
    }
    const nextSubscription = {
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
        actorUid: request.auth.uid,
        action: 'updateAdminUserSubscription',
        targetUid: uid,
        details: { subscription: nextSubscription },
    });
    return { success: true, uid, message: 'Subscription updated.' };
});
exports.setAdminUserDisabled = (0, https_1.onCall)({ region: 'us-central1' }, async (request) => {
    var _a, _b;
    assertAdmin(request);
    const uid = typeof ((_a = request.data) === null || _a === void 0 ? void 0 : _a.uid) === 'string' ? request.data.uid.trim() : '';
    const disabled = (_b = request.data) === null || _b === void 0 ? void 0 : _b.disabled;
    if (!uid || typeof disabled !== 'boolean') {
        throw new https_1.HttpsError('invalid-argument', 'uid and disabled are required.');
    }
    await db.doc(`users/${uid}`).set({
        adminFlags: { disabled },
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    await writeAdminAuditLog({
        actorUid: request.auth.uid,
        action: 'setAdminUserDisabled',
        targetUid: uid,
        details: { disabled },
    });
    return { success: true, uid, message: disabled ? 'User disabled.' : 'User re-enabled.' };
});
exports.clearAdminUserPushToken = (0, https_1.onCall)({ region: 'us-central1' }, async (request) => {
    var _a;
    assertAdmin(request);
    const uid = typeof ((_a = request.data) === null || _a === void 0 ? void 0 : _a.uid) === 'string' ? request.data.uid.trim() : '';
    if (!uid) {
        throw new https_1.HttpsError('invalid-argument', 'uid is required.');
    }
    await db.doc(`users/${uid}`).set({
        fcmToken: admin.firestore.FieldValue.delete(),
        fcmTokenUpdatedAt: admin.firestore.FieldValue.delete(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    await writeAdminAuditLog({
        actorUid: request.auth.uid,
        action: 'clearAdminUserPushToken',
        targetUid: uid,
        details: {},
    });
    return { success: true, uid, message: 'Push token cleared.' };
});
const VALID_PREDICTION_WINDOWS = ['today', 'week', 'month', 'life'];
const PREDICTION_MODEL_VERSION = '0.1.0';
const PREDICTION_CHART_VERSION = 1;
exports.getPredictionModelSnapshot = (0, https_1.onCall)({ region: 'us-central1' }, async (request) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (!request.auth)
        throw new https_1.HttpsError('unauthenticated', 'Sign in required.');
    const requestedWindow = (_b = (_a = request.data) === null || _a === void 0 ? void 0 : _a.window) !== null && _b !== void 0 ? _b : 'today';
    if (!VALID_PREDICTION_WINDOWS.includes(requestedWindow)) {
        throw new https_1.HttpsError('invalid-argument', 'window must be one of today, week, month, life.');
    }
    const uid = request.auth.uid;
    const now = new Date();
    const dateKey = now.toISOString().split('T')[0];
    const runId = `${requestedWindow}_${dateKey}`;
    const runRef = db.doc(`predictionRuns/${uid}/runs/${runId}`);
    const existing = await runRef.get();
    if (existing.exists) {
        const data = existing.data();
        if (((_c = data === null || data === void 0 ? void 0 : data.snapshot) === null || _c === void 0 ? void 0 : _c.modelVersion) === PREDICTION_MODEL_VERSION) {
            return { runId, snapshot: data.snapshot, feedback: (_d = data.feedback) !== null && _d !== void 0 ? _d : null, cached: true };
        }
    }
    const chartSnap = await db.doc(`charts/${uid}`).get();
    if (!chartSnap.exists)
        throw new https_1.HttpsError('not-found', 'No chart found. Calculate chart first.');
    const chart = chartSnap.data();
    const { getAllPlanets } = await Promise.resolve().then(() => __importStar(require('./calculations/ephemeris')));
    const transits = getAllPlanets(now);
    const featureVector = (0, featureExtraction_1.extractPredictionFeatures)(chart, transits, now, requestedWindow);
    const snapshot = (0, modelScoring_1.runPredictionModel)(featureVector);
    const record = {
        runId,
        window: requestedWindow,
        dateKey,
        modelName: snapshot.modelName,
        modelVersion: snapshot.modelVersion,
        chartVersion: PREDICTION_CHART_VERSION,
        featureVector,
        snapshot,
        feedback: (_e = existing.data()) === null || _e === void 0 ? void 0 : _e.feedback,
    };
    await runRef.set(Object.assign(Object.assign({}, record), { createdAt: existing.exists ? (_g = (_f = existing.data()) === null || _f === void 0 ? void 0 : _f.createdAt) !== null && _g !== void 0 ? _g : admin.firestore.FieldValue.serverTimestamp() : admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() }), { merge: true });
    return { runId, snapshot, feedback: (_h = record.feedback) !== null && _h !== void 0 ? _h : null, cached: false };
});
exports.savePredictionFeedback = (0, https_1.onCall)({ region: 'us-central1' }, async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError('unauthenticated', 'Sign in required.');
    const { runId, verdict, resonance, note } = request.data;
    if (!runId || !verdict || !['matched', 'mixed', 'missed'].includes(verdict)) {
        throw new https_1.HttpsError('invalid-argument', 'runId and a valid verdict are required.');
    }
    const safeResonance = Number(resonance);
    if (!Number.isFinite(safeResonance) || safeResonance < 1 || safeResonance > 5) {
        throw new https_1.HttpsError('invalid-argument', 'resonance must be between 1 and 5.');
    }
    const runRef = db.doc(`predictionRuns/${request.auth.uid}/runs/${runId}`);
    const runSnap = await runRef.get();
    if (!runSnap.exists)
        throw new https_1.HttpsError('not-found', 'Prediction run not found.');
    const feedback = {
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
exports.exportMyPredictionDataset = (0, https_1.onCall)({ region: 'us-central1' }, async (request) => {
    var _a, _b;
    if (!request.auth)
        throw new https_1.HttpsError('unauthenticated', 'Sign in required.');
    const uid = request.auth.uid;
    const limit = Math.max(1, Math.min(Number((_b = (_a = request.data) === null || _a === void 0 ? void 0 : _a.limit) !== null && _b !== void 0 ? _b : 250), 1000));
    const runsSnap = await db.collection(`predictionRuns/${uid}/runs`).get();
    const docs = runsSnap.docs
        .map((doc) => (Object.assign({ id: doc.id }, doc.data())))
        .sort((a, b) => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const left = new Date(((_d = (_c = (_b = (_a = a.updatedAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : a.updatedAt) !== null && _d !== void 0 ? _d : 0)).getTime();
        const right = new Date(((_h = (_g = (_f = (_e = b.updatedAt) === null || _e === void 0 ? void 0 : _e.toDate) === null || _f === void 0 ? void 0 : _f.call(_e)) !== null && _g !== void 0 ? _g : b.updatedAt) !== null && _h !== void 0 ? _h : 0)).getTime();
        return right - left;
    })
        .slice(0, limit);
    const rows = docs.map((run) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
        return ({
            runId: (_a = run.runId) !== null && _a !== void 0 ? _a : run.id,
            window: run.window,
            dateKey: run.dateKey,
            modelName: run.modelName,
            modelVersion: run.modelVersion,
            topArea: (_c = (_b = run.snapshot) === null || _b === void 0 ? void 0 : _b.topArea) !== null && _c !== void 0 ? _c : null,
            confidence: (_e = (_d = run.snapshot) === null || _d === void 0 ? void 0 : _d.confidence) !== null && _e !== void 0 ? _e : null,
            scores: (_g = (_f = run.snapshot) === null || _f === void 0 ? void 0 : _f.scores) !== null && _g !== void 0 ? _g : null,
            supportingSignals: (_j = (_h = run.snapshot) === null || _h === void 0 ? void 0 : _h.supportingSignals) !== null && _j !== void 0 ? _j : [],
            featureVector: (_k = run.featureVector) !== null && _k !== void 0 ? _k : null,
            feedbackVerdict: (_m = (_l = run.feedback) === null || _l === void 0 ? void 0 : _l.verdict) !== null && _m !== void 0 ? _m : null,
            feedbackResonance: (_p = (_o = run.feedback) === null || _o === void 0 ? void 0 : _o.resonance) !== null && _p !== void 0 ? _p : null,
            feedbackNote: (_r = (_q = run.feedback) === null || _q === void 0 ? void 0 : _q.note) !== null && _r !== void 0 ? _r : null,
        });
    });
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
exports.exportMyData = (0, https_1.onCall)({ region: 'us-central1' }, async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError('unauthenticated', 'Sign in required.');
    const uid = request.auth.uid;
    const [profileSnap, chartSnap, dailyReadings, partners, predictionRuns] = await Promise.all([
        db.doc(`users/${uid}`).get(),
        db.doc(`charts/${uid}`).get(),
        readCollectionForExport(`dailyReadings/${uid}/dates`),
        readCollectionForExport(`connections/${uid}/partners`),
        readCollectionForExport(`predictionRuns/${uid}/runs`),
    ]);
    const sortedPredictionRuns = predictionRuns.sort((a, b) => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const left = String((_d = (_c = (_b = (_a = a.updatedAt) !== null && _a !== void 0 ? _a : a.createdAt) !== null && _b !== void 0 ? _b : a.dateKey) !== null && _c !== void 0 ? _c : a.documentId) !== null && _d !== void 0 ? _d : '');
        const right = String((_h = (_g = (_f = (_e = b.updatedAt) !== null && _e !== void 0 ? _e : b.createdAt) !== null && _f !== void 0 ? _f : b.dateKey) !== null && _g !== void 0 ? _g : b.documentId) !== null && _h !== void 0 ? _h : '');
        return right.localeCompare(left);
    });
    return {
        exportVersion: 1,
        exportedAt: new Date().toISOString(),
        uid,
        profile: profileSnap.exists ? sanitizeProfileForExport(profileSnap.data()) : null,
        chart: chartSnap.exists ? toJsonSafeObject(chartSnap.data()) : null,
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
exports.deleteMyAccount = (0, https_1.onCall)({ region: 'us-central1' }, async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError('unauthenticated', 'Sign in required.');
    const uid = request.auth.uid;
    const ownPartnerDocs = await db.collection(`connections/${uid}/partners`).get();
    const reversePartnerDocs = await db.collectionGroup('partners').get();
    const dailyReadingDocs = await db.collection(`dailyReadings/${uid}/dates`).get();
    const predictionRunDocs = await db.collection(`predictionRuns/${uid}/runs`).get();
    const deletes = [
        ...ownPartnerDocs.docs.map((doc) => doc.ref.delete()),
        ...reversePartnerDocs.docs
            .filter((doc) => doc.id === uid)
            .map((doc) => doc.ref.delete()),
        ...dailyReadingDocs.docs.map((doc) => doc.ref.delete()),
        ...predictionRunDocs.docs.map((doc) => doc.ref.delete()),
        db.doc(`users/${uid}`).delete().catch(() => { }),
        db.doc(`charts/${uid}`).delete().catch(() => { }),
        db.doc(`dailyReadings/${uid}`).delete().catch(() => { }),
        db.doc(`connections/${uid}`).delete().catch(() => { }),
        db.doc(`predictionRuns/${uid}`).delete().catch(() => { }),
    ];
    await Promise.all(deletes);
    await admin.auth().deleteUser(uid);
    return { success: true };
});
// ─── scheduledDailyReadings ───────────────────────────────────────────────────
// Runs at midnight UTC to pre-generate readings for all users.
exports.scheduledDailyReadings = (0, scheduler_1.onSchedule)({ schedule: '0 0 * * *', region: 'us-central1' }, async () => {
    const usersSnap = await db.collection('users').where('chartCalculated', '==', true).get();
    const promises = usersSnap.docs.map(async (doc) => {
        var _a, _b, _c, _d;
        try {
            const uid = doc.id;
            const dateKey = new Date().toISOString().split('T')[0];
            const cached = await db.doc(`dailyReadings/${uid}/dates/${dateKey}`).get();
            if (cached.exists && ((_a = cached.data()) === null || _a === void 0 ? void 0 : _a.version) === DAILY_READING_VERSION)
                return;
            const chartSnap = await db.doc(`charts/${uid}`).get();
            if (!chartSnap.exists)
                return;
            const { getAllPlanets } = await Promise.resolve().then(() => __importStar(require('./calculations/ephemeris')));
            const transits = getAllPlanets(new Date());
            const reading = (0, dailyPrediction_1.buildTransitReading)(chartSnap.data(), transits, new Date());
            await db.doc(`dailyReadings/${uid}/dates/${dateKey}`).set(Object.assign(Object.assign({}, reading), { generatedAt: admin.firestore.FieldValue.serverTimestamp() }));
            // Send FCM push notification if token exists
            const userData = doc.data();
            const fcmToken = userData.fcmToken;
            if (fcmToken) {
                const premiumTransitNotification = isPremiumSubscriber(userData)
                    ? getPremiumTransitNotification(reading)
                    : null;
                const firstName = ((_b = userData.name) !== null && _b !== void 0 ? _b : 'you').split(' ')[0];
                const vibe = (_d = (_c = reading.unified) === null || _c === void 0 ? void 0 : _c.cosmicVibe) !== null && _d !== void 0 ? _d : 'Your cosmic reading is ready.';
                const notification = premiumTransitNotification !== null && premiumTransitNotification !== void 0 ? premiumTransitNotification : {
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
                }).catch(() => { }); // Silently ignore stale tokens
            }
        }
        catch (err) {
            console.error(`Failed for user ${doc.id}:`, err);
        }
    });
    await Promise.all(promises);
});
// ─── Transit-based reading generator ─────────────────────────────────────────
function generateReadingFromTransits(chart, transits, date) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11;
    const natalSunSign = (_b = (_a = chart.western) === null || _a === void 0 ? void 0 : _a.sun) !== null && _b !== void 0 ? _b : 'Aries';
    const natalMoon = (_d = (_c = chart.western) === null || _c === void 0 ? void 0 : _c.moon) !== null && _d !== void 0 ? _d : 'Aries';
    const natalRashi = (_f = (_e = chart.vedic) === null || _e === void 0 ? void 0 : _e.rashi) !== null && _f !== void 0 ? _f : 'Mesha';
    const nakshatraName = (_h = (_g = chart.vedic) === null || _g === void 0 ? void 0 : _g.nakshatra) !== null && _h !== void 0 ? _h : 'Ashwini';
    const currentDasha = (_l = (_k = (_j = chart.vedic) === null || _j === void 0 ? void 0 : _j.currentDasha) === null || _k === void 0 ? void 0 : _k.planet) !== null && _l !== void 0 ? _l : 'Sun';
    const subDasha = (_p = (_o = (_m = chart.vedic) === null || _m === void 0 ? void 0 : _m.subDasha) === null || _o === void 0 ? void 0 : _o.planet) !== null && _p !== void 0 ? _p : 'Moon';
    const chineseAnimal = (_r = (_q = chart.chinese) === null || _q === void 0 ? void 0 : _q.animal) !== null && _r !== void 0 ? _r : 'Rat';
    const chineseElement = (_t = (_s = chart.chinese) === null || _s === void 0 ? void 0 : _s.element) !== null && _t !== void 0 ? _t : 'Wood';
    const kpLagna = (_v = (_u = chart.kp) === null || _u === void 0 ? void 0 : _u.lagna) !== null && _v !== void 0 ? _v : 'Aries';
    const kpSubLord = (_x = (_w = chart.kp) === null || _w === void 0 ? void 0 : _w.lagnaSubLord) !== null && _x !== void 0 ? _x : 'Sun';
    // Transit Moon sign
    const transitMoon = (_z = (_y = transits.MOON) === null || _y === void 0 ? void 0 : _y.sign) !== null && _z !== void 0 ? _z : 'Aries';
    const transitSun = (_1 = (_0 = transits.SUN) === null || _0 === void 0 ? void 0 : _0.sign) !== null && _1 !== void 0 ? _1 : 'Aries';
    const transitJupiter = (_3 = (_2 = transits.JUPITER) === null || _2 === void 0 ? void 0 : _2.sign) !== null && _3 !== void 0 ? _3 : 'Aries';
    const transitSaturn = (_5 = (_4 = transits.SATURN) === null || _4 === void 0 ? void 0 : _4.sign) !== null && _5 !== void 0 ? _5 : 'Aries';
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
    const seedBase = date.getFullYear() * 1000 + dayOfYear;
    const seed = (n) => { const x = Math.sin(seedBase * n) * 10000; return x - Math.floor(x); };
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
    const luckyColor = ['Gold', 'Indigo', 'Crimson', 'Teal', 'Violet', 'Silver', 'Amber'][Math.floor(seed(11.7) * 7)];
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
            luckyDirection: (_8 = (_7 = (_6 = chart.chinese) === null || _6 === void 0 ? void 0 : _6.luckyDirections) === null || _7 === void 0 ? void 0 : _7[0]) !== null && _8 !== void 0 ? _8 : 'East',
            luckyColor: (_11 = (_10 = (_9 = chart.chinese) === null || _9 === void 0 ? void 0 : _9.luckyColors) === null || _10 === void 0 ? void 0 : _10[0]) !== null && _11 !== void 0 ? _11 : 'Green',
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
function getMantrasForDasha(planet) {
    var _a;
    const mantras = {
        Sun: 'Om Suryaya Namah', Moon: 'Om Chandraya Namah', Mars: 'Om Mangalaya Namah',
        Mercury: 'Om Budhaya Namah', Jupiter: 'Om Gurave Namah', Venus: 'Om Shukraya Namah',
        Saturn: 'Om Shanaye Namah', Rahu: 'Om Rahave Namah', Ketu: 'Om Ketave Namah',
    };
    return (_a = mantras[planet]) !== null && _a !== void 0 ? _a : 'Om Namah Shivaya';
}
function getRemedyForDasha(planet) {
    var _a;
    const remedies = {
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
    return (_a = remedies[planet]) !== null && _a !== void 0 ? _a : 'Meditate at sunrise';
}
function getSubLordMeaning(planet) {
    var _a;
    const meanings = {
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
    return (_a = meanings[planet]) !== null && _a !== void 0 ? _a : 'cosmic forces align in your favour';
}
function getCosmicVibe(sun, moonSign, jupiter, seed) {
    const vibes = [
        `${sun} solar force meets ${moonSign} Moon energy — a day of purposeful flow`,
        `Jupiter in ${jupiter} amplifies your ${sun} nature — expand with confidence`,
        `The cosmic currents favour deep inner work and outer bold action today`,
        `Celestial harmony between your natal chart and today's transits — trust the moment`,
    ];
    return vibes[Math.floor(seed(19.7) * vibes.length)];
}
//# sourceMappingURL=index.js.map