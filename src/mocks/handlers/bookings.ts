import type MockAdapter from 'axios-mock-adapter';

import type { BookingStatus, CreateBookingInput } from '@/types';
import { hhmm } from '@/utils/format';

import { db, makeBooking } from '../db';
import { body, created, notFound, ok, param, params, validation } from '../utils';
import { freeStarts } from './providers';

const OPEN: BookingStatus[] = ['pending', 'confirmed'];

export const bookingsHandlers = (mock: MockAdapter) => {
  // upcoming: still pending/confirmed and not over yet, soonest first.
  // past: everything else, newest first.
  mock.onGet('/bookings').reply((config) => {
    const scope = params(config).scope ?? 'upcoming';
    const me = db.users.find((u) => u.id === db.session.userId);
    const now = Date.now();
    const mine = db.bookings.filter((b) =>
      me?.role === 'provider' ? b.providerId === me.providerId : b.clientId === me?.id,
    );
    const isUpcoming = (b: (typeof mine)[number]) =>
      OPEN.includes(b.status) && Date.parse(b.endsAt) >= now;
    const list =
      scope === 'past'
        ? mine
            .filter((b) => !isUpcoming(b))
            .sort((a, b) => Date.parse(b.startsAt) - Date.parse(a.startsAt))
        : mine.filter(isUpcoming).sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
    return ok(list);
  });

  mock.onPost('/bookings').reply((config) => {
    const input = body<CreateBookingInput>(config);
    const p = db.providers.find((x) => x.id === input.providerId);
    if (!p) return notFound('Provider not found');
    const services = p.services.filter((s) => !s.hidden && input.serviceIds.includes(s.id));
    if (services.length === 0) return validation({ serviceIds: ['Pick at least one service'] });
    const duration = services.reduce((sum, s) => sum + s.durationMin, 0);
    const startsAt = new Date(input.startsAt);
    if (Number.isNaN(startsAt.getTime())) return validation({ startsAt: ['Pick a start time'] });
    if (!freeStarts(p, startsAt, duration).includes(hhmm(startsAt))) {
      return validation({ startsAt: ['This time was just taken. Pick another one.'] });
    }
    const me = db.users.find((u) => u.id === db.session.userId);
    const booking = makeBooking({
      id: `bk-${Date.now()}`,
      providerId: p.id,
      clientId: me?.id ?? 'guest',
      clientName: me?.fullName ?? 'Guest',
      services: services.map((s) => ({ id: s.id, name: s.name, durationMin: s.durationMin })),
      startsAt,
      status: p.autoAccept ? 'confirmed' : 'pending',
      manual: false,
      rating: null,
    });
    db.bookings.push(booking);
    return created(booking);
  });

  mock.onPatch(/\/bookings\/[^/]+\/status$/).reply((config) => {
    const id = param(config, /\/bookings\/([^/]+)\/status$/);
    const { status } = body<{ status: BookingStatus }>(config);
    const b = db.bookings.find((x) => x.id === id);
    if (!b) return notFound('Booking not found');
    // pending -> confirmed | declined | cancelled; confirmed -> cancelled | completed | no_show.
    const allowed: Partial<Record<BookingStatus, BookingStatus[]>> = {
      pending: ['confirmed', 'declined', 'cancelled'],
      confirmed: ['cancelled', 'completed', 'no_show'],
    };
    if (!allowed[b.status]?.includes(status)) {
      return validation({ status: [`A ${b.status} reservation cannot become ${status}`] });
    }
    b.status = status;
    const p = db.providers.find((x) => x.id === b.providerId);
    const client = db.users.find((u) => u.id === b.clientId);
    if (status === 'completed') {
      if (p) p.visits += 1;
      if (client?.clientStats) client.clientStats.visits += 1;
    }
    if (status === 'no_show' && client?.clientStats) client.clientStats.noShows += 1;
    return ok(b);
  });

  // One rating per completed visit; it also moves the provider's average.
  mock.onPost(/\/bookings\/[^/]+\/rating$/).reply((config) => {
    const id = param(config, /\/bookings\/([^/]+)\/rating$/);
    const { stars } = body<{ stars: number }>(config);
    const b = db.bookings.find((x) => x.id === id);
    if (!b) return notFound('Booking not found');
    if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
      return validation({ stars: ['Rating must be 1 to 5 stars'] });
    }
    if (b.status !== 'completed')
      return validation({ stars: ['Only completed visits can be rated'] });
    if (b.rating != null) return validation({ stars: ['This visit is already rated'] });
    b.rating = stars;
    const p = db.providers.find((x) => x.id === b.providerId);
    if (p) {
      p.rating = Math.round(((p.rating * p.ratingCount + stars) / (p.ratingCount + 1)) * 10) / 10;
      p.ratingCount += 1;
    }
    db.ratings.push({
      id: `rt-${Date.now()}`,
      providerId: b.providerId,
      clientName: b.clientName,
      stars,
      createdAt: new Date().toISOString(),
    });
    const me = db.users.find((u) => u.id === db.session.userId);
    if (me?.clientStats) me.clientStats.ratingsGiven += 1;
    return ok(b);
  });
};
