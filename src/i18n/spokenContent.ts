import type { DailyReading } from '../types/astrology';
import type { PeriodForecast } from '../content/forecastTemplates';
import { getDateLocale, normalizeLanguage, type SupportedLanguage } from './language';

type Tone = 'Opening' | 'Mixed' | 'Pressurized';
type TransitItem = NonNullable<DailyReading['activeTransits']>[number];
type TransitPosition = NonNullable<DailyReading['transitPositions']>[number];
type SystemKey = 'western' | 'vedic' | 'chinese' | 'kp';
type FocusKey = 'career' | 'love' | 'wellness' | 'wealth' | 'education' | 'travel' | 'overall';

const TONE_LABELS: Record<SupportedLanguage, Record<Tone, string>> = {
  en: { Opening: 'Opening', Mixed: 'Mixed', Pressurized: 'Pressurized' },
  hi: { Opening: 'खुला हुआ', Mixed: 'मिला-जुला', Pressurized: 'थोड़ा दबाव वाला' },
  zh: { Opening: '顺一点', Mixed: '有起有伏', Pressurized: '压力偏高' },
  kn: { Opening: 'ತೆರೆದಿದೆ', Mixed: 'ಮಿಶ್ರವಾಗಿದೆ', Pressurized: 'ಸ್ವಲ್ಪ ಒತ್ತಡ ಇದೆ' },
};

const FOCUS_LABELS: Record<SupportedLanguage, Record<FocusKey, string>> = {
  en: {
    career: 'work',
    love: 'relationships',
    wellness: 'body and energy',
    wealth: 'money and resources',
    education: 'learning',
    travel: 'movement',
    overall: "today's main choice",
  },
  hi: {
    career: 'काम',
    love: 'रिश्तों',
    wellness: 'शरीर और ऊर्जा',
    wealth: 'पैसे और संसाधनों',
    education: 'सीखने',
    travel: 'यात्रा या मूवमेंट',
    overall: 'आज के मुख्य फैसले',
  },
  zh: {
    career: '工作',
    love: '关系',
    wellness: '身体和状态',
    wealth: '金钱和资源',
    education: '学习',
    travel: '出行和变化',
    overall: '今天最重要的选择',
  },
  kn: {
    career: 'ಕೆಲಸ',
    love: 'ಸಂಬಂಧಗಳು',
    wellness: 'ದೇಹ ಮತ್ತು ಶಕ್ತಿ',
    wealth: 'ಹಣ ಮತ್ತು ಸಂಪನ್ಮೂಲಗಳು',
    education: 'ಕಲಿಕೆ',
    travel: 'ಪ್ರಯಾಣ ಅಥವಾ ಚಲನೆ',
    overall: 'ಇಂದಿನ ಮುಖ್ಯ ಆಯ್ಕೆ',
  },
};

const FOCUS_ADVICE: Record<SupportedLanguage, Record<FocusKey, string>> = {
  en: {
    career: 'Choose the one work move that actually changes the day.',
    love: 'Say the honest thing gently instead of performing distance.',
    wellness: 'Lower the speed before the body has to ask louder.',
    wealth: 'Make the money choice from clarity, not from a passing mood.',
    education: 'Write the useful thought down while it is still fresh.',
    travel: 'Give movement more margin than you think it needs.',
    overall: 'Keep the next move small, clean, and fully owned.',
  },
  hi: {
    career: 'काम में वही एक कदम लें जो सच में दिन बदलता है।',
    love: 'दूरी दिखाने के बजाय बात साफ और नरमी से कहें।',
    wellness: 'शरीर को जोर से बोलना पड़े उससे पहले रफ्तार कम कर दें।',
    wealth: 'पैसे का फैसला मूड से नहीं, साफ समझ से लें।',
    education: 'काम की बात अभी लिख लें, बाद में दिन बिखर सकता है।',
    travel: 'चलने-फिरने या यात्रा में थोड़ा extra समय रखें।',
    overall: 'अगला कदम छोटा, साफ और आपका अपना होना चाहिए।',
  },
  zh: {
    career: '工作上先做那个真的会推进局面的动作。',
    love: '把真实的话说柔一点，不要用冷淡来保护自己。',
    wellness: '身体还没大声提醒前，就先把速度降下来。',
    wealth: '钱和资源的决定，先等心里清楚了再做。',
    education: '有用的想法趁新鲜先记下来。',
    travel: '出行和移动多留一点余地。',
    overall: '下一步小一点、清楚一点，也更像你自己。',
  },
  kn: {
    career: 'ಕೆಲಸದಲ್ಲಿ ದಿನವನ್ನು ನಿಜವಾಗಿ ಮುಂದಕ್ಕೆ ಕರೆದೊಯ್ಯುವ ಒಂದೇ ಹೆಜ್ಜೆ ಇಡಿ.',
    love: 'ದೂರವಾಗಿ ಕಾಣಿಸುವ ಬದಲು ಸತ್ಯವನ್ನು ಮೃದುವಾಗಿ ಹೇಳಿ.',
    wellness: 'ದೇಹ ಹೆಚ್ಚು ಜೋರಾಗಿ ಕೇಳುವ ಮುನ್ನವೇ ವೇಗವನ್ನು ಕಡಿಮೆ ಮಾಡಿ.',
    wealth: 'ಹಣದ ನಿರ್ಧಾರವನ್ನು ತಾತ್ಕಾಲಿಕ ಭಾವದಿಂದ ಅಲ್ಲ, ಸ್ಪಷ್ಟತೆಯಿಂದ ಮಾಡಿ.',
    education: 'ಬಂದ ಒಳ್ಳೆಯ ವಿಚಾರವನ್ನು ಈಗಲೇ ಬರೆಯಿರಿ.',
    travel: 'ಪ್ರಯಾಣ ಅಥವಾ ಚಲನೆಗೆ ಸ್ವಲ್ಪ ಹೆಚ್ಚುವರಿ ಜಾಗ ಬಿಡಿ.',
    overall: 'ಮುಂದಿನ ಹೆಜ್ಜೆ ಚಿಕ್ಕದು, ಸ್ಪಷ್ಟದು, ನಿಮ್ಮದೇ ಆಗಿರಲಿ.',
  },
};

const PLANET_LABELS: Record<SupportedLanguage, Record<string, string>> = {
  en: { Sun: 'Sun', Moon: 'Moon', Mercury: 'Mercury', Venus: 'Venus', Mars: 'Mars', Jupiter: 'Jupiter', Saturn: 'Saturn', NorthNode: 'Rahu', SouthNode: 'Ketu' },
  hi: { Sun: 'सूर्य', Moon: 'चंद्र', Mercury: 'बुध', Venus: 'शुक्र', Mars: 'मंगल', Jupiter: 'गुरु', Saturn: 'शनि', NorthNode: 'राहु', SouthNode: 'केतु' },
  zh: { Sun: '太阳', Moon: '月亮', Mercury: '水星', Venus: '金星', Mars: '火星', Jupiter: '木星', Saturn: '土星', NorthNode: '罗睺', SouthNode: '计都' },
  kn: { Sun: 'ಸೂರ್ಯ', Moon: 'ಚಂದ್ರ', Mercury: 'ಬುಧ', Venus: 'ಶುಕ್ರ', Mars: 'ಮಂಗಳ', Jupiter: 'ಗುರು', Saturn: 'ಶನಿ', NorthNode: 'ರಾಹು', SouthNode: 'ಕೇತು' },
};

const ASPECT_LABELS: Record<SupportedLanguage, Record<string, string>> = {
  en: { conjunction: 'Conjunction', trine: 'Trine', sextile: 'Sextile', square: 'Square', opposition: 'Opposition' },
  hi: { conjunction: 'युति', trine: 'त्रिकोण', sextile: 'सहज कोण', square: 'चौकोर कोण', opposition: 'विपरीत' },
  zh: { conjunction: '合相', trine: '三分相', sextile: '六分相', square: '四分相', opposition: '对冲' },
  kn: { conjunction: 'ಯುತಿ', trine: 'ತ್ರಿಕೋಣ', sextile: 'ಸಹಜ ಕೋನ', square: 'ಚೌಕ ಕೋನ', opposition: 'ವಿರೋಧ' },
};

const TODAY_UI = {
  en: {
    loadingTitle: 'Preparing your daily reading',
    loadingCopy: "Calibrating today's transits against your saved chart.",
    retry: 'Tap to retry',
    headerCopy: 'A clean daily brief built from live transits, dasha timing, and your natal chart.',
    tabs: { brief: 'Brief', proof: 'Proof', forecast: 'Forecast', systems: 'Systems' },
    heroBadge: 'DAILY BRIEF',
    aligned: (score: number) => `${score}% aligned`,
    tone: 'Tone',
    focus: 'Focus',
    liveSignals: 'Live signals',
    leanInto: 'LEAN INTO',
    watchFor: 'WATCH FOR',
    timingNote: 'TIMING NOTE',
    remedyPrefix: 'Remedy',
    openFull: 'Open full blended reading',
    shareReading: "Share today's reading",
    why: 'WHY THIS READING',
    mainDriver: 'Main driver',
    pressureLine: 'Pressure line',
    timingLayer: 'Timing layer',
    skyNow: 'SKY NOW',
    skyIntro: 'The fastest check on the current atmosphere.',
    bySystem: 'By system',
    bySystemCopy: 'Open the lens that best matches the decision you need to make today.',
    blindSpot: 'Blind spot',
    defaultSupport: 'your strongest transit',
    defaultTension: 'a sharper edge in the sky',
  },
  hi: {
    loadingTitle: 'आज की रीडिंग तैयार हो रही है',
    loadingCopy: 'आपकी कुंडली के साथ आज के गोचर मिलाए जा रहे हैं।',
    retry: 'फिर कोशिश करें',
    headerCopy: 'आज की बात सीधे शब्दों में: लाइव गोचर, दशा टाइमिंग और आपकी जन्म कुंडली से।',
    tabs: { brief: 'संक्षेप', proof: 'कारण', forecast: 'आगे', systems: 'पद्धतियां' },
    heroBadge: 'आज की बात',
    aligned: (score: number) => `${score}% तालमेल`,
    tone: 'माहौल',
    focus: 'ध्यान',
    liveSignals: 'संकेत',
    leanInto: 'इस तरफ जाएं',
    watchFor: 'ध्यान रखें',
    timingNote: 'समय की बात',
    remedyPrefix: 'छोटा उपाय',
    openFull: 'पूरी मिली-जुली रीडिंग खोलें',
    shareReading: 'आज की रीडिंग शेयर करें',
    why: 'यह रीडिंग क्यों',
    mainDriver: 'मुख्य सहारा',
    pressureLine: 'दबाव वाली जगह',
    timingLayer: 'टाइमिंग',
    skyNow: 'अभी का आसमान',
    skyIntro: 'आज के माहौल का सबसे जल्दी समझ आने वाला संकेत।',
    bySystem: 'पद्धति के हिसाब से',
    bySystemCopy: 'जिस फैसले पर आप हैं, उसके हिसाब से सही lens खोलें।',
    blindSpot: 'छूटी हुई बात',
    defaultSupport: 'आज का मजबूत सहारा',
    defaultTension: 'आसमान की थोड़ी तेज धार',
  },
  zh: {
    loadingTitle: '正在准备今天的解读',
    loadingCopy: '正在把今天的行运和你的本命盘对齐。',
    retry: '再试一次',
    headerCopy: '今天先说人话：行运、Dasha 时间和你的本命盘一起看。',
    tabs: { brief: '简读', proof: '原因', forecast: '展望', systems: '系统' },
    heroBadge: '今日简读',
    aligned: (score: number) => `${score}% 顺势`,
    tone: '气氛',
    focus: '重点',
    liveSignals: '信号',
    leanInto: '可以靠近',
    watchFor: '留意一下',
    timingNote: '时间提示',
    remedyPrefix: '小调整',
    openFull: '打开完整综合解读',
    shareReading: '分享今天的解读',
    why: '为什么这样解读',
    mainDriver: '主要助力',
    pressureLine: '压力点',
    timingLayer: '时间层',
    skyNow: '此刻星空',
    skyIntro: '快速看一下现在的整体气氛。',
    bySystem: '按系统看',
    bySystemCopy: '按你今天要做的决定，打开最合适的视角。',
    blindSpot: '盲点',
    defaultSupport: '今天比较顺的星象',
    defaultTension: '天空里比较紧的地方',
  },
  kn: {
    loadingTitle: 'ಇಂದಿನ ಓದು ಸಿದ್ಧವಾಗುತ್ತಿದೆ',
    loadingCopy: 'ಇಂದಿನ ಗ್ರಹ ಸಂಚಾರಗಳನ್ನು ನಿಮ್ಮ ಉಳಿಸಿದ ಚಾರ್ಟ್ ಜೊತೆ ಹೊಂದಿಸಲಾಗುತ್ತಿದೆ.',
    retry: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
    headerCopy: 'ಇಂದಿನ ಮಾತು ಸರಳವಾಗಿ: ಲೈವ್ ಸಂಚಾರ, ದಶಾ ಸಮಯ ಮತ್ತು ನಿಮ್ಮ ಜನ್ಮ ಚಾರ್ಟ್ ಜೊತೆ.',
    tabs: { brief: 'ಸಂಕ್ಷಿಪ್ತ', proof: 'ಕಾರಣ', forecast: 'ಮುಂದೆ', systems: 'ಪದ್ಧತಿಗಳು' },
    heroBadge: 'ಇಂದಿನ ಮಾತು',
    aligned: (score: number) => `${score}% ಹೊಂದಿಕೆ`,
    tone: 'ಮಾಹೋಲ',
    focus: 'ಗಮನ',
    liveSignals: 'ಸಂಕೇತಗಳು',
    leanInto: 'ಇದಕ್ಕೆ ಹೋಗಿ',
    watchFor: 'ಗಮನಿಸಿ',
    timingNote: 'ಸಮಯದ ಸೂಚನೆ',
    remedyPrefix: 'ಚಿಕ್ಕ ಪರಿಹಾರ',
    openFull: 'ಪೂರ್ಣ ಮಿಶ್ರಿತ ಓದು ತೆರೆಯಿರಿ',
    shareReading: 'ಇಂದಿನ ಓದು ಹಂಚಿಕೊಳ್ಳಿ',
    why: 'ಈ ಓದು ಯಾಕೆ',
    mainDriver: 'ಮುಖ್ಯ ಬೆಂಬಲ',
    pressureLine: 'ಒತ್ತಡದ ಜಾಗ',
    timingLayer: 'ಸಮಯದ ಪದರ',
    skyNow: 'ಈಗದ ಆಕಾಶ',
    skyIntro: 'ಇಂದಿನ ವಾತಾವರಣವನ್ನು ಬೇಗ ಅರ್ಥ ಮಾಡಿಕೊಳ್ಳುವ ಸೂಚನೆ.',
    bySystem: 'ಪದ್ಧತಿಯಂತೆ',
    bySystemCopy: 'ಇಂದು ಬೇಕಾದ ನಿರ್ಧಾರಕ್ಕೆ ಸರಿಯಾದ ದೃಷ್ಟಿಕೋನ ತೆರೆಯಿರಿ.',
    blindSpot: 'ಕಾಣದೆ ಹೋಗುವ ವಿಷಯ',
    defaultSupport: 'ಇಂದಿನ ಬಲವಾದ ಬೆಂಬಲ',
    defaultTension: 'ಆಕಾಶದ ಸ್ವಲ್ಪ ತೀಕ್ಷ್ಣ ಭಾಗ',
  },
};

function focusKey(value?: string): FocusKey {
  const key = value?.toLowerCase() ?? '';
  if (/love|relationship|partner|friend|family/.test(key)) return 'love';
  if (/well|health|body|energy/.test(key)) return 'wellness';
  if (/wealth|money|resource|finance/.test(key)) return 'wealth';
  if (/learn|education|study|write/.test(key)) return 'education';
  if (/travel|move|movement/.test(key)) return 'travel';
  if (/career|work|purpose|leadership/.test(key)) return 'career';
  return 'overall';
}

function clean(text?: string, maxLength = 150) {
  const normalized = (text ?? '').replace(/\s+/g, ' ').trim();
  if (!normalized) return '';
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

function titleCase(value?: string) {
  if (!value) return '';
  return value
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function planet(value: string | undefined, language: SupportedLanguage) {
  if (!value) return '';
  return PLANET_LABELS[language][value] ?? PLANET_LABELS.en[value] ?? titleCase(value);
}

export function getGreetingLabel(date: Date, language?: string | null) {
  const lang = normalizeLanguage(language);
  const hour = date.getHours();
  const part = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
  const labels = {
    en: { morning: 'Good morning', afternoon: 'Good afternoon', evening: 'Good evening' },
    hi: { morning: 'सुप्रभात', afternoon: 'नमस्ते', evening: 'शुभ संध्या' },
    zh: { morning: '早上好', afternoon: '下午好', evening: '晚上好' },
    kn: { morning: 'ಶುಭೋದಯ', afternoon: 'ನಮಸ್ಕಾರ', evening: 'ಶುಭ ಸಂಜೆ' },
  } satisfies Record<SupportedLanguage, Record<'morning' | 'afternoon' | 'evening', string>>;
  return labels[lang][part];
}

export function formatTransitTitle(transit: TransitItem, language?: string | null) {
  const lang = normalizeLanguage(language);
  const aspect = ASPECT_LABELS[lang][transit.aspect] ?? ASPECT_LABELS.en[transit.aspect] ?? titleCase(transit.aspect);
  if (lang === 'zh') return `${planet(transit.transitPlanet, lang)}${aspect}${planet(transit.natalPlanet, lang)}`;
  return `${planet(transit.transitPlanet, lang)} ${aspect} ${planet(transit.natalPlanet, lang)}`;
}

export function formatSkyChip(position: TransitPosition, language?: string | null) {
  const lang = normalizeLanguage(language);
  const degree = Number.isFinite(position.degree) ? position.degree.toFixed(1) : '0.0';
  const retrograde = position.retrograde ? (lang === 'zh' ? ' 逆行' : ' R') : '';
  if (lang === 'zh') return `${planet(position.planet, lang)}在${position.sign} ${degree}${retrograde}`;
  if (lang === 'hi') return `${planet(position.planet, lang)} ${position.sign} में ${degree}${retrograde}`;
  if (lang === 'kn') return `${planet(position.planet, lang)} ${position.sign}ನಲ್ಲಿ ${degree}${retrograde}`;
  return `${planet(position.planet, lang)} in ${position.sign} ${degree}${retrograde}`;
}

export function formatSignature(value: string | undefined, kind: 'sun' | 'rashi' | 'year', language?: string | null) {
  if (!value) return '';
  const lang = normalizeLanguage(language);
  const suffix = {
    en: { sun: 'Sun', rashi: 'Rashi', year: 'Year' },
    hi: { sun: 'सूर्य', rashi: 'राशि', year: 'वर्ष' },
    zh: { sun: '太阳', rashi: 'Rashi', year: '年' },
    kn: { sun: 'ಸೂರ್ಯ', rashi: 'ರಾಶಿ', year: 'ವರ್ಷ' },
  } satisfies Record<SupportedLanguage, Record<'sun' | 'rashi' | 'year', string>>;
  return lang === 'zh' ? `${value}${suffix[lang][kind]}` : `${value} ${suffix[lang][kind]}`;
}

export function getTodayShellCopy(language?: string | null) {
  const lang = normalizeLanguage(language);
  return { ...TODAY_UI[lang], dateLocale: getDateLocale(lang) };
}

export function getSpokenTodayCopy({
  language,
  reading,
  firstName,
  tone,
  focusArea,
  alignmentScore,
  transitsCount,
  topSupport,
  topTension,
  timingFallback,
}: {
  language?: string | null;
  reading: DailyReading;
  firstName: string;
  tone: Tone;
  focusArea?: string;
  alignmentScore: number;
  transitsCount: number;
  topSupport?: TransitItem;
  topTension?: TransitItem;
  timingFallback?: string;
}) {
  const lang = normalizeLanguage(language);
  const ui = TODAY_UI[lang];
  const focus = FOCUS_LABELS[lang][focusKey(focusArea)];
  const advice = FOCUS_ADVICE[lang][focusKey(focusArea)];
  const toneLabel = TONE_LABELS[lang][tone];
  const supportTitle = topSupport ? formatTransitTitle(topSupport, lang) : ui.defaultSupport;
  const tensionTitle = topTension ? formatTransitTitle(topTension, lang) : ui.defaultTension;
  const english = lang === 'en';

  const localized = {
    en: {
      headline: reading.unified.headline ?? `Today wants a cleaner move around ${focus}.`,
      heroBody: clean(reading.unified.cosmicVibe, 210) || `${supportTitle} gives you usable momentum. Keep the day practical and human-sized.`,
      evidenceLine: clean(reading.unified.evidenceLine ?? reading.western?.overall, 180) || `${supportTitle} is carrying the main signal today.`,
      bestUse: clean(reading.unified.bestUse ?? reading.unified.focusAdvice, 116) || advice,
      watchFor: clean(reading.unified.watchFor ?? topTension?.brief ?? reading.western?.wellness, 124) || `Do not let ${tensionTitle} rush your response.`,
      timingNote: clean(reading.unified.timingNote ?? timingFallback, 130) || 'Use the cleanest part of the day for one exact decision.',
      remedyText: clean(reading.vedic?.remedy?.description, 108),
      proofLead: reading.unified.evidenceLine ?? `${supportTitle} is the main live signal in the chart today.`,
    },
    hi: {
      headline: `आज ${focus} में थोड़ा ठहरकर साफ कदम उठाना बेहतर रहेगा।`,
      heroBody: `${supportTitle} मदद दे रहा है, इसलिए बड़ा ड्रामा नहीं चाहिए। ${firstName}, ${focus} में एक छोटा, साफ कदम काफी है।`,
      evidenceLine: `${supportTitle} आज का मुख्य सहारा है। ${topTension ? `${tensionTitle} जल्दबाजी बढ़ा सकता है।` : 'बस रफ्तार को थोड़ा संभालकर रखें।'}`,
      bestUse: advice,
      watchFor: topTension ? `${tensionTitle} की वजह से बात जल्दी personal लग सकती है। जवाब देने से पहले एक सांस लें।` : 'बिना जरूरत हर बात को जल्दी खत्म करने की कोशिश न करें।',
      timingNote: 'जहां फैसला जरूरी है, उसे छोटे हिस्से में तोड़कर अभी का अगला सही कदम लें।',
      remedyText: 'दो मिनट शांत बैठें, पानी पिएं, और फिर अगला जवाब दें।',
      proofLead: `${supportTitle} और ${transitsCount} लाइव संकेत मिलकर आज की दिशा बना रहे हैं।`,
    },
    zh: {
      headline: `今天在${focus}上，慢一点、想清楚再动会更顺。`,
      heroBody: `${supportTitle}在帮你打开一点空间，所以不用把事情做得很重。${firstName}，先做一个清楚的小动作就好。`,
      evidenceLine: `${supportTitle}是今天的主线。${topTension ? `${tensionTitle}会让反应变快，先别急。` : '节奏放稳，事情会更好处理。'}`,
      bestUse: advice,
      watchFor: topTension ? `${tensionTitle}容易让你太快下判断。先停一下，再回复。` : '别为了快一点，就把真正想说的话吞回去。',
      timingNote: '重要决定先缩小范围，今天只处理最清楚的下一步。',
      remedyText: '先喝点水，安静两分钟，再回到那件事上。',
      proofLead: `${supportTitle}加上 ${transitsCount} 个实时信号，正在塑造今天的重点。`,
    },
    kn: {
      headline: `ಇಂದು ${focus} ವಿಷಯದಲ್ಲಿ ಸ್ವಲ್ಪ ನಿಧಾನವಾಗಿ, ಸ್ಪಷ್ಟವಾಗಿ ಹೆಜ್ಜೆ ಇಡಿ.`,
      heroBody: `${supportTitle} ನಿಮಗೆ ಬೆಂಬಲ ಕೊಡುತ್ತಿದೆ. ${firstName}, ದೊಡ್ಡ ತಿರುವು ಬೇಡ; ${focus} ವಿಷಯದಲ್ಲಿ ಒಂದು ಚಿಕ್ಕ ಸ್ಪಷ್ಟ ಹೆಜ್ಜೆ ಸಾಕು.`,
      evidenceLine: `${supportTitle} ಇಂದಿನ ಮುಖ್ಯ ಸೂಚನೆ. ${topTension ? `${tensionTitle} ಬೇಗ ಪ್ರತಿಕ್ರಿಯೆ ಬರಿಸಬಹುದು.` : 'ವೇಗವನ್ನು ಸ್ವಲ್ಪ ಸಮತೋಲನದಲ್ಲಿಡಿ.'}`,
      bestUse: advice,
      watchFor: topTension ? `${tensionTitle} ಕಾರಣದಿಂದ ವಿಷಯ ಬೇಗ personal ಆಗಿ ತೋರುತ್ತದೆ. ಉತ್ತರಿಸುವ ಮೊದಲು ಒಂದು ಉಸಿರು ತೆಗೆದುಕೊಳ್ಳಿ.` : 'ಎಲ್ಲವನ್ನೂ ಬೇಗ ಮುಗಿಸಬೇಕೆಂಬ ಒತ್ತಡಕ್ಕೆ ಹೋಗಬೇಡಿ.',
      timingNote: 'ಮುಖ್ಯ ನಿರ್ಧಾರವನ್ನು ಚಿಕ್ಕ ಭಾಗಕ್ಕೆ ಒಡೆದು, ಈಗಿನ ಸರಿಯಾದ ಮುಂದಿನ ಹೆಜ್ಜೆ ತೆಗೆದುಕೊಳ್ಳಿ.',
      remedyText: 'ಎರಡು ನಿಮಿಷ ಶಾಂತವಾಗಿ ಕುಳಿತು, ನೀರು ಕುಡಿದು, ನಂತರ ಮುಂದಿನ ಉತ್ತರ ನೀಡಿ.',
      proofLead: `${supportTitle} ಮತ್ತು ${transitsCount} ಲೈವ್ ಸಂಕೇತಗಳು ಇಂದಿನ ದಿಕ್ಕನ್ನು ರೂಪಿಸುತ್ತಿವೆ.`,
    },
  }[lang];

  return {
    ...ui,
    dateLocale: getDateLocale(lang),
    focusArea: focus,
    toneLabel,
    alignedText: ui.aligned(alignmentScore),
    watchForTitle: tone === 'Pressurized' ? ui.pressureLine : ui.blindSpot,
    supportTitle,
    tensionTitle,
    headline: localized.headline,
    heroBody: localized.heroBody,
    evidenceLine: localized.evidenceLine,
    bestUse: localized.bestUse,
    watchForText: localized.watchFor,
    timingNoteText: localized.timingNote,
    remedyText: localized.remedyText,
    proofLead: localized.proofLead,
    mainDriverText: topSupport
      ? `${supportTitle}. ${english ? clean(topSupport.brief, 96) : localized.bestUse}`
      : localized.evidenceLine,
    pressureText: topTension
      ? `${tensionTitle}. ${english ? clean(topTension.brief, 96) : localized.watchFor}`
      : localized.watchFor,
  };
}

export function getSystemPreviewCopy(system: SystemKey, language?: string | null, fallback?: string) {
  const lang = normalizeLanguage(language);
  if (lang === 'en') return fallback ?? '';

  const copy: Record<Exclude<SupportedLanguage, 'en'>, Record<SystemKey, string>> = {
    hi: {
      western: 'पश्चिमी lens आज की मन:स्थिति और चुनावों को साफ करता है।',
      vedic: 'वैदिक lens समय, दशा और भीतर की लय को पकड़ता है।',
      chinese: 'चीनी lens बताता है कि लंबी rhythm आज कैसे काम आ रही है।',
      kp: 'KP lens छोटे और सटीक फैसलों पर ध्यान दिलाता है।',
    },
    zh: {
      western: '西方视角帮你看清今天的心理状态和选择。',
      vedic: '吠陀视角更关心时间、Dasha 和内在节奏。',
      chinese: '中国系统看的是更长的气质节奏今天怎么落地。',
      kp: 'KP 视角提醒你把动作做小、做准。',
    },
    kn: {
      western: 'ಪಾಶ್ಚಾತ್ಯ ದೃಷ್ಟಿ ಇಂದಿನ ಮನಸ್ಥಿತಿ ಮತ್ತು ಆಯ್ಕೆಗಳನ್ನು ಸ್ಪಷ್ಟಪಡಿಸುತ್ತದೆ.',
      vedic: 'ವೇದಿಕ ದೃಷ್ಟಿ ಸಮಯ, ದಶಾ ಮತ್ತು ಒಳಗಿನ ಲಯವನ್ನು ಹಿಡಿಯುತ್ತದೆ.',
      chinese: 'ಚೀನೀ ದೃಷ್ಟಿ ದೀರ್ಘ rhythm ಇಂದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ ಎಂದು ಹೇಳುತ್ತದೆ.',
      kp: 'KP ದೃಷ್ಟಿ ಚಿಕ್ಕ, ನಿಖರ ನಿರ್ಧಾರಗಳ ಕಡೆ ಗಮನ ಕೊಡಿಸುತ್ತದೆ.',
    },
  };

  return copy[lang][system];
}

export function getSpokenForecastCopy(forecast: PeriodForecast, language?: string | null) {
  const lang = normalizeLanguage(language);
  const isWeek = forecast.window === 'week';

  if (lang === 'en') {
    return {
      outlookLabel: 'Outlook',
      weekLabel: '7 days',
      monthLabel: '30 days',
      title: forecast.title,
      headline: forecast.headline,
      summary: forecast.summary,
      driverLabel: 'Signals behind this',
      drivers: forecast.drivers ?? [],
      focusAreas: forecast.focusAreas,
      openWindowLabel: 'Open window',
      carefulWindowLabel: 'Move carefully',
      brightWindow: forecast.brightWindow,
      cautionWindow: forecast.cautionWindow,
      prompt: forecast.ritualPrompt,
    };
  }

  const copy = {
    hi: {
      outlookLabel: 'आगे का हाल',
      weekLabel: '7 दिन',
      monthLabel: '30 दिन',
      title: isWeek ? 'अगले 7 दिन' : 'अगले 30 दिन',
      headline: isWeek ? 'इस हफ्ते छोटे, साफ कदम ज्यादा काम आएंगे।' : 'इस महीने रफ्तार से ज्यादा consistency काम आएगी।',
      summary: 'जहां रास्ता खुला लगे, वहां action लें। जहां शरीर या मन tight लगे, वहां बात को धीमा करें।',
      driverLabel: 'किस बात पर ध्यान है',
      drivers: ['गोचर', 'दशा', 'आपकी कुंडली'],
      focusAreas: [
        { label: 'पश्चिमी', text: 'मूड और choices को बहुत जल्दी final मत मानें।' },
        { label: 'वैदिक', text: 'समय की rhythm देखकर अगला कदम लें।' },
        { label: 'चीनी', text: 'अपनी natural गति के साथ काम करें, उसके खिलाफ नहीं।' },
        { label: 'KP', text: 'बड़ी बात को छोटे, exact action में बदलें।' },
      ],
      openWindowLabel: 'खुला समय',
      carefulWindowLabel: 'धीरे चलें',
      prompt: 'आज एक काम कम करें, पर उसे ठीक से करें।',
    },
    zh: {
      outlookLabel: '接下来',
      weekLabel: '7 天',
      monthLabel: '30 天',
      title: isWeek ? '接下来 7 天' : '接下来 30 天',
      headline: isWeek ? '这周适合小一点、清楚一点地推进。' : '这个月重点不是冲很快，而是稳稳重复对的动作。',
      summary: '顺的时候就做下一步；紧的时候先慢下来，不要急着证明什么。',
      driverLabel: '主要信号',
      drivers: ['行运', 'Dasha', '本命盘'],
      focusAreas: [
        { label: '西方', text: '先看清你的感受和选择，不要太快定论。' },
        { label: '吠陀', text: '按时间节奏来，动作会更省力。' },
        { label: '中国', text: '顺着自己的长期节奏走，不要硬拧。' },
        { label: 'KP', text: '把大问题变成一个很具体的小动作。' },
      ],
      openWindowLabel: '较顺窗口',
      carefulWindowLabel: '放慢一点',
      prompt: '今天少做一件事，但把那件事做好。',
    },
    kn: {
      outlookLabel: 'ಮುಂದಿನ ಲಯ',
      weekLabel: '7 ದಿನ',
      monthLabel: '30 ದಿನ',
      title: isWeek ? 'ಮುಂದಿನ 7 ದಿನ' : 'ಮುಂದಿನ 30 ದಿನ',
      headline: isWeek ? 'ಈ ವಾರ ಚಿಕ್ಕ, ಸ್ಪಷ್ಟ ಹೆಜ್ಜೆಗಳು ಹೆಚ್ಚು ಉಪಯೋಗಕ್ಕೆ ಬರುತ್ತವೆ.' : 'ಈ ತಿಂಗಳು ವೇಗಕ್ಕಿಂತ consistency ಹೆಚ್ಚು ಸಹಾಯ ಮಾಡುತ್ತದೆ.',
      summary: 'ದಾರಿ ತೆರೆಯುತ್ತಿದೆ ಅನ್ನಿಸಿದಾಗ action ತೆಗೆದುಕೊಳ್ಳಿ. tight ಅನ್ನಿಸಿದಾಗ ವಿಷಯವನ್ನು ನಿಧಾನ ಮಾಡಿ.',
      driverLabel: 'ಮುಖ್ಯ ಸೂಚನೆಗಳು',
      drivers: ['ಸಂಚಾರ', 'ದಶಾ', 'ಜನ್ಮ ಚಾರ್ಟ್'],
      focusAreas: [
        { label: 'ಪಾಶ್ಚಾತ್ಯ', text: 'ಮೂಡ್ ಮತ್ತು choices ಅನ್ನು ಬೇಗ final ಮಾಡಬೇಡಿ.' },
        { label: 'ವೇದಿಕ', text: 'ಸಮಯದ rhythm ನೋಡಿ ಮುಂದಿನ ಹೆಜ್ಜೆ ಇಡಿ.' },
        { label: 'ಚೀನೀ', text: 'ನಿಮ್ಮ natural ಗತಿಯ ಜೊತೆ ಕೆಲಸ ಮಾಡಿ, ಅದರ ವಿರುದ್ಧ ಅಲ್ಲ.' },
        { label: 'KP', text: 'ದೊಡ್ಡ ವಿಷಯವನ್ನು ಚಿಕ್ಕ, exact action ಆಗಿ ಬದಲಿಸಿ.' },
      ],
      openWindowLabel: 'ತೆರೆದ ಸಮಯ',
      carefulWindowLabel: 'ನಿಧಾನವಾಗಿ',
      prompt: 'ಇಂದು ಒಂದು ಕೆಲಸ ಕಡಿಮೆ ಮಾಡಿ, ಆದರೆ ಅದನ್ನು ಚೆನ್ನಾಗಿ ಮಾಡಿ.',
    },
  }[lang];

  return {
    ...copy,
    brightWindow: forecast.brightWindow,
    cautionWindow: forecast.cautionWindow,
  };
}
