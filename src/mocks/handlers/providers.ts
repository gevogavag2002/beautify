import type MockAdapter from 'axios-mock-adapter';

import type { DaySlots, Provider, ProviderCard } from '@/types';

import { db } from '../db';
import { distanceKm, notFound, ok, param, params } from '../utils';

const DOW = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

const toCard = (p: Provider, lat: number, lng: number): ProviderCard => {
  const today = p.workingHours[DOW[new Date().getDay()]];
  return {
    id: p.id,
    businessName: p.businessName,
    typeName: p.typeName,
    rating: p.rating,
    ratingCount: p.ratingCount,
    visits: p.visits,
    photoUrl: p.photoUrl,
    distanceKm: distanceKm(lat, lng, p.lat, p.lng),
    closesAt: today ? today.close : null,
  };
};

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};
const toHHMM = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

export const providersHandlers = (mock: MockAdapter) => {
  mock.onGet('/providers/nearby').reply((config) => {
    const q = params(config);
    const lat = Number(q.lat ?? 40.1811);
    const lng = Number(q.lng ?? 44.5136);
    const radius = Number(q.radiusKm ?? 3);
    const sort = q.sort ?? 'distance';
    const cards = db.providers
      .filter((p) => !q.typeId || p.typeId === q.typeId)
      .map((p) => toCard(p, lat, lng))
      .filter((c) => c.distanceKm <= radius)
      .sort((a, b) =>
        sort === 'rating'
          ? b.rating - a.rating
          : sort === 'visits'
            ? b.visits - a.visits
            : a.distanceKm - b.distanceKm,
      );
    return ok(cards);
  });

  mock.onGet('/providers/top').reply(() =>
    ok(
      db.providers
        .map((p) => toCard(p, 40.1811, 44.5136))
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5),
    ),
  );

  // Free start times: working hours minus break minus existing bookings, 15-minute step.
  mock.onGet(/\/providers\/[^/]+\/slots$/).reply((config) => {
    const id = param(config, /\/providers\/([^/]+)\/slots$/);
    const p = db.providers.find((x) => x.id === id);
    if (!p) return notFound('Provider not found');
    const q = params(config);
    const serviceIds = String(q.serviceIds ?? '')
      .split(',')
      .filter(Boolean);
    const days = Number(q.days ?? 7);
    const from = new Date(String(q.from ?? new Date().toISOString()));
    const duration = p.services
      .filter((s) => serviceIds.includes(s.id))
      .reduce((sum, s) => sum + s.durationMin, 0);

    const out: DaySlots[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(from);
      date.setDate(from.getDate() + i);
      const iso = date.toISOString().slice(0, 10);
      const wd = p.workingHours[DOW[date.getDay()]];
      const starts: string[] = [];
      if (wd && duration > 0) {
        const busy = db.bookings
          .filter((b) => b.providerId === p.id && b.startsAt.startsWith(iso))
          .filter((b) => b.status === 'pending' || b.status === 'confirmed')
          .map((b) => [toMin(b.startsAt.slice(11, 16)), toMin(b.endsAt.slice(11, 16))]);
        if (wd.breakStart && wd.breakEnd) busy.push([toMin(wd.breakStart), toMin(wd.breakEnd)]);
        const nowMin = i === 0 ? from.getHours() * 60 + from.getMinutes() : -1;
        for (let s = toMin(wd.open); s + duration <= toMin(wd.close); s += 15) {
          const e = s + duration;
          if (s <= nowMin) continue;
          if (busy.some(([bs, be]) => s < be && e > bs)) continue;
          starts.push(toHHMM(s));
        }
      }
      out.push({ date: iso, starts });
    }
    return ok(out);
  });

  mock.onGet(/\/providers\/[^/]+$/).reply((config) => {
    const id = param(config, /\/providers\/([^/]+)$/);
    const p = db.providers.find((x) => x.id === id);
    if (!p) return notFound('Provider not found');
    return ok({ ...p, services: p.services.filter((s) => !s.hidden) });
  });
};
