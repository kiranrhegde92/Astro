"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.heuristicPredictionAdapter = void 0;
exports.runPredictionModel = runPredictionModel;
const AREA_LABELS = {
    career: 'work and direction',
    love: 'connection and closeness',
    wellness: 'pace and nervous-system care',
    wealth: 'resources and money decisions',
    education: 'learning and communication',
    travel: 'movement and wider perspective',
};
const WINDOW_WEIGHT = {
    today: 1,
    week: 0.9,
    month: 0.82,
    life: 0.74,
};
function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}
function roundRecord(record) {
    return Object.fromEntries(Object.entries(record).map(([key, value]) => [key, Number(value.toFixed(2))]));
}
exports.heuristicPredictionAdapter = {
    name: 'heuristic-scorer',
    version: '0.1.0',
    score: (features) => {
        var _a, _b, _c, _d;
        const windowWeight = WINDOW_WEIGHT[features.window];
        const scores = {
            career: 0.48,
            love: 0.48,
            wellness: 0.48,
            wealth: 0.48,
            education: 0.48,
            travel: 0.48,
        };
        for (const area of Object.keys(scores)) {
            const signal = (_a = features.areaSignals[area]) !== null && _a !== void 0 ? _a : 0;
            const tension = (_b = features.areaTension[area]) !== null && _b !== void 0 ? _b : 0;
            scores[area] += signal * 0.055 * windowWeight;
            scores[area] -= tension * 0.041 * windowWeight;
        }
        if (features.kpTopArea in scores) {
            scores[features.kpTopArea] += 0.09;
        }
        if (features.window === 'life') {
            const dashaBias = {
                Sun: 'career',
                Moon: 'wellness',
                Mars: 'career',
                Mercury: 'education',
                Jupiter: 'education',
                Venus: 'love',
                Saturn: 'wealth',
                Rahu: 'travel',
                Ketu: 'wellness',
            };
            const boostedArea = dashaBias[features.dashaPlanet];
            if (boostedArea)
                scores[boostedArea] += 0.14;
        }
        if (features.seasonalElementMatch) {
            scores.wellness += 0.05;
            scores.love += 0.03;
        }
        if (features.dashaDaysRemaining < 30) {
            scores.travel += 0.04;
            scores.career += 0.03;
        }
        const roundedScores = roundRecord(Object.fromEntries(Object.entries(scores).map(([area, value]) => [area, clamp(value, 0.05, 0.98)])));
        const topArea = ((_d = (_c = Object.entries(roundedScores).sort((a, b) => b[1] - a[1])[0]) === null || _c === void 0 ? void 0 : _c[0]) !== null && _d !== void 0 ? _d : 'career');
        const completeness = (features.confidenceInputs.westernPlanets >= 7 ? 0.18 : 0.1) +
            (features.confidenceInputs.kpPredictions > 0 ? 0.12 : 0.04) +
            (features.signalCount >= 3 ? 0.14 : 0.06);
        const confidence = clamp(0.44 + completeness + features.supportTotal * 0.018 - features.challengeTotal * 0.01, 0.35, 0.96);
        return {
            window: features.window,
            modelName: 'heuristic-scorer',
            modelVersion: '0.1.0',
            confidence: Number(confidence.toFixed(2)),
            topArea,
            scores: roundedScores,
            summary: `${AREA_LABELS[topArea]} is the area the model currently expects to resonate most for the ${features.window} window.`,
            supportingSignals: features.supportingSignals,
        };
    },
};
function runPredictionModel(features, adapter = exports.heuristicPredictionAdapter) {
    return adapter.score(features);
}
//# sourceMappingURL=modelScoring.js.map