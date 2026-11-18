import type MockAdapter from 'axios-mock-adapter';

import type { AddServiceInput, UpdateServiceInput, WalkInInput } from '@/api/myProviderApi';
import { addDays } from '@/utils/format';

import { db, makeBooking } from '../db';
import { body, created, notFound, ok, param, params, unauthorized, validation } from '../utils';

const DOW = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
const DESCRIPTION_MAX = 80;

const myProvider = () => {
  const u = db.users.find((x) => x.id === db.session.userId);
  return u?.providerId ? db.providers.find((p) => p.id === u.providerId) : undefined;
};
const durationError = (min: unknown) =>
  typeof min !== 'number' || !Number.isInteger(min) || min < 5 || min > 480 || min % 5 !== 0
    ? ['Duration must be 5 to 480 minutes, in steps of 5']
    : null;

export const myProviderHandlers = (mock: MockAdapter) => {
  mock.onPost('/me/provider/services').reply((config) => {
    const p = myProvider();
    if (!p) return unauthorized();
    const input = body<AddServiceInput>(config);
    const errors: Record<string, string[]> = {};
    const offered = db.serviceCategories
      .filter((c) => c.providerTypeIds.includes(p.typeId))
      .flatMap((c) => c.services);
    const catalog = offered.find((s) => s.id === input.catalogServiceId);
    if (!catalog) errors.catalogServiceId = ['Pick a service'];
    else if (p.services.some((s) => s.catalogServiceId === catalog.id))
      errors.catalogServiceId = ['This service is already in your list'];
    const d = durationError(input.durationMin);
    if (d) errors.durationMin = d;
    if (input.description && input.description.length > DESCRIPTION_MAX)
      errors.description = [`Keep it under ${DESCRIPTION_MAX} characters`];
    if (Object.keys(errors).length || !catalog) return validation(errors);
    p.services.push({
      id: `ps-${Date.now()}`,
      catalogServiceId: catalog.id,
      name: catalog.name,
      description: input.description?.trim() || null,
      durationMin: input.durationMin,
      hidden: false,
    });
    p.listed = true;
    return created(p);
  });

  mock.onPatch(/\/me\/provider\/services\/[^/]+$/).reply((config) => {
    const p = myProvider();
    if (!p) return unauthorized();
    const id = param(config, /\/services\/([^/]+)$/);
    const s = p.services.find((x) => x.id === id);
    if (!s) return notFound('Service not found');
    const input = body<Omit<UpdateServiceInput, 'id'>>(config);
    const errors: Record<string, string[]> = {};
    if (input.durationMin !== undefined) {
      const d = durationError(input.durationMin);
      if (d) errors.durationMin = d;
    }
    if (input.description && input.description.length > DESCRIPTION_MAX)
      errors.description = [`Keep it under ${DESCRIPTION_MAX} characters`];
    if (Object.keys(errors).length) return validation(errors);
    if (input.durationMin !== undefined) s.durationMin = input.durationMin;
    if (input.description !== undefined) s.description = input.description?.trim() || null;
    if (input.hidden !== undefined) s.hidden = input.hidden;
    return ok(p);
  });

  mock.onDelete(/\/me\/provider\/services\/[^/]+$/).reply((config) => {
    const p = myProvider();
    if (!p) return unauthorized();
    const id = param(config, /\/services\/([^/]+)$/);
    if (!p.services.some((x) => x.id === id)) return notFound('Service not found');
    p.services = p.services.filter((x) => x.id !== id);
    return ok(p);
  });

  mock.onPost('/me/provider/portfolio').reply(() => {
    const p = myProvider();
    if (!p) return unauthorized();
    p.portfolio.push({
      id: `ph-${Date.now()}`,
      url: null,
      isCover: p.portfolio.length === 0,
      order: p.portfolio.length,
    });
    return created(p);
  });

  mock.onPut('/me/provider/portfolio/order').reply((config) => {
    const p = myProvider();
    if (!p) return unauthorized();
    const { ids } = body<{ ids: string[] }>(config);
    const known = new Set(p.portfolio.map((x) => x.id));
    if (!Array.isArray(ids) || ids.length !== known.size || ids.some((x) => !known.has(x)))
      return validation({ ids: ['Send every photo id exactly once'] });
    p.portfolio = ids.map((photoId, order) => {
      const photo = p.portfolio.find((x) => x.id === photoId)!;
      return { ...photo, order, isCover: order === 0 };
    });
    return ok(p);
  });

  mock.onDelete(/\/me\/provider\/portfolio\/[^/]+$/).reply((config) => {
    const p = myProvider();
    if (!p) return unauthorized();
    const id = param(config, /\/portfolio\/([^/]+)$/);
    if (!p.portfolio.some((x) => x.id === id)) return notFound('Photo not found');
    p.portfolio = p.portfolio
      .filter((x) => x.id !== id)
      .sort((a, b) => a.order - b.order)
      .map((x, order) => ({ ...x, order, isCover: order === 0 }));
    return ok(p);
  });

  mock.onGet('/me/schedule').reply((config) => {
    const p = myProvider();
    if (!p) return unauthorized();
    const days = Number(params(config).days ?? 7);
    const from = addDays(new Date(), 0).getTime();
    const to = addDays(new Date(), days).getTime();
    return ok(
      db.bookings
        .filter((b) => b.providerId === p.id)
        .filter((b) => b.status !== 'declined' && b.status !== 'cancelled')
        .filter((b) => Date.parse(b.startsAt) >= from && Date.parse(b.startsAt) < to)
        .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt)),
    );
  });

  mock.onPost('/me/schedule/walk-in').reply((config) => {
    const p = myProvider();
    if (!p) return unauthorized();
    const input = body<WalkInInput>(config);
    const errors: Record<string, string[]> = {};
    if (!input.clientName?.trim()) errors.clientName = ['Enter the client name'];
    const services = p.services.filter((s) => input.serviceIds?.includes(s.id));
    if (services.length === 0) errors.serviceIds = ['Pick at least one service'];
    const startsAt = new Date(input.startsAt);
    const duration = services.reduce((sum, s) => sum + s.durationMin, 0);
    if (Number.isNaN(startsAt.getTime())) errors.startsAt = ['Pick a start time'];
    else if (!p.workingHours[DOW[startsAt.getDay()]]) errors.startsAt = ['You are closed that day'];
    else {
      const s = startsAt.getTime();
      const e = s + duration * 60000;
      const overlaps = db.bookings.some(
        (b) =>
          b.providerId === p.id &&
          (b.status === 'pending' || b.status === 'confirmed') &&
          s < Date.parse(b.endsAt) &&
          e > Date.parse(b.startsAt),
      );
      if (overlaps) errors.startsAt = ['This time overlaps another reservation'];
    }
    if (Object.keys(errors).length) return validation(errors);
    const booking = makeBooking({
      id: `bk-${Date.now()}`,
      providerId: p.id,
      clientId: 'walk-in',
      clientName: input.clientName.trim(),
      services: services.map((s) => ({ id: s.id, name: s.name, durationMin: s.durationMin })),
      startsAt,
      status: 'confirmed',
      manual: true,
      rating: null,
    });
    db.bookings.push(booking);
    return created(booking);
  });
};
