"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTransitReading = buildTransitReading;
const HOUSE_GROUPS = {
    love: [5, 7, 11],
    career: [2, 6, 10],
    wellness: [1, 6, 12],
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
const DASHA_THEMES = {
    Sun: 'visibility, self-respect, and leadership',
    Moon: 'emotional truth, care, and regulation',
    Mars: 'courage, friction, and exact action',
    Mercury: 'planning, writing, and sharper decisions',
    Jupiter: 'growth, teaching, and wider opportunities',
    Venus: 'relationships, beauty, and value alignment',
    Saturn: 'discipline, pressure, and durable progress',
    Rahu: 'ambition, experimentation, and rapid change',
    Ketu: 'release, pruning, and spiritual distance from noise',
};
const AFFIRMATIONS = {
    love: 'I let closeness deepen through honesty and steadiness.',
    career: 'I move with timing, clarity, and earned confidence.',
    wellness: 'I protect my pace so my signal stays clear.',
};
const MONTH_ELEMENTS = ['Water', 'Wood', 'Wood', 'Fire', 'Fire', 'Earth', 'Earth', 'Metal', 'Metal', 'Water', 'Water', 'Earth'];
const DAILY_READING_VERSION = 3;
const DIRECTION_BY_ELEMENT = {
    Wood: 'East',
    Fire: 'South',
    Earth: 'Center',
    Metal: 'West',
    Water: 'North',
};
const HOUSE_THEMES = {
    1: 'identity and body',
    2: 'money and self-worth',
    3: 'messages and movement',
    4: 'home and emotional base',
    5: 'romance and creativity',
    6: 'workload and health routines',
    7: 'partnership and mirrors',
    8: 'shared power and deeper trust',
    9: 'belief, learning, and travel',
    10: 'career and visibility',
    11: 'friends, networks, and future plans',
    12: 'rest, closure, and inner repair',
};
const ELEMENT_STYLE = {
    Fire: 'move boldly while the signal is clear',
    Earth: 'make the practical next step tangible',
    Air: 'name the pattern and act from clarity',
    Water: 'trust emotional timing over outside noise',
};
const MODALITY_STYLE = {
    Cardinal: 'initiate instead of circling',
    Fixed: 'stay with the choice once it proves itself',
    Mutable: 'adapt without scattering your attention',
};
const ANIMAL_STYLE = {
    Rat: 'pattern recognition and quick pivots',
    Ox: 'consistency and durable follow-through',
    Tiger: 'courage and instinctive movement',
    Rabbit: 'soft power and social timing',
    Dragon: 'presence and larger-than-average momentum',
    Snake: 'precision and selective disclosure',
    Horse: 'freedom and decisive motion',
    Goat: 'sensitivity and atmosphere awareness',
    Monkey: 'ingenuity and tactical adjustments',
    Rooster: 'discernment and sharper standards',
    Dog: 'loyalty and protective judgment',
    Pig: 'warmth and grounded receptivity',
};
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
function getSignalFocus(signal) {
    var _a;
    if (!signal)
        return 'the clearest signal in your chart';
    return `${formatSignal(signal)} in the zone of ${(_a = HOUSE_THEMES[signal.house]) !== null && _a !== void 0 ? _a : 'timing and priorities'}`;
}
function getWesternSignature(chart) {
    var _a, _b, _c, _d, _e, _f, _g;
    const sun = (_b = (_a = chart.western) === null || _a === void 0 ? void 0 : _a.sun) !== null && _b !== void 0 ? _b : 'Aries';
    const moon = (_d = (_c = chart.western) === null || _c === void 0 ? void 0 : _c.moon) !== null && _d !== void 0 ? _d : 'Cancer';
    const rising = ((_e = chart.western) === null || _e === void 0 ? void 0 : _e.rising) ? `${chart.western.rising} rising` : `${(_g = (_f = chart.western) === null || _f === void 0 ? void 0 : _f.dominantElement) !== null && _g !== void 0 ? _g : 'Fire'} emphasis`;
    return `${sun} Sun, ${moon} Moon, and ${rising}`;
}
function getStyleCue(chart) {
    var _a, _b, _c, _d, _e, _f;
    const element = (_b = (_a = chart.western) === null || _a === void 0 ? void 0 : _a.dominantElement) !== null && _b !== void 0 ? _b : 'Fire';
    const modality = (_d = (_c = chart.western) === null || _c === void 0 ? void 0 : _c.dominantModality) !== null && _d !== void 0 ? _d : 'Cardinal';
    return `${(_e = ELEMENT_STYLE[element]) !== null && _e !== void 0 ? _e : 'move with cleaner timing'} and ${(_f = MODALITY_STYLE[modality]) !== null && _f !== void 0 ? _f : 'keep your attention coordinated'}`;
}
function buildAffirmation(area, chart, dashaPlanet) {
    return `${AFFIRMATIONS[area]} ${dashaPlanet} timing supports ${area === 'love' ? 'deeper trust' : area === 'career' ? 'decisive progress' : 'cleaner regulation'} today.`;
}
function mantraForDasha(planet) {
    var _a;
    return (_a = {
        Sun: 'Om Suryaya Namah',
        Moon: 'Om Chandraya Namah',
        Mars: 'Om Mangalaya Namah',
        Mercury: 'Om Budhaya Namah',
        Jupiter: 'Om Gurave Namah',
        Venus: 'Om Shukraya Namah',
        Saturn: 'Om Shanaye Namah',
        Rahu: 'Om Rahave Namah',
        Ketu: 'Om Ketave Namah',
    }[planet]) !== null && _a !== void 0 ? _a : 'Om Namah Shivaya';
}
function remedyForDasha(planet) {
    var _a;
    return (_a = {
        Sun: 'Offer water to the Sun at sunrise and tighten your focus before the day scatters it.',
        Moon: 'Slow the evening down, reduce stimulation, and let water or silence reset your nervous system.',
        Mars: 'Use movement first, then make the difficult decision once pressure has dropped.',
        Mercury: 'Write the three decisions that matter before the feed starts choosing for you.',
        Jupiter: 'Study, teach, or make one generous move that widens your perspective.',
        Venus: 'Choose one act of beauty, softness, or repair that restores value alignment.',
        Saturn: 'Give the hardest responsibility your first clean hour instead of postponing it.',
        Rahu: 'Pause before intensity. The right move survives a slower second look.',
        Ketu: 'Drop one stale obligation so your attention returns to what is real.',
    }[planet]) !== null && _a !== void 0 ? _a : 'Take a quieter start than usual and let the signal settle.';
}
function subLordMeaning(planet) {
    var _a;
    return (_a = {
        Sun: 'results come through ownership and visibility',
        Moon: 'timing follows emotional clarity and regulation',
        Mars: 'progress responds to decisive but clean action',
        Mercury: 'the opening comes through communication and planning',
        Jupiter: 'growth follows study, generosity, and breadth',
        Venus: 'ease improves when value and relationship choices align',
        Saturn: 'steady effort matters more than speed',
        Rahu: 'unusual doors can open if impulse is filtered first',
        Ketu: 'clarity arrives through subtraction, not accumulation',
    }[planet]) !== null && _a !== void 0 ? _a : 'steady timing matters more than noise';
}
function planetMatchesArea(planet, area) {
    const groups = {
        love: ['MOON', 'VENUS'],
        career: ['SUN', 'MARS', 'MERCURY', 'JUPITER', 'SATURN'],
        wellness: ['MOON', 'SATURN', 'SUN'],
    };
    return groups[area].includes(planet);
}
function collectSignals(chart, transits) {
    return Object.entries(transits)
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
}
function getAreaSignal(signals, area) {
    var _a;
    return (_a = signals.find((signal) => HOUSE_GROUPS[area].includes(signal.house) ||
        planetMatchesArea(signal.transitPlanet, area) ||
        planetMatchesArea(signal.natalPlanet, area))) !== null && _a !== void 0 ? _a : signals[0];
}
function buildTransitReading(chart, transits, date) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11;
    const signals = collectSignals(chart, transits);
    const supportSignals = signals.filter((signal) => signal.aspect !== 'square' && signal.aspect !== 'opposition');
    const challengeSignals = signals.filter((signal) => signal.aspect === 'square' || signal.aspect === 'opposition');
    const overallSignal = (_a = supportSignals[0]) !== null && _a !== void 0 ? _a : signals[0];
    const loveSignal = getAreaSignal(signals, 'love');
    const careerSignal = getAreaSignal(signals, 'career');
    const wellnessSignal = getAreaSignal(challengeSignals.length ? challengeSignals : signals, 'wellness');
    const supportScore = supportSignals.reduce((sum, signal) => sum + signal.support, 0);
    const challengeScore = challengeSignals.reduce((sum, signal) => sum + signal.tension, 0);
    const dominantArea = ((_c = (_b = [
        ['love', loveSignal ? (loveSignal.support + loveSignal.tension) : 0],
        ['career', careerSignal ? (careerSignal.support + careerSignal.tension) : 0],
        ['wellness', wellnessSignal ? (wellnessSignal.support + wellnessSignal.tension) : 0],
    ].sort((a, b) => Number(b[1]) - Number(a[1]))[0]) === null || _b === void 0 ? void 0 : _b[0]) !== null && _c !== void 0 ? _c : 'career');
    const natalSunSign = (_e = (_d = chart.western) === null || _d === void 0 ? void 0 : _d.sun) !== null && _e !== void 0 ? _e : 'Aries';
    const natalMoon = (_g = (_f = chart.western) === null || _f === void 0 ? void 0 : _f.moon) !== null && _g !== void 0 ? _g : 'Cancer';
    const natalRashi = (_j = (_h = chart.vedic) === null || _h === void 0 ? void 0 : _h.rashi) !== null && _j !== void 0 ? _j : 'Mesha';
    const nakshatraName = (_l = (_k = chart.vedic) === null || _k === void 0 ? void 0 : _k.nakshatra) !== null && _l !== void 0 ? _l : 'Ashwini';
    const currentDasha = (_p = (_o = (_m = chart.vedic) === null || _m === void 0 ? void 0 : _m.currentDasha) === null || _o === void 0 ? void 0 : _o.planet) !== null && _p !== void 0 ? _p : 'Sun';
    const subDasha = (_s = (_r = (_q = chart.vedic) === null || _q === void 0 ? void 0 : _q.subDasha) === null || _r === void 0 ? void 0 : _r.planet) !== null && _s !== void 0 ? _s : currentDasha;
    const chineseAnimal = (_u = (_t = chart.chinese) === null || _t === void 0 ? void 0 : _t.animal) !== null && _u !== void 0 ? _u : 'Rat';
    const chineseElement = (_w = (_v = chart.chinese) === null || _v === void 0 ? void 0 : _v.element) !== null && _w !== void 0 ? _w : 'Wood';
    const seasonalElement = (_x = MONTH_ELEMENTS[date.getMonth()]) !== null && _x !== void 0 ? _x : 'Earth';
    const kpLagna = (_z = (_y = chart.kp) === null || _y === void 0 ? void 0 : _y.lagna) !== null && _z !== void 0 ? _z : 'Aries';
    const kpSubLord = (_1 = (_0 = chart.kp) === null || _0 === void 0 ? void 0 : _0.lagnaSubLord) !== null && _1 !== void 0 ? _1 : 'Sun';
    const signature = getWesternSignature(chart);
    const styleCue = getStyleCue(chart);
    const cautionSignal = challengeSignals[0];
    const positivityScore = Number(Math.max(0.64, Math.min(0.92, 0.74 + supportScore * 0.018 - challengeScore * 0.014)).toFixed(2));
    const cosmicVibe = overallSignal
        ? `${getSignalFocus(overallSignal)} is active for your ${signature} chart today. Lean into ${dominantArea === 'love' ? 'the conversation that deepens trust' : dominantArea === 'career' ? 'the work that changes your trajectory' : 'the rhythm that keeps you regulated'} and ${styleCue}.`
        : `${signature} meets ${currentDasha} timing through ${styleCue}, so the day rewards cleaner choices than usual.`;
    return {
        version: DAILY_READING_VERSION,
        date: date.toISOString().split('T')[0],
        western: {
            overall: overallSignal
                ? `${getSignalFocus(overallSignal)} is setting the western tone. For your ${signature} makeup, the right move is to ${dominantArea === 'love' ? 'lead with warmth before intensity' : dominantArea === 'career' ? 'back the consequential decision' : 'protect your pace before pressure builds'}.`
                : `Your ${signature} makeup wants cleaner pacing and fewer scattered commitments today.`,
            love: loveSignal
                ? `${getSignalFocus(loveSignal)} softens relationship dynamics. Let your ${natalMoon} Moon stay honest instead of over-managed.`
                : `Connection improves when your ${natalMoon} Moon stays warm and simple instead of over-explaining itself.`,
            career: careerSignal
                ? `${getSignalFocus(careerSignal)} supports work, direction, and decisions that carry real weight.`
                : `Protect one serious block for the work that compounds. Your ${(_3 = (_2 = chart.western) === null || _2 === void 0 ? void 0 : _2.dominantElement) !== null && _3 !== void 0 ? _3 : 'Fire'} chart does not need five competing priorities today.`,
            wellness: wellnessSignal
                ? `${getSignalFocus(wellnessSignal)} is asking for better pacing.${cautionSignal ? ` The main strain line is ${getSignalFocus(cautionSignal)}.` : ''}`
                : 'Your body responds best to rhythm today. Eat, move, and rest before the schedule starts leading you.',
            luckyNumber: ((date.getDate() + Math.round(supportScore * 3) + date.getMonth()) % 9) + 1,
            transitHighlight: overallSignal ? formatSignal(overallSignal) : 'Sun emphasis',
        },
        vedic: {
            dasha: `${currentDasha} Mahadasha and ${subDasha} Antardasha make ${(_4 = DASHA_THEMES[currentDasha]) !== null && _4 !== void 0 ? _4 : 'timing'} the main Vedic theme for a ${natalRashi} native with ${natalSunSign} solar emphasis.`,
            nakshatra: `${nakshatraName} Nakshatra is active through your ${natalRashi} lens, so smaller precise moves beat force today.`,
            mantra: mantraForDasha(currentDasha),
            remedy: {
                type: 'ritual',
                name: `${currentDasha} remedy`,
                description: remedyForDasha(currentDasha),
                source: 'Brihat Parashara Hora Shastra',
            },
            rashi: natalRashi,
        },
        chinese: {
            animal: `${chineseAnimal} energy does best today when you lean on ${(_5 = ANIMAL_STYLE[chineseAnimal]) !== null && _5 !== void 0 ? _5 : 'clean instinct and timing'} instead of pure reaction.`,
            element: `${seasonalElement} season is moving through your ${chineseElement} constitution, so cleaner pacing matters more than intensity. ${(_7 = (_6 = chart.chinese) === null || _6 === void 0 ? void 0 : _6.yinYang) !== null && _7 !== void 0 ? _7 : 'Yang'} expression in you works best when you ${dominantArea === 'wellness' ? 'slow down early' : dominantArea === 'love' ? 'make connection feel safe' : 'act only on the move that matters'}.`,
            luckyDirection: (_8 = DIRECTION_BY_ELEMENT[seasonalElement]) !== null && _8 !== void 0 ? _8 : 'East',
            luckyColor: (_11 = (_10 = (_9 = chart.chinese) === null || _9 === void 0 ? void 0 : _9.luckyColors) === null || _10 === void 0 ? void 0 : _10[0]) !== null && _11 !== void 0 ? _11 : 'Green',
        },
        kp: {
            eventTiming: `${kpLagna} lagna with ${kpSubLord} sub-lord sharpens timing around ${dominantArea === 'wellness' ? 'wellness' : dominantArea} matters today.`,
            significatorInsight: overallSignal
                ? `${formatSignal(overallSignal)} is activating house ${overallSignal.house || 1}, which is why timing feels more exact than usual.`
                : 'Current significators support exact choices over reactive ones.',
            sublordGuidance: `${kpSubLord} as sub-lord suggests ${subLordMeaning(kpSubLord)}.`,
        },
        unified: {
            cosmicVibe,
            affirmation: buildAffirmation(dominantArea, chart, currentDasha),
            shareText: `${cosmicVibe} | ${natalSunSign} + ${natalRashi} + ${chineseAnimal} | CosmicSelf`,
        },
        references: [
            { source: "Ptolemy's Tetrabiblos", type: 'book', tradition: 'western' },
            { source: 'Planets in Transit', type: 'book', tradition: 'western' },
            { source: 'Brihat Parashara Hora Shastra', type: 'scripture', tradition: 'vedic' },
            { source: 'The Handbook of Chinese Horoscopes', type: 'book', tradition: 'chinese' },
            { source: 'Krishnamurti Paddhati Reader', type: 'book', tradition: 'kp' },
        ],
        positivityScore,
    };
}
//# sourceMappingURL=dailyPrediction.js.map