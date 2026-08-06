'use client';

import type { PropsWithChildren } from 'react';
import { I18nextProvider } from 'react-i18next';

import type { Translations } from './i18n';
import { getI18nConfig } from './i18n';
import type { Language } from './language';

type Props = PropsWithChildren<{
  lng: Language;
  translations: Translations;
}>;

export const TranslationsProvider = ({ lng, translations, children }: Props) => {
  const i18n = getI18nConfig(lng, translations);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};
