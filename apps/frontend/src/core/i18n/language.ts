import { DEFAULT_LANGUAGE } from '@/config/constants';

export const LANGUAGES = ['en'] as const;

export type Language = (typeof LANGUAGES)[number];

export type LanguageParams = { lng: Language };

const FALLBACK_LANGUAGE: Language = 'en';

export const isLanguage = (value: string): value is Language => LANGUAGES.some((language) => language === value);

export const getSafeLng = (value: string): Language => {
  if (isLanguage(value)) {
    return value;
  }

  if (isLanguage(DEFAULT_LANGUAGE)) {
    return DEFAULT_LANGUAGE;
  }

  return FALLBACK_LANGUAGE;
};
