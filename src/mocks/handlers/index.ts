import type MockAdapter from 'axios-mock-adapter';

import { authHandlers } from './auth';
import { bookingsHandlers } from './bookings';
import { catalogHandlers } from './catalog';
import { providersHandlers } from './providers';

// One file per backend domain. Register the new domain here when you add a feature.
export const registerHandlers = (mock: MockAdapter) => {
  authHandlers(mock);
  catalogHandlers(mock);
  providersHandlers(mock);
  bookingsHandlers(mock);
};
