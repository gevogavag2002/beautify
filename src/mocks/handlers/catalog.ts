import type MockAdapter from 'axios-mock-adapter';

import { db } from '../db';
import { ok, params, validation } from '../utils';

export const catalogHandlers = (mock: MockAdapter) => {
  mock.onGet('/catalog/provider-types').reply(() => ok(db.providerTypes));
  mock.onGet('/catalog/services').reply((config) => {
    const { providerTypeId } = params(config);
    if (!providerTypeId) return validation({ providerTypeId: ['providerTypeId is required'] });
    return ok(db.serviceCategories.filter((c) => c.providerTypeIds.includes(String(providerTypeId))));
  });
};
