"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateWesternChart = calculateWesternChart;
const ephemeris_1 = require("./ephemeris");
const ELEMENTS = {
    Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
    Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
    Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
    Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water',
};
const MODALITIES = {
    Aries: 'Cardinal', Cancer: 'Cardinal', Libra: 'Cardinal', Capricorn: 'Cardinal',
    Taurus: 'Fixed', Leo: 'Fixed', Scorpio: 'Fixed', Aquarius: 'Fixed',
    Gemini: 'Mutable', Virgo: 'Mutable', Sagittarius: 'Mutable', Pisces: 'Mutable',
};
function planetToHouse(planetLon, cusps) {
    for (let h = 1; h <= 12; h++) {
        const start = cusps[h];
        const end = cusps[h === 12 ? 1 : h + 1];
        if (start <= end) {
            if (planetLon >= start && planetLon < end)
                return h;
        }
        else {
            // Spans 0°
            if (planetLon >= start || planetLon < end)
                return h;
        }
    }
    return 1;
}
function calculateWesternChart(birthDate, lat, lng) {
    var _a, _b, _c, _d;
    const positions = (0, ephemeris_1.getAllPlanets)(birthDate); // Tropical
    const houses = (0, ephemeris_1.getHouseCusps)(birthDate, lat, lng);
    const aspects = (0, ephemeris_1.getAspects)(positions);
    const planetData = {};
    for (const [name, pos] of Object.entries(positions)) {
        planetData[name] = {
            sign: pos.sign,
            degree: Math.round(pos.degree * 100) / 100,
            retrograde: pos.retrograde,
            house: planetToHouse(pos.longitude, houses.cusps),
        };
    }
    // Dominant element/modality count
    const elementCount = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
    const modalityCount = { Cardinal: 0, Fixed: 0, Mutable: 0 };
    const personalPlanets = ['SUN', 'MOON', 'MERCURY', 'VENUS', 'MARS'];
    for (const p of personalPlanets) {
        if (positions[p]) {
            elementCount[ELEMENTS[positions[p].sign]] = (elementCount[ELEMENTS[positions[p].sign]] || 0) + 1;
            modalityCount[MODALITIES[positions[p].sign]] = (modalityCount[MODALITIES[positions[p].sign]] || 0) + 1;
        }
    }
    const dominantElement = Object.entries(elementCount).sort((a, b) => b[1] - a[1])[0][0];
    const dominantModality = Object.entries(modalityCount).sort((a, b) => b[1] - a[1])[0][0];
    // Rising sign from ascendant longitude
    const risingSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const risingIndex = Math.floor(((houses.ascendant % 360) + 360) % 360 / 30) % 12;
    return {
        sun: (_b = (_a = positions.SUN) === null || _a === void 0 ? void 0 : _a.sign) !== null && _b !== void 0 ? _b : 'Unknown',
        moon: (_d = (_c = positions.MOON) === null || _c === void 0 ? void 0 : _c.sign) !== null && _d !== void 0 ? _d : 'Unknown',
        rising: risingSigns[risingIndex],
        planets: planetData,
        houses: houses.cusps.slice(1), // houses 1–12
        aspects: aspects.map(a => ({ planet1: a.planet1, planet2: a.planet2, aspect: a.aspect, orb: a.orb })),
        dominantElement,
        dominantModality,
    };
}
//# sourceMappingURL=western.js.map