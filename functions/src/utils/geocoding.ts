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
  // Build ISO string with timezone
  const localString = `${birthDateLocal}T${birthTimeLocal}:00`;
  // Use Intl to get offset for that timezone at that datetime
  const localDate = new Date(localString);

  // Get UTC offset in minutes for the given timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'shortOffset',
  });
  const parts = formatter.formatToParts(localDate);
  const offsetPart = parts.find(p => p.type === 'timeZoneName')?.value ?? 'GMT+0';

  const match = offsetPart.match(/GMT([+-])(\d+)(?::(\d+))?/);
  if (!match) return localDate;

  const sign = match[1] === '+' ? 1 : -1;
  const hours = parseInt(match[2], 10);
  const minutes = parseInt(match[3] ?? '0', 10);
  const offsetMs = sign * (hours * 60 + minutes) * 60 * 1000;

  return new Date(localDate.getTime() - offsetMs);
}
