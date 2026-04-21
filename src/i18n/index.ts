import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './en/common.json';
import hi from './hi/common.json';
import zh from './zh/common.json';
import kn from './kn/common.json';
import { normalizeLanguage, SUPPORTED_LANGUAGES } from './language';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  zh: { translation: zh },
  kn: { translation: kn },
};

const deviceLang = Localization.getLocales()[0]?.languageTag ?? Localization.getLocales()[0]?.languageCode ?? 'en';

i18n.use(initReactI18next).init({
  resources,
  lng: normalizeLanguage(deviceLang),
  fallbackLng: 'en',
  supportedLngs: [...SUPPORTED_LANGUAGES],
  nonExplicitSupportedLngs: true,
  cleanCode: true,
  load: 'languageOnly',
  interpolation: { escapeValue: false },
});

export default i18n;
