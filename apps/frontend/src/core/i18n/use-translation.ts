'use client';

import { useTranslation as useReactI18nextTranslation } from 'react-i18next';

import { I18N_NAMESPACE } from './i18n';

export const useTranslation = () => useReactI18nextTranslation(I18N_NAMESPACE);
