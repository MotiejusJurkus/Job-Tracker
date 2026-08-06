'use client';

import { useParams } from 'next/navigation';

import { getSafeLng, type Language } from '@/core/i18n/language';

export const useLanguage = (): Language => {
  const params = useParams<{ lng: string }>();

  return getSafeLng(params.lng);
};
