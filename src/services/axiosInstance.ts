import axios from 'axios';

import { env } from '@/constants/env';

// Single HTTP client for the whole app. All src/api/* modules import from here.
// Auth token and error interceptors are added here, nowhere else.
export const apiV1 = axios.create({
  baseURL: env.apiUrl,
  timeout: 15000,
  headers: { Accept: 'application/json' },
});

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

// Texts the server writes (catalogue, help, validation messages) come in this language.
let apiLanguage = 'en';

export const setApiLanguage = (language: string) => {
  apiLanguage = language;
};
export const getApiLanguage = () => apiLanguage;

apiV1.interceptors.request.use((config) => {
  config.headers['Accept-Language'] = apiLanguage;
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

// 401 with a token attached means the session is no longer valid (expired, signed out
// elsewhere). The session store registers what to do; the request still rejects.
let onUnauthorized: (() => void) | null = null;

export const setUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler;
};

apiV1.interceptors.response.use(undefined, (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 401 && authToken) {
    onUnauthorized?.();
  }
  return Promise.reject(error);
});
