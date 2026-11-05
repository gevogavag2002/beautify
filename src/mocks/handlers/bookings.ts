import type MockAdapter from 'axios-mock-adapter';

import type { Booking, BookingStatus, CreateBookingInput } from '@/types';

import { db } from '../db';
import { body, created, notFound, ok, param, params, validation } from '../utils';

export const bookingsHandlers = (mock: MockAdapter) => {
  mock.onGet('/bookings').reply((config) => {
    const scope = params(config).scope ?? 'upcoming';
    const me = db.users.find((u) => u.id === db.session.userId);
    const now = Date.now();
    const mine = db.bookings.filter((b) =>
      me?.role === 'provider' ? b.providerId === me.providerId : b.clientId === me?.id,
    );
    const list = mine
      .filter((b) =>
        scope === 'past' ? Date.parse(b.startsAt) < now : Date.parse(b.startsAt) >= now,
      )
      .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
    return ok(list);
  });

  mock.onPost('/bookings').reply((config) => {
    const input = body<CreateBookingInput>(config);
    const p = db.providers.find((x) => x.id === input.providerId);
    if (!p) return notFound('Provider not found');
    const services = p.services.filter((s) => input.serviceIds.includes(s.id));
    if (services.length === 0) return validation({ serviceIds: ['Pick at least one service'] });
    const duration = services.reduce((sum, s) => sum + s.durationMin, 0);
    const me = db.users.find((u) => u.id === db.session.userId);
    const booking: Booking = {
      id: `bk-${Date.now()}`,
      providerId: p.id,
      providerName: p.businessName,
      providerAddress: p.address,
      clientId: me?.id ?? 'guest',
      clientName: me?.fullName ?? 'Guest',
      services: services.map((s) => ({ id: s.id, name: s.name, durationMin: s.durationMin })),
      startsAt: input.startsAt,
      endsAt: new Date(Date.parse(input.startsAt) + duration * 60000).toISOString(),
      status: p.autoAccept ? 'confirmed' : 'pending',
      manual: false,
      createdAt: new Date().toISOString(),
    };
    db.bookings.push(booking);
    return created(booking);
  });

  mock.onPatch(/\/bookings\/[^/]+\/status$/).reply((config) => {
    const id = param(config, /\/bookings\/([^/]+)\/status$/);
    const { status } = body<{ status: BookingStatus }>(config);
    const b = db.bookings.find((x) => x.id === id);
    if (!b) return notFound('Booking not found');
    b.status = status;
    return ok(b);
  });
};
