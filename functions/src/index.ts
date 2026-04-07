import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { calculateWesternChart } from './calculations/western';
import { calculateVedicChart } from './calculations/vedic';
import { calculateChineseChart } from './calculations/chinese';
import { calculateKPChart } from './calculations/kp';
import { geocodePlace, localToUtc } from './utils/geocoding';

admin.initializeApp();
const db = admin.firestore();

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
  if (cached.exists) return { reading: cached.data(), cached: true };

  // Get user's natal chart
  const chartSnap = await db.doc(`charts/${uid}`).get();
  if (!chartSnap.exists) throw new HttpsError('not-found', 'No chart found. Calculate chart first.');

  const chart = chartSnap.data()!;
  const now = new Date();

  // Current transits
  const { getAllPlanets, dateToJulian } = await import('./calculations/ephemeris');
  const jdNow = dateToJulian(now);
  const transits = getAllPlanets(jdNow);

  // Generate reading text based on transits vs natal
  const reading = generateReadingFromTransits(chart, transits, now);

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
        if (cached.exists) return;

        const chartSnap = await db.doc(`charts/${uid}`).get();
        if (!chartSnap.exists) return;

        const { getAllPlanets, dateToJulian } = await import('./calculations/ephemeris');
        const jdNow = dateToJulian(new Date());
        const transits = getAllPlanets(jdNow);
        const reading = generateReadingFromTransits(chartSnap.data()!, transits, new Date());

        await db.doc(`dailyReadings/${uid}/dates/${dateKey}`).set({
          ...reading,
          generatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Send FCM push notification if token exists
        const fcmToken = doc.data().fcmToken as string | undefined;
        if (fcmToken) {
          const firstName = (doc.data().name as string ?? 'you').split(' ')[0];
          const vibe = (reading as any).unified?.cosmicVibe ?? 'Your cosmic reading is ready.';
          await admin.messaging().send({
            token: fcmToken,
            notification: {
              title: `Good morning, ${firstName} ✨`,
              body: vibe.length > 100 ? `${vibe.slice(0, 97)}…` : vibe,
            },
            data: { screen: 'today', date: dateKey },
            android: { channelId: 'cosmic-daily' },
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
function generateReadingFromTransits(
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
