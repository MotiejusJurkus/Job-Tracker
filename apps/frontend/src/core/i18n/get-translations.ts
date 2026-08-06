import type { Translations } from './i18n';
import { getSafeLng } from './language';
import { en } from './locales/en';

const RESOURCES = { en } satisfies Record<string, Translations>;

export const getTranslations = (lng: string): Translations => {
  const safeLng = getSafeLng(lng);

  return RESOURCES[safeLng];
};
