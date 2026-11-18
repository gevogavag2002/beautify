import type MockAdapter from 'axios-mock-adapter';

import { db } from '../db';
import { ok, params } from '../utils';

export const eventsHandlers = (mock: MockAdapter) => {
  // Events that have not ended yet, soonest first.
  mock.onGet('/events/upcoming').reply((config) => {
    const limit = Number(params(config).limit ?? 10);
    const now = Date.now();
    return ok(
      db.events
        .filter((e) => Date.parse(e.endsAt) >= now)
        .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
        .slice(0, limit),
    );
  });
};
