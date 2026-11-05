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

apiV1.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});
