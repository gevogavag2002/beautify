import MockAdapter from 'axios-mock-adapter';

import { apiV1, getApiLanguage } from '@/services/axiosInstance';

import ruTexts from './data/ru.json';
import { registerHandlers } from './handlers';

const ru = ruTexts as Record<string, string>;

// A real backend answers in the Accept-Language of the request. The mock keeps its seeds in
// English and swaps whole strings through data/ru.json on the way out (a copy: the in-memory
// db is never touched). Strings without an entry (names, ids, statuses) pass through.
const localize = (value: unknown): unknown => {
  if (typeof value === 'string') return ru[value] ?? value;
  if (Array.isArray(value)) return value.map(localize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, localize(v)]),
    );
  }
  return value;
};
const isRu = () => getApiLanguage().startsWith('ru');

// Survives Fast Refresh: the module can be re-evaluated, the adapter must attach once.
const g = globalThis as { __beautifyMock?: MockAdapter };

export const enableMocks = () => {
  if (g.__beautifyMock) return;
  // delayResponse keeps loading states visible while developing.
  const mock = new MockAdapter(apiV1, { delayResponse: 300, onNoMatch: 'passthrough' });
  registerHandlers(mock);
  apiV1.interceptors.response.use(
    (response) => {
      if (isRu()) response.data = localize(response.data);
      return response;
    },
    (error: { response?: { data?: unknown } }) => {
      if (isRu() && error.response) error.response.data = localize(error.response.data);
      return Promise.reject(error);
    },
  );
  g.__beautifyMock = mock;
  console.log('[mocks] axios-mock-adapter enabled');
};
