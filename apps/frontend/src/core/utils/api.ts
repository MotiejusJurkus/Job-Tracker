import axios from 'axios';

import EnvConfig from '@/config/env';

/**
 * Authenticated client for this app's own API. Attach the auth token and any
 * per-request headers in the request interceptor below.
 */
export const api = axios.create({
  baseURL: EnvConfig.API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

/** Public client for endpoints that don't require authentication. */
export const publicApi = axios.create({
  baseURL: EnvConfig.API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  // e.g. const token = getToken();
  // if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    // e.g. handle 401 refresh / global error reporting here.
    return Promise.reject(error instanceof Error ? error : new Error('Request failed'));
  },
);
