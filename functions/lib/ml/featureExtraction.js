"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractPredictionFeatures = extractPredictionFeatures;
const HOUSE_GROUPS = {
    love: [5, 7, 11],
    career: [2, 6, 10],
    wellness: [1, 6, 12],
    wealth: [2, 8, 11],
    education: [3, 4, 5, 9],
    travel: [3, 9, 12],
};
const TRANSIT_WEIGHTS = {
    SUN: 1.6,
    MOON: 1.4,
    MERCURY: 1.8,
    VENUS: 2,
    MARS: 2.1,
    JUPITER: 2.8,
    SATURN: 3,
    MEAN_NODE: 2.4,
    KETU: 2.2,
};
const ASPECTS = [
    { name: 'conjunction', angle: 0, maxOrb: 6, support: 1.1, tension: 0.2 },
    { name: 'trine', angle: 120, maxOrb: 6, support: 1, tension: 0 },
    { name: 'sextile', angle: 60, maxOrb: 4, support: 0.82, tension: 0 },
    { name: 'square', angle: 90, maxOrb: 5, support: 0.1, tension: 1 },
    { name: 'opposition', angle: 180, maxOrb: 6, support: 0.2, tension: 0.9 },
];
const MONTH_ELEMENTS = ['Water', 'Wood', 'Wood', 'Fire', 'Fire', 'Earth', 'Earth', 'Metal', 'Metal', 'Water', 'Water', 'Earth'];
function formatDateKey(date) {
    return date.toISOString().split('T')[0];
}
function toLongitude(sign, degree) {
    const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const signIndex = SIGNS.indexOf(sign);
    return ((signIndex < 0 ? 0 : signIndex) * 30) + (degree !== null && degree !== void 0 ? degree : 0);
}
function formatPlanet(planet) {
    var _a;
    const labels = {
        MEAN_NODE: 'Rahu',
        KETU: 'Ketu',
        SUN: 'Sun',
        MOON: 'Moon',
        MERCURY: 'Mercury',
        VENUS: 'Venus',
        MARS: 'Mars',
        JUPITER: 'Jupiter',
        SATURN: 'Saturn',
    };
    return (_a = labels[planet]) !== null && _a !== void 0 ? _a : planet;
}
function formatSignal(signal) {
    return `${formatPlanet(signal.transitPlanet)} ${signal.aspect} natal ${formatPlanet(signal.natalPlanet)}`;
}
function planetMatchesArea(planet, area) {
    const groups = {
        love: ['MOON', 'VENUS'],
        career: ['SUN', 'MARS', 'MERCURY', 'JUPITER', 'SATURN'],
        wellness: ['MOON', 'SATURN', 'SUN'],
        wealth: ['VENUS', 'JUPITER', 'SATURN'],
        education: ['MERCURY', 'JUPITER', 'MOON'],
        travel: ['JUPITER', 'MEAN_NODE', 'KETU', 'MERCURY'],
    };
    return groups[area].includes(planet);
}
function getAreaImpact(signals, area, mode) {
    return signals.reduce((sum, signal) => {
        const matchesHouse = HOUSE_GROUPS[area].includes(signal.house);
        const matchesPlanet = planetMatchesArea(signal.transitPlanet, area) || planetMatchesArea(signal.natalPlanet, area);
        if (!matchesHouse && !matchesPlanet)
            return sum;
        return sum + (mode === 'support' ? signal.support : signal.tension);
    }, 0);
}
function getSubDashaProgress(currentDasha, subDasha, date) {
    var _a, _b;
    if (!currentDasha || !subDasha)
        return 0;
    const start = new Date((_a = subDasha.startDate) !== null && _a !== void 0 ? _a : currentDasha.startDate).getTime();
    const end = new Date((_b = subDasha.endDate) !== null && _b !== void 0 ? _b : currentDasha.endDate).getTime();
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start)
        return 0;
    return Math.max(0, Math.min(1, (date.getTime() - start) / (end - start)));
}
function extractPredictionFeatures(chart, transits, date, window) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11;
    const signals = Object.entries(transits)
        .filter(([planet]) => ['SUN', 'MOON', 'MERCURY', 'VENUS', 'MARS', 'JUPITER', 'SATURN', 'MEAN_NODE', 'KETU'].includes(planet))
        .flatMap(([transitPlanet, transitValue]) => {
        var _a, _b;
        return Object.entries((_b = (_a = chart.western) === null || _a === void 0 ? void 0 : _a.planets) !== null && _b !== void 0 ? _b : {}).flatMap(([natalPlanet, natalValue]) => {
            var _a, _b, _c;
            const transitLon = Number(transitValue === null || transitValue === void 0 ? void 0 : transitValue.longitude);
            const natalLon = typeof (natalValue === null || natalValue === void 0 ? void 0 : natalValue.longitude) === 'number'
                ? Number(natalValue.longitude)
                : toLongitude(natalValue === null || natalValue === void 0 ? void 0 : natalValue.sign, Number((_a = natalValue === null || natalValue === void 0 ? void 0 : natalValue.degree) !== null && _a !== void 0 ? _a : 0));
            if (Number.isNaN(transitLon) || Number.isNaN(natalLon))
                return [];
            let separation = Math.abs(transitLon - natalLon);
            if (separation > 180)
                separation = 360 - separation;
            for (const aspect of ASPECTS) {
                const orb = Math.abs(separation - aspect.angle);
                if (orb <= aspect.maxOrb) {
                    const closeness = Math.max(0.2, 1 - (orb / aspect.maxOrb));
                    const weight = (_b = TRANSIT_WEIGHTS[transitPlanet]) !== null && _b !== void 0 ? _b : 1.5;
                    return [{
                            transitPlanet,
                            natalPlanet,
                            aspect: aspect.name,
                            orb: Number(orb.toFixed(2)),
                            house: Number((_c = natalValue === null || natalValue === void 0 ? void 0 : natalValue.house) !== null && _c !== void 0 ? _c : 0),
                            support: Number((weight * closeness * aspect.support).toFixed(2)),
                            tension: Number((weight * closeness * aspect.tension).toFixed(2)),
                        }];
                }
            }
            return [];
        });
    })
        .sort((a, b) => (b.support + b.tension) - (a.support + a.tension));
    const dashaEnd = new Date((_c = (_b = (_a = chart.vedic) === null || _a === void 0 ? void 0 : _a.currentDasha) === null || _b === void 0 ? void 0 : _b.endDate) !== null && _c !== void 0 ? _c : date).getTime();
    const dashaDaysRemaining = Number.isFinite(dashaEnd)
        ? Math.max(0, Math.round((dashaEnd - date.getTime()) / (1000 * 60 * 60 * 24)))
        : 0;
    const seasonalElement = (_d = MONTH_ELEMENTS[date.getMonth()]) !== null && _d !== void 0 ? _d : 'Earth';
    const areaSignals = {
        career: getAreaImpact(signals, 'career', 'support'),
        love: getAreaImpact(signals, 'love', 'support'),
        wellness: getAreaImpact(signals, 'wellness', 'support'),
        wealth: getAreaImpact(signals, 'wealth', 'support'),
        education: getAreaImpact(signals, 'education', 'support'),
        travel: getAreaImpact(signals, 'travel', 'support'),
    };
    const areaTension = {
        career: getAreaImpact(signals, 'career', 'tension'),
        love: getAreaImpact(signals, 'love', 'tension'),
        wellness: getAreaImpact(signals, 'wellness', 'tension'),
        wealth: getAreaImpact(signals, 'wealth', 'tension'),
        education: getAreaImpact(signals, 'education', 'tension'),
        travel: getAreaImpact(signals, 'travel', 'tension'),
    };
    const kpPredictions = Array.isArray((_e = chart.kp) === null || _e === void 0 ? void 0 : _e.predictions) ? chart.kp.predictions : [];
    const kpTopArea = (_g = (_f = kpPredictions.sort((a, b) => { var _a, _b; return Number((_a = b.confidence) !== null && _a !== void 0 ? _a : 0) - Number((_b = a.confidence) !== null && _b !== void 0 ? _b : 0); })[0]) === null || _f === void 0 ? void 0 : _f.area) !== null && _g !== void 0 ? _g : 'career';
    return {
        window,
        dateKey: formatDateKey(date),
        westernSun: (_j = (_h = chart.western) === null || _h === void 0 ? void 0 : _h.sun) !== null && _j !== void 0 ? _j : 'Aries',
        westernElement: (_l = (_k = chart.western) === null || _k === void 0 ? void 0 : _k.dominantElement) !== null && _l !== void 0 ? _l : 'Fire',
        westernModality: (_o = (_m = chart.western) === null || _m === void 0 ? void 0 : _m.dominantModality) !== null && _o !== void 0 ? _o : 'Cardinal',
        vedicRashi: (_q = (_p = chart.vedic) === null || _p === void 0 ? void 0 : _p.rashi) !== null && _q !== void 0 ? _q : 'Mesha',
        dashaPlanet: (_t = (_s = (_r = chart.vedic) === null || _r === void 0 ? void 0 : _r.currentDasha) === null || _s === void 0 ? void 0 : _s.planet) !== null && _t !== void 0 ? _t : 'Sun',
        subDashaPlanet: (_z = (_w = (_v = (_u = chart.vedic) === null || _u === void 0 ? void 0 : _u.subDasha) === null || _v === void 0 ? void 0 : _v.planet) !== null && _w !== void 0 ? _w : (_y = (_x = chart.vedic) === null || _x === void 0 ? void 0 : _x.currentDasha) === null || _y === void 0 ? void 0 : _y.planet) !== null && _z !== void 0 ? _z : 'Sun',
        chineseAnimal: (_1 = (_0 = chart.chinese) === null || _0 === void 0 ? void 0 : _0.animal) !== null && _1 !== void 0 ? _1 : 'Rat',
        chineseElement: (_3 = (_2 = chart.chinese) === null || _2 === void 0 ? void 0 : _2.element) !== null && _3 !== void 0 ? _3 : 'Wood',
        kpTopArea,
        supportTotal: Number(signals.reduce((sum, signal) => sum + signal.support, 0).toFixed(2)),
        challengeTotal: Number(signals.reduce((sum, signal) => sum + signal.tension, 0).toFixed(2)),
        areaSignals: Object.fromEntries(Object.entries(areaSignals).map(([area, value]) => [area, Number(value.toFixed(2))])),
        areaTension: Object.fromEntries(Object.entries(areaTension).map(([area, value]) => [area, Number(value.toFixed(2))])),
        signalCount: signals.length,
        dashaDaysRemaining,
        subDashaProgress: Number(getSubDashaProgress((_4 = chart.vedic) === null || _4 === void 0 ? void 0 : _4.currentDasha, (_5 = chart.vedic) === null || _5 === void 0 ? void 0 : _5.subDasha, date).toFixed(3)),
        seasonalElementMatch: seasonalElement === ((_7 = (_6 = chart.chinese) === null || _6 === void 0 ? void 0 : _6.element) !== null && _7 !== void 0 ? _7 : 'Wood') ? 1 : 0,
        confidenceInputs: {
            westernPlanets: Array.isArray((_8 = chart.western) === null || _8 === void 0 ? void 0 : _8.planets) ? chart.western.planets.length : Object.keys((_10 = (_9 = chart.western) === null || _9 === void 0 ? void 0 : _9.planets) !== null && _10 !== void 0 ? _10 : {}).length,
            kpPredictions: kpPredictions.length,
            remedies: Array.isArray((_11 = chart.vedic) === null || _11 === void 0 ? void 0 : _11.remedies) ? chart.vedic.remedies.length : 0,
        },
        supportingSignals: signals.slice(0, 5).map((signal) => formatSignal(signal)),
    };
}
//# sourceMappingURL=featureExtraction.js.map