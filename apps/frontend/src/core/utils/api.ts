import axios, { isAxiosError } from 'axios';

import { getSafeLng } from '@/core/i18n/language';

const redirectToLogin = () => {
  if (typeof window === 'undefined') {
    return;
  }

  const lng = getSafeLng(window.location.pathname.split('/').at(1) ?? '');

  window.location.replace(`/${lng}/login`);
};

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

export const publicApi = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (isAxiosError(error) && error.response?.status === 401) {
      redirectToLogin();
    }

    return Promise.reject(error instanceof Error ? error : new Error('Request failed'));
  },
);
