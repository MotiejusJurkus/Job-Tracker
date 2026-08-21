'use client';

import type { PropsWithChildren } from 'react';

import { ModalProvider } from '@/core/context/ModalProvider';
import type { Translations } from '@/core/i18n/i18n';
import type { Language } from '@/core/i18n/language';
import { TranslationsProvider } from '@/core/i18n/translations-provider';

type Props = PropsWithChildren<{
  lng: Language;
  translations: Translations;
}>;

export const Providers = ({ lng, translations, children }: Props) => {
  return (
    <TranslationsProvider lng={lng} translations={translations}>
      <ModalProvider>{children}</ModalProvider>
    </TranslationsProvider>
  );
};
