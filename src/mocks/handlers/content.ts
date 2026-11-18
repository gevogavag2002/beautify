import type MockAdapter from 'axios-mock-adapter';

import content from '../data/content.json';
import { ok } from '../utils';

export const contentHandlers = (mock: MockAdapter) => {
  mock.onGet('/content/faq').reply(() => ok(content.faq));
  mock.onGet('/content/privacy').reply(() => ok(content.privacy));
};
