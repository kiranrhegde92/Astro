/**
 * Client-side geocoding using OpenStreetMap Nominatim (free, no API key).
 * Mirrors the backend geocoding.ts logic for use in the compatibility form.
 */

export interface GeoResult {
  name: string;
  lat: number;
  lng: number;
  timezone: string;
}

/**
 * Geocode a place name to coordinates and timezone.
 * Returns null if the place cannot be found.
 */
export async function geocodePlace(placeName: string): Promise<GeoResult | null> {
  if (!placeName.trim()) return null;

  try {
    const params = new URLSearchParams({
      q: placeName,
      format: 'json',
      limit: '1',
      addressdetails: '1',
    });
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      {
        headers: { 'User-Agent': 'CosmicSelf-Astrology-App/1.0' },
      }
    );

    if (!response.ok) return null;
    const data = await response.json();
    if (!data?.length) return null;

    const result = data[0];
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const displayName: string = result.display_name ?? placeName;

    // Get timezone
    const timezone = await getTimezone(lat, lng);

    return {
      name: displayName.split(',').slice(0, 2).join(',').trim(),
      lat,
      lng,
      timezone,
    };
  } catch {
    return null;
  }
}

async function getTimezone(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://timeapi.io/api/timezone/coordinate?latitude=${lat}&longitude=${lng}`
    );
    if (!response.ok) return 'UTC';
    const data = await response.json();
    return data?.timeZone ?? 'UTC';
  } catch {
    return 'UTC';
  }
}
