import type MockAdapter from 'axios-mock-adapter';

import { db } from '../db';
import { ok } from '../utils';

export const catalogHandlers = (mock: MockAdapter) => {
  mock.onGet('/catalog/provider-types').reply(() => ok(db.providerTypes));
  mock.onGet('/catalog/services').reply(() => ok(db.serviceCategories));
};
