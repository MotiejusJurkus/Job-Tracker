'use client';

import { useSyncExternalStore } from 'react';

const MOBILE_BREAKPOINT = 768;
const MOBILE_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

const subscribe = (onChange: () => void) => {
  const query = window.matchMedia(MOBILE_QUERY);

  query.addEventListener('change', onChange);

  return () => query.removeEventListener('change', onChange);
};

const getSnapshot = () => window.matchMedia(MOBILE_QUERY).matches;

const getServerSnapshot = () => false;

export const useIsMobile = () => useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
