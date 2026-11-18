import type MockAdapter from 'axios-mock-adapter';

import type { DaySlots, Provider, ProviderCard, ProviderDetails } from '@/types';
import { addDays, atTime, fromMinutes, localDate, toMinutes } from '@/utils/format';

import ru from '../data/ru.json';
import { db } from '../db';
import { distanceKm, notFound, ok, param, params } from '../utils';

// Search hits the text in either language the mock can answer in.
const ruTexts = ru as Record<string, string>;
const matches = (value: string, text: string) =>
  value.toLowerCase().includes(text) || (ruTexts[value] ?? '').toLowerCase().includes(text);

const DOW = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
const STEP_MIN = 15;

const toCard = (p: Provider, lat: number, lng: number): ProviderCard => {
  const today = p.workingHours[DOW[new Date().getDay()]];
  return {
    id: p.id,
    businessName: p.businessName,
    typeId: p.typeId,
    typeName: p.typeName,
    address: p.address,
    lat: p.lat,
    lng: p.lng,
    rating: p.rating,
    ratingCount: p.ratingCount,
    visits: p.visits,
    photoUrl: p.photoUrl,
    distanceKm: distanceKm(lat, lng, p.lat, p.lng),
    closesAt: today ? today.close : null,
  };
};

/**
 * Free start times ('HH:mm') on one local day: working hours minus the break minus
 * pending/confirmed bookings, every 15 minutes, never in the past.
 */
export const freeStarts = (p: Provider, date: Date, durationMin: number, now = new Date()) => {
  const wd = p.workingHours[DOW[date.getDay()]];
  if (!wd || durationMin <= 0) return [];
  const iso = localDate(date);
  const busy = db.bookings
    .filter((b) => b.providerId === p.id && (b.status === 'pending' || b.status === 'confirmed'))
    .filter((b) => localDate(new Date(b.startsAt)) === iso)
    .map((b) => {
      const s = new Date(b.startsAt);
      const e = new Date(b.endsAt);
      return [s.getHours() * 60 + s.getMinutes(), e.getHours() * 60 + e.getMinutes()];
    });
  if (wd.breakStart && wd.breakEnd) busy.push([toMinutes(wd.breakStart), toMinutes(wd.breakEnd)]);
  const nowMin = localDate(now) === iso ? now.getHours() * 60 + now.getMinutes() : -1;
  const out: string[] = [];
  for (let s = toMinutes(wd.open); s + durationMin <= toMinutes(wd.close); s += STEP_MIN) {
    const e = s + durationMin;
    if (s <= nowMin) continue;
    if (busy.some(([bs, be]) => s < be && e > bs)) continue;
    out.push(fromMinutes(s));
  }
  return out;
};

const nextFreeAt = (p: Provider) => {
  const visible = p.services.filter((s) => !s.hidden);
  if (visible.length === 0) return null;
  const shortest = Math.min(...visible.map((s) => s.durationMin));
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = addDays(today, i);
    const [first] = freeStarts(p, date, shortest);
    if (first) return atTime(date, first).toISOString();
  }
  return null;
};

export const providersHandlers = (mock: MockAdapter) => {
  mock.onGet('/providers/nearby').reply((config) => {
    const q = params(config);
    const lat = Number(q.lat);
    const lng = Number(q.lng);
    const radius = Number(q.radiusKm ?? 3);
    const sort = q.sort ?? 'distance';
    const text = String(q.q ?? '')
      .trim()
      .toLowerCase();
    const cards = db.providers
      .filter((p) => p.listed)
      .filter((p) => !q.typeId || p.typeId === q.typeId)
      .filter(
        (p) =>
          !text ||
          matches(p.businessName, text) ||
          matches(p.typeName, text) ||
          p.services.some((s) => !s.hidden && matches(s.name, text)),
      )
      .map((p) => toCard(p, lat, lng))
      .filter((c) => c.distanceKm <= radius)
      .sort((a, b) =>
        sort === 'rating'
          ? b.rating - a.rating || a.distanceKm - b.distanceKm
          : sort === 'visits'
            ? b.visits - a.visits
            : a.distanceKm - b.distanceKm,
      );
    return ok(cards);
  });

  // Best rated first, the nearer one wins a tie.
  mock.onGet('/providers/top').reply((config) => {
    const q = params(config);
    const lat = Number(q.lat);
    const lng = Number(q.lng);
    return ok(
      db.providers
        .filter((p) => p.listed)
        .map((p) => toCard(p, lat, lng))
        .sort((a, b) => b.rating - a.rating || a.distanceKm - b.distanceKm)
        .slice(0, Number(q.limit ?? 3)),
    );
  });

  mock.onGet(/\/providers\/[^/]+\/slots$/).reply((config) => {
    const id = param(config, /\/providers\/([^/]+)\/slots$/);
    const p = db.providers.find((x) => x.id === id);
    if (!p) return notFound('Provider not found');
    const q = params(config);
    const serviceIds = String(q.serviceIds ?? '')
      .split(',')
      .filter(Boolean);
    const days = Number(q.days ?? 7);
    const duration = p.services
      .filter((s) => serviceIds.includes(s.id))
      .reduce((sum, s) => sum + s.durationMin, 0);
    const today = new Date();
    const out: DaySlots[] = [];
    for (let i = 0; i < days; i++) {
      const date = addDays(today, i);
      out.push({
        date: localDate(date),
        closed: !p.workingHours[DOW[date.getDay()]],
        starts: freeStarts(p, date, duration),
      });
    }
    return ok(out);
  });

  mock.onGet(/\/providers\/[^/]+\/ratings$/).reply((config) => {
    const id = param(config, /\/providers\/([^/]+)\/ratings$/);
    if (!db.providers.some((x) => x.id === id)) return notFound('Provider not found');
    return ok(
      db.ratings
        .filter((r) => r.providerId === id)
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
        .map(({ id: ratingId, clientName, stars, createdAt }) => ({
          id: ratingId,
          clientName,
          stars,
          createdAt,
        })),
    );
  });

  mock.onGet(/\/providers\/[^/]+$/).reply((config) => {
    const id = param(config, /\/providers\/([^/]+)$/);
    const p = db.providers.find((x) => x.id === id);
    if (!p) return notFound('Provider not found');
    const q = params(config);
    const hasCoords = q.lat != null && q.lng != null;
    const details: ProviderDetails = {
      ...p,
      services: p.services.filter((s) => !s.hidden),
      portfolio: [...p.portfolio].sort((a, b) => a.order - b.order),
      distanceKm: hasCoords ? distanceKm(Number(q.lat), Number(q.lng), p.lat, p.lng) : null,
      nextFreeAt: nextFreeAt(p),
    };
    return ok(details);
  });
};
