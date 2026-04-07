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
    var _a, _b, _c;
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
    const offsetPart = (_b = (_a = parts.find(p => p.type === 'timeZoneName')) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : 'GMT+0';
    const match = offsetPart.match(/GMT([+-])(\d+)(?::(\d+))?/);
    if (!match)
        return localDate;
    const sign = match[1] === '+' ? 1 : -1;
    const hours = parseInt(match[2], 10);
    const minutes = parseInt((_c = match[3]) !== null && _c !== void 0 ? _c : '0', 10);
    const offsetMs = sign * (hours * 60 + minutes) * 60 * 1000;
    return new Date(localDate.getTime() - offsetMs);
}
//# sourceMappingURL=geocoding.js.map