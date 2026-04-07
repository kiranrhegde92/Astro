"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateKPChart = calculateKPChart;
const ephemeris_1 = require("./ephemeris");
const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const NAKSHATRAS = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];
const NAKSHATRA_LORDS = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
const DASHA_YEARS = { Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17 };
const DASHA_ORDER = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
const TOTAL_YEARS = 120;
function getKPPosition(siderealLon) {
    const nakshatraSpan = 360 / 27;
    const nakshatraIndex = Math.floor(siderealLon / nakshatraSpan) % 27;
    const lonInNakshatra = siderealLon % nakshatraSpan;
    const nakshatra = NAKSHATRAS[nakshatraIndex];
    const nakshatraLord = NAKSHATRA_LORDS[nakshatraIndex % 9];
    const lordStartIdx = DASHA_ORDER.indexOf(nakshatraLord);
    let cursor = 0;
    let subLord = nakshatraLord;
    let subSubLord = nakshatraLord;
    for (let i = 0; i < 9; i++) {
        const subPlanet = DASHA_ORDER[(lordStartIdx + i) % 9];
        const subSpan = (DASHA_YEARS[subPlanet] / TOTAL_YEARS) * nakshatraSpan;
        if (lonInNakshatra >= cursor && lonInNakshatra < cursor + subSpan) {
            subLord = subPlanet;
            const subLordStartIdx = DASHA_ORDER.indexOf(subPlanet);
            let subCursor = cursor;
            for (let j = 0; j < 9; j++) {
                const sslPlanet = DASHA_ORDER[(subLordStartIdx + j) % 9];
                const sslSpan = (DASHA_YEARS[sslPlanet] / TOTAL_YEARS) * subSpan;
                if (lonInNakshatra >= subCursor && lonInNakshatra < subCursor + sslSpan) {
                    subSubLord = sslPlanet;
                    break;
                }
                subCursor += sslSpan;
            }
            break;
        }
        cursor += subSpan;
    }
    const signIndex = Math.floor(siderealLon / 30) % 12;
    return { sign: SIGNS[signIndex], nakshatra, nakshatraLord, subLord, subSubLord };
}
function calculateKPChart(birthDate, lat, lng) {
    const ayanamsa = (0, ephemeris_1.getLahiriAyanamsa)(birthDate);
    const positions = (0, ephemeris_1.getAllPlanets)(birthDate, true);
    const houses = (0, ephemeris_1.getHouseCusps)(birthDate, lat, lng);
    const siderealAsc = ((houses.ascendant - ayanamsa) + 360) % 360;
    const lagnaKP = getKPPosition(siderealAsc);
    const lagnaSignIdx = Math.floor(siderealAsc / 30) % 12;
    const planetData = {};
    for (const [name, pos] of Object.entries(positions)) {
        const kp = getKPPosition(pos.longitude);
        const houseNum = ((Math.floor(pos.longitude / 30) - lagnaSignIdx + 12) % 12) + 1;
        planetData[name] = Object.assign(Object.assign({}, kp), { house: houseNum, retrograde: pos.retrograde });
    }
    const houseCusps = houses.cusps.slice(1).map((cusp, i) => {
        const siderealCusp = ((cusp - ayanamsa) + 360) % 360;
        const kp = getKPPosition(siderealCusp);
        return Object.assign({ house: i + 1 }, kp);
    });
    const significators = {};
    for (let h = 1; h <= 12; h++) {
        significators[h] = Object.entries(planetData)
            .filter(([, p]) => p.house === h)
            .map(([name]) => name);
    }
    return { lagna: lagnaKP.sign, lagnaSubLord: lagnaKP.subLord, planets: planetData, houseCusps, significators };
}
//# sourceMappingURL=kp.js.map