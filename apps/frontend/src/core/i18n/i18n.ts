import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { DEFAULT_LANGUAGE } from '@/config/constants';

import { LANGUAGES, type Language } from './language';

export type Translations = Record<string, string>;

export const I18N_NAMESPACE = 'translation';

export const getI18nConfig = (lng: Language, translations: Translations) => {
  if (!i18n.isInitialized) {
    void i18n.use(initReactI18next).init({
      lng,
      fallbackLng: DEFAULT_LANGUAGE,
      supportedLngs: LANGUAGES,
      defaultNS: I18N_NAMESPACE,
      resources: { [lng]: { [I18N_NAMESPACE]: translations } },
      interpolation: { escapeValue: false },
    });

    return i18n;
  }

  i18n.addResourceBundle(lng, I18N_NAMESPACE, translations, true, true);

  if (i18n.language !== lng) {
    void i18n.changeLanguage(lng);
  }

  return i18n;
};
