// In-memory mock database. Seeded from JSON, mutated by handlers so the app behaves
// statefully within one session (create booking, accept, decline...).
import type { Booking, Provider, User } from '@/types';

import bookingsSeed from './data/bookings.json';
import catalog from './data/catalog.json';
import providersSeed from './data/providers.json';
import usersSeed from './data/users.json';

type MockUser = User & { password: string; providerId?: string };

export const db = {
  providerTypes: catalog.providerTypes,
  serviceCategories: catalog.serviceCategories,
  providers: providersSeed as Provider[],
  users: usersSeed as MockUser[],
  bookings: bookingsSeed as Booking[],
  session: { userId: 'usr-client-1' as string | null },
};

export const resetDb = () => {
  db.bookings = [...(bookingsSeed as Booking[])];
  db.session.userId = 'usr-client-1';
};
