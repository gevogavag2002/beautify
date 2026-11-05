import MockAdapter from 'axios-mock-adapter';

import { apiV1 } from '@/services/axiosInstance';

import { registerHandlers } from './handlers';

// Survives Fast Refresh: the module can be re-evaluated, the adapter must attach once.
const g = globalThis as { __beautifyMock?: MockAdapter };

export const enableMocks = () => {
  if (g.__beautifyMock) return;
  // delayResponse keeps loading states visible while developing.
  const mock = new MockAdapter(apiV1, { delayResponse: 300, onNoMatch: 'passthrough' });
  registerHandlers(mock);
  g.__beautifyMock = mock;
  console.log('[mocks] axios-mock-adapter enabled');
};
