export const SUPPORTED_LANGUAGES = ['en', 'hi', 'zh', 'kn'] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_OPTIONS: Array<{
  code: SupportedLanguage;
  englishName: string;
  nativeName: string;
}> = [
  { code: 'en', englishName: 'English', nativeName: 'English' },
  { code: 'hi', englishName: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'zh', englishName: 'Chinese', nativeName: '中文' },
  { code: 'kn', englishName: 'Kannada', nativeName: 'ಕನ್ನಡ' },
];

export const DATE_LOCALES: Record<SupportedLanguage, string> = {
  en: 'en-US',
  hi: 'hi-IN',
  zh: 'zh-CN',
  kn: 'kn-IN',
};

export function normalizeLanguage(code?: string | null): SupportedLanguage {
  const base = code?.toLowerCase().split(/[-_]/)[0];

  if (base === 'zh' || base === 'cmn' || base === 'yue') {
    return 'zh';
  }

  return SUPPORTED_LANGUAGES.includes(base as SupportedLanguage)
    ? (base as SupportedLanguage)
    : 'en';
}

export function getDateLocale(language?: string | null) {
  return DATE_LOCALES[normalizeLanguage(language)];
}
