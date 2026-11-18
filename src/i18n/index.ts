import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { env } from '@/constants/env';
import en from '@/locales/en.json';
import ru from '@/locales/ru.json';
import { setApiLanguage } from '@/services/axiosInstance';
import { setDateLocale } from '@/utils/format';

import { ensurePluralRules } from './pluralRules';

export const LANGUAGES = ['en', 'ru'] as const;
export type Language = (typeof LANGUAGES)[number];

const isLanguage = (value: string | undefined): value is Language =>
  LANGUAGES.includes(value as Language);

// First launch: EXPO_PUBLIC_DEFAULT_LANG if set (handy while testing), else the phone's
// language when the app has it, else English. The choice made in Profile lives in memory
// until storage is added (docs/BACKLOG.md).
const initialLanguage = (): Language => {
  if (isLanguage(env.defaultLang)) return env.defaultLang;
  try {
    const device = Intl.DateTimeFormat().resolvedOptions().locale.split('-')[0];
    if (isLanguage(device)) return device;
  } catch {
    // No Intl locale available: fall through to English.
  }
  return 'en';
};

// Everything that depends on the language but lives outside React follows it from here:
// the Accept-Language header (server texts) and date formatting.
const apply = (lng: string) => {
  setApiLanguage(lng);
  setDateLocale(lng);
};

ensurePluralRules();
const lng = initialLanguage();
apply(lng);
i18n.on('languageChanged', apply);

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ru: { translation: ru } },
  lng,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
