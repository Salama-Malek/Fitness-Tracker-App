import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './en.json';
import ar from './ar.json';
import ru from './ru.json';

const resources = {
  en: { translation: en },
  ar: { translation: ar },
  ru: { translation: ru },
};

const supportedLanguages = Object.keys(resources);
const locales = Localization.getLocales();
const primaryLocale = locales[0]?.languageCode ?? 'en';
const fallbackLng = supportedLanguages.includes(primaryLocale) ? primaryLocale : 'en';

i18n.use(initReactI18next).init({
  resources,
  lng: fallbackLng,
  fallbackLng: 'en',
  defaultNS: 'translation',
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v3',
});

export type SupportedLanguage = keyof typeof resources;

export default i18n;
