// In-memory mock database. Seeded from JSON, mutated by handlers so the app behaves
// statefully within one session (create booking, accept, decline...).
// Dated seeds (bookings, events, ratings) store a `day` offset from today instead of a fixed
// date, so the demo data never goes stale.
import type {
  Booking,
  BookingStatus,
  ClientStats,
  EventCard,
  Provider,
  ProviderRating,
  ProviderType,
  ServiceCategory,
  User,
} from '@/types';
import { addDays, atTime } from '@/utils/format';

import bookingsSeed from './data/bookings.json';
import catalog from './data/catalog.json';
import eventsSeed from './data/events.json';
import providersSeed from './data/providers.json';
import ratingsSeed from './data/ratings.json';
import usersSeed from './data/users.json';

type MockUser = User & { password: string; providerId?: string; clientStats?: ClientStats };
type MockRating = ProviderRating & { providerId: string };

const providers = providersSeed as Provider[];
const providerTypes = catalog.providerTypes as ProviderType[];

const day = (offset: number) => addDays(new Date(), offset);

/** Booking row with the provider fields copied in, as the API returns it. */
export const makeBooking = (
  input: Pick<
    Booking,
    'id' | 'providerId' | 'clientId' | 'clientName' | 'services' | 'status' | 'manual' | 'rating'
  > & { startsAt: Date; createdAt?: Date },
): Booking => {
  const p = providers.find((x) => x.id === input.providerId);
  const duration = input.services.reduce((sum, s) => sum + s.durationMin, 0);
  return {
    id: input.id,
    providerId: input.providerId,
    providerName: p?.businessName ?? '',
    providerAddress: p?.address ?? '',
    providerLat: p?.lat ?? 0,
    providerLng: p?.lng ?? 0,
    clientId: input.clientId,
    clientName: input.clientName,
    services: input.services,
    startsAt: input.startsAt.toISOString(),
    endsAt: new Date(input.startsAt.getTime() + duration * 60000).toISOString(),
    status: input.status,
    manual: input.manual,
    rating: input.rating,
    createdAt: (input.createdAt ?? new Date()).toISOString(),
  };
};

const DOW = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

// Offsets are relative to today, so a seeded booking can land on a day the provider is
// closed; those are dropped.
const seedBookings = () =>
  bookingsSeed
    .filter((b) => {
      const p = providers.find((x) => x.id === b.providerId);
      const hours = p?.workingHours[DOW[day(b.day).getDay()]];
      return !!hours && b.time >= hours.open && b.time < hours.close;
    })
    .map((b) =>
      makeBooking({
        ...b,
        status: b.status as BookingStatus,
        startsAt: atTime(day(b.day), b.time),
        createdAt: day(b.day - 2),
      }),
    );

const seedEvents = (): EventCard[] =>
  eventsSeed.map((e) => ({
    id: e.id,
    title: e.title,
    startsAt: atTime(day(e.day), e.start).toISOString(),
    endsAt: atTime(day(e.day), e.end).toISOString(),
    venueName: e.venueName,
    tag: e.tag,
  }));

const seedRatings = (): MockRating[] =>
  ratingsSeed.map((r) => ({
    id: r.id,
    providerId: r.providerId,
    clientName: r.clientName,
    stars: r.stars,
    createdAt: atTime(day(r.day), '12:00').toISOString(),
  }));

export const db = {
  providerTypes,
  serviceCategories: catalog.serviceCategories as ServiceCategory[],
  providers,
  users: usersSeed as MockUser[],
  bookings: seedBookings(),
  events: seedEvents(),
  ratings: seedRatings(),
  session: {
    userId: 'usr-client-1' as string | null,
    // Pending contact changes: the new value is applied only after its code is confirmed.
    pendingPhone: null as string | null,
    pendingEmail: null as string | null,
  },
};

export const resetDb = () => {
  db.bookings = seedBookings();
  db.session.userId = 'usr-client-1';
};
