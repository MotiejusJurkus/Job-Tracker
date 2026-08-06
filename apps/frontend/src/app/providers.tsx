'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { ToastContainer } from 'react-toastify';

import type { Translations } from '@/core/i18n/i18n';
import type { Language } from '@/core/i18n/language';
import { TranslationsProvider } from '@/core/i18n/translations-provider';
import { getQueryClient } from '@/core/utils/get-query-client';

export const QueryProvider = ({ children }: PropsWithChildren) => {
  const queryClient = getQueryClient();

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

type Props = PropsWithChildren<{
  lng: Language;
  translations: Translations;
}>;

export const Providers = ({ lng, translations, children }: Props) => {
  return (
    <QueryProvider>
      <TranslationsProvider lng={lng} translations={translations}>
        {children}
        <ToastContainer position="bottom-right" />
      </TranslationsProvider>
    </QueryProvider>
  );
};
