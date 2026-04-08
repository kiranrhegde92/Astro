"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.geocodePlace = geocodePlace;
exports.localToUtc = localToUtc;
const axios_1 = __importDefault(require("axios"));
/**
 * Convert place name to coordinates using OpenStreetMap Nominatim (free, no API key).
 */
async function geocodePlace(placeName) {
    var _a;
    const url = 'https://nominatim.openstreetmap.org/search';
    const response = await axios_1.default.get(url, {
        params: { q: placeName, format: 'json', limit: 1, addressdetails: 1 },
        headers: { 'User-Agent': 'CosmicSelf-Astrology-App/1.0' },
    });
    if (!((_a = response.data) === null || _a === void 0 ? void 0 : _a.length)) {
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
async function getTimezone(lat, lng) {
    var _a, _b;
    try {
        const response = await axios_1.default.get('https://timeapi.io/api/timezone/coordinate', {
            params: { latitude: lat, longitude: lng },
        });
        return (_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a.timeZone) !== null && _b !== void 0 ? _b : 'UTC';
    }
    catch (_c) {
        return 'UTC';
    }
}
/**
 * Convert local birth time to UTC Date using timezone string.
 * birthDateLocal: 'YYYY-MM-DD', birthTimeLocal: 'HH:MM'
 */
function localToUtc(birthDateLocal, birthTimeLocal, timezone) {
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
    const p = (type) => { var _a, _b; return parseInt((_b = (_a = parts.find(x => x.type === type)) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : '0', 10); };
    const tzHour = p('hour') === 24 ? 0 : p('hour');
    const tzMs = Date.UTC(p('year'), p('month') - 1, p('day'), tzHour, p('minute'), p('second'));
    const offsetMs = tzMs - assumedUtcMs; // positive if east of UTC
    // Actual UTC = wall-clock time minus timezone offset
    return new Date(assumedUtcMs - offsetMs);
}
//# sourceMappingURL=geocoding.js.map