import axios from 'axios';

export interface GeoLocation {
  lat: number;
  lng: number;
  displayName: string;
  timezone: string;
}

/**
 * Convert place name to coordinates using OpenStreetMap Nominatim (free, no API key).
 */
export async function geocodePlace(placeName: string): Promise<GeoLocation> {
  const url = 'https://nominatim.openstreetmap.org/search';
  const response = await axios.get(url, {
    params: { q: placeName, format: 'json', limit: 1, addressdetails: 1 },
    headers: { 'User-Agent': 'CosmicSelf-Astrology-App/1.0' },
  });

  if (!response.data?.length) {
    throw new Error(`Location not found: ${placeName}`);
  }

  const result = response.data[0];
  const lat = parseFloat(result.lat);
  const lng = parseFloat(result.lon);

  // Get timezone using TimezoneDB-compatible endpoint (free)
  const timezone = await getTimezone(lat, lng);

  return {
    lat,
    lng,
    displayName: result.display_name,
    timezone,
  };
}

/**
 * Get IANA timezone string for coordinates using timeapi.io (free, no key).
 */
async function getTimezone(lat: number, lng: number): Promise<string> {
  try {
    const response = await axios.get('https://timeapi.io/api/timezone/coordinate', {
      params: { latitude: lat, longitude: lng },
    });
    return response.data?.timeZone ?? 'UTC';
  } catch {
    return 'UTC';
  }
}

/**
 * Convert local birth time to UTC Date using timezone string.
 * birthDateLocal: 'YYYY-MM-DD', birthTimeLocal: 'HH:MM'
 */
export function localToUtc(
  birthDateLocal: string,
  birthTimeLocal: string,
  timezone: string
): Date {
  // Parse wall-clock components
  const [year, month, day] = birthDateLocal.split('-').map(Number);
  const [hour, minute] = birthTimeLocal.split(':').map(Number);

  // Build a UTC instant whose wall-clock numbers match the user's local time.
  const assumedUtcMs = Date.UTC(year, month - 1, day, hour, minute, 0, 0);

  // Derive the timezone's UTC offset by formatting that instant in the
  // target timezone and measuring the wall-clock shift.
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(new Date(assumedUtcMs));
  const p = (type: string) => parseInt(parts.find(x => x.type === type)?.value ?? '0', 10);
  const tzHour = p('hour') === 24 ? 0 : p('hour');
  const tzMs = Date.UTC(p('year'), p('month') - 1, p('day'), tzHour, p('minute'), p('second'));
  const offsetMs = tzMs - assumedUtcMs; // positive if east of UTC

  // Actual UTC = wall-clock time minus timezone offset
  return new Date(assumedUtcMs - offsetMs);
}
