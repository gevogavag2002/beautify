import type MockAdapter from 'axios-mock-adapter';

import { authHandlers } from './auth';
import { bookingsHandlers } from './bookings';
import { catalogHandlers } from './catalog';
import { contentHandlers } from './content';
import { eventsHandlers } from './events';
import { myProviderHandlers } from './myProvider';
import { profileHandlers } from './profile';
import { providersHandlers } from './providers';

// One file per backend domain. Register the new domain here when you add a feature.
export const registerHandlers = (mock: MockAdapter) => {
  authHandlers(mock);
  catalogHandlers(mock);
  providersHandlers(mock);
  bookingsHandlers(mock);
  profileHandlers(mock);
  eventsHandlers(mock);
  contentHandlers(mock);
  myProviderHandlers(mock);
};
