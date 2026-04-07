import type { WesternSign, WesternElement, WesternModality, Planet } from '../../types/astrology';

// ---------- Helper Data ----------

/** Standard Western sun-sign date ranges (month, day) inclusive boundaries. */
export const SIGN_DATE_RANGES: Record<WesternSign, { start: [number, number]; end: [number, number] }> = {
  Aries:       { start: [3, 21],  end: [4, 19] },
  Taurus:      { start: [4, 20],  end: [5, 20] },
  Gemini:      { start: [5, 21],  end: [6, 20] },
  Cancer:      { start: [6, 21],  end: [7, 22] },
  Leo:         { start: [7, 23],  end: [8, 22] },
  Virgo:       { start: [8, 23],  end: [9, 22] },
  Libra:       { start: [9, 23],  end: [10, 22] },
  Scorpio:     { start: [10, 23], end: [11, 21] },
  Sagittarius: { start: [11, 22], end: [12, 21] },
  Capricorn:   { start: [12, 22], end: [1, 19] },
  Aquarius:    { start: [1, 20],  end: [2, 18] },
  Pisces:      { start: [2, 19],  end: [3, 20] },
};

export const SIGN_ELEMENTS: Record<WesternSign, WesternElement> = {
  Aries: 'Fire',       Taurus: 'Earth',     Gemini: 'Air',        Cancer: 'Water',
  Leo: 'Fire',         Virgo: 'Earth',      Libra: 'Air',         Scorpio: 'Water',
  Sagittarius: 'Fire', Capricorn: 'Earth',  Aquarius: 'Air',      Pisces: 'Water',
};

export const SIGN_MODALITIES: Record<WesternSign, WesternModality> = {
  Aries: 'Cardinal',    Taurus: 'Fixed',      Gemini: 'Mutable',
  Cancer: 'Cardinal',   Leo: 'Fixed',         Virgo: 'Mutable',
  Libra: 'Cardinal',    Scorpio: 'Fixed',     Sagittarius: 'Mutable',
  Capricorn: 'Cardinal', Aquarius: 'Fixed',   Pisces: 'Mutable',
};

export const RULING_PLANETS: Record<WesternSign, Planet> = {
  Aries: 'Mars',
  Taurus: 'Venus',
  Gemini: 'Mercury',
  Cancer: 'Moon',
  Leo: 'Sun',
  Virgo: 'Mercury',
  Libra: 'Venus',
  Scorpio: 'Pluto',
  Sagittarius: 'Jupiter',
  Capricorn: 'Saturn',
  Aquarius: 'Uranus',
  Pisces: 'Neptune',
};

/** Ordered zodiac signs starting from Aries (index 0). */
const ZODIAC_ORDER: WesternSign[] = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

// ---------- Public Functions ----------

/**
 * Determine the Western Sun sign for a given birth date.
 * Uses the standard tropical zodiac date ranges.
 */
export function getWesternSunSign(date: Date): WesternSign {
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();

  for (const sign of ZODIAC_ORDER) {
    const { start, end } = SIGN_DATE_RANGES[sign];

    // Capricorn wraps across the year boundary (Dec 22 - Jan 19)
    if (start[0] > end[0]) {
      if ((month === start[0] && day >= start[1]) || (month === end[0] && day <= end[1])) {
        return sign;
      }
    } else {
      if (
        (month === start[0] && day >= start[1] && month === end[0] && day <= end[1]) ||
        (month === start[0] && day >= start[1] && month < end[0]) ||
        (month === end[0] && day <= end[1] && month > start[0]) ||
        (month > start[0] && month < end[0])
      ) {
        return sign;
      }
    }
  }

  // Fallback (should never happen with correct ranges)
  return 'Aries';
}

/**
 * Approximate the Moon sign from a birth date.
 *
 * Uses a 6-term perturbation model (simplified Brown's lunar theory) for ~1°
 * accuracy — the same formula used for planetary position tables.
 */
export function getWesternMoonSign(date: Date): WesternSign {
  const J2000_MS = Date.UTC(2000, 0, 1, 12, 0, 0);
  const d = (date.getTime() - J2000_MS) / 86_400_000;
  const toRad = Math.PI / 180;

  const L = (218.316 + 13.176396 * d) % 360;
  const M = (134.963 + 13.064993 * d) % 360;
  const D = (297.850 + 12.190749 * d) % 360;

  let longitude =
    L +
    6.289 * Math.sin(M * toRad) +
    1.274 * Math.sin((2 * D - M) * toRad) +
    0.658 * Math.sin(2 * D * toRad) +
    0.214 * Math.sin(2 * M * toRad) -
    0.186 * Math.sin((357.528 + 0.9856003 * d) * toRad) -
    0.114 * Math.sin(2 * (93.272 + 13.229350 * d) * toRad);

  longitude = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(longitude / 30) % 12;
  return ZODIAC_ORDER[signIndex];
}

/**
 * Approximate the Rising (Ascendant) sign.
 *
 * The Ascendant is the zodiac sign on the eastern horizon at the moment of
 * birth. A precise calculation requires an ephemeris and full obliquity
 * computation. This simplified version uses:
 *   - The Sun sign as a baseline (the sign the Sun was in at birth).
 *   - The local sidereal time derived from birth time and longitude.
 *
 * If birthTime or coordinates are not supplied, returns undefined.
 *
 * @param date      Birth date
 * @param birthTime Time string in "HH:MM" 24-hour format (local time)
 * @param lat       Birth latitude  (degrees, positive = N)
 * @param lng       Birth longitude (degrees, positive = E)
 */
export function getWesternRisingSign(
  date: Date,
  birthTime?: string,
  lat?: number,
  lng?: number,
): WesternSign | undefined {
  if (!birthTime || lat === undefined || lng === undefined) {
    return undefined;
  }

  const [hoursStr, minutesStr] = birthTime.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  if (isNaN(hours) || isNaN(minutes)) {
    return undefined;
  }

  // ---- Compute approximate Local Sidereal Time (LST) ----

  // Days since J2000.0 (2000-01-01T12:00:00 UTC)
  const J2000_MS = Date.UTC(2000, 0, 1, 12, 0, 0);
  const daysSinceJ2000 = (date.getTime() - J2000_MS) / 86_400_000;

  // Greenwich Mean Sidereal Time at 0h UT (in hours), Meeus formula
  const T = daysSinceJ2000 / 36525; // Julian centuries
  let gmst0h =
    6.697374558 +
    2400.0513369 * T +
    0.0000258622 * T * T -
    1.7222e-9 * T * T * T;

  // Normalize to [0, 24)
  gmst0h = ((gmst0h % 24) + 24) % 24;

  // Sidereal time advances ~1.00273791 sidereal hours per solar hour
  const ut = hours + minutes / 60; // treat birthTime as UT approximation
  const gst = gmst0h + ut * 1.00273790935;

  // Local Sidereal Time = GST + longitude (converted to hours)
  let lst = gst + lng / 15;
  lst = ((lst % 24) + 24) % 24;

  // ---- Ascendant from LST ----
  // The LST (in hours) maps almost directly to the zodiac:
  //   0h LST  ≈ 0 deg Aries on the MC.  The Ascendant is roughly
  //   (LST_degrees + 90) at the equator, modified by latitude.
  //
  // Simplified formula (good at moderate latitudes):
  //   Ascendant longitude ≈ atan2(
  //     cos(LST_deg),
  //     -(sin(LST_deg) * cos(obliquity) + tan(lat) * sin(obliquity))
  //   )
  //
  // We use mean obliquity ε ≈ 23.4393 degrees.

  const obliquity = 23.4393 * (Math.PI / 180);
  const latRad = lat * (Math.PI / 180);
  const lstDeg = lst * 15; // convert hours to degrees
  const lstRad = lstDeg * (Math.PI / 180);

  const y = Math.cos(lstRad);
  const x = -(Math.sin(lstRad) * Math.cos(obliquity) + Math.tan(latRad) * Math.sin(obliquity));

  let ascRad = Math.atan2(y, x);
  let ascDeg = ascRad * (180 / Math.PI);

  // Normalize to [0, 360)
  ascDeg = ((ascDeg % 360) + 360) % 360;

  const signIndex = Math.floor(ascDeg / 30) % 12;
  return ZODIAC_ORDER[signIndex];
}

/** Return the element for a given Western sign. */
export function getElement(sign: WesternSign): WesternElement {
  return SIGN_ELEMENTS[sign];
}

/** Return the modality for a given Western sign. */
export function getModality(sign: WesternSign): WesternModality {
  return SIGN_MODALITIES[sign];
}

/** Return the modern ruling planet for a given Western sign. */
export function getRulingPlanet(sign: WesternSign): Planet {
  return RULING_PLANETS[sign];
}

// ---------- Internal Helpers (exported for testing) ----------

/**
 * Return the ecliptic longitude (0-360) of the Sun for a given date.
 * Uses a low-precision formula accurate to ~1 degree.
 */
export function _approxSunLongitude(date: Date): number {
  const J2000_MS = Date.UTC(2000, 0, 1, 12, 0, 0);
  const d = (date.getTime() - J2000_MS) / 86_400_000;

  // Mean longitude and mean anomaly (degrees)
  const L = (280.460 + 0.9856474 * d) % 360;
  const g = ((357.528 + 0.9856003 * d) % 360) * (Math.PI / 180);

  // Ecliptic longitude
  let lambda = L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g);
  lambda = ((lambda % 360) + 360) % 360;
  return lambda;
}

/**
 * Convert ecliptic longitude to zodiac sign index (0 = Aries).
 */
export function _longitudeToSignIndex(longitude: number): number {
  return Math.floor(((longitude % 360) + 360) % 360 / 30);
}

/**
 * Convert ecliptic longitude to degree within the sign (0-29.999...).
 */
export function _longitudeToDegreeInSign(longitude: number): number {
  return ((longitude % 360) + 360) % 360 % 30;
}
