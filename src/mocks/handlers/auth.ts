import type MockAdapter from 'axios-mock-adapter';

import type { RegisterInput, ServiceInput } from '@/api/authApi';
import type { User } from '@/types';

import { db } from '../db';
import { body, created, ok, unauthorized, validation } from '../utils';

export const publicUser = (u: (typeof db.users)[number]): User => {
  const { password: _pw, providerId: _pid, clientStats: _cs, ...rest } = u;
  return rest;
};

// Any 6-digit code is accepted except this one, so the error state can be tested.
const WRONG_CODE = '000000';

export const authHandlers = (mock: MockAdapter) => {
  mock.onPost('/auth/login').reply((config) => {
    const { email, password } = body<{ email: string; password: string }>(config);
    const u = db.users.find((x) => x.email === email && x.password === password);
    if (!u) return validation({ email: ['Wrong email or password'] });
    db.session.userId = u.id;
    return ok({ token: `mock-token-${u.id}`, user: publicUser(u) });
  });

  mock.onGet('/auth/me').reply(() => {
    const u = db.users.find((x) => x.id === db.session.userId);
    if (!u) return unauthorized();
    return ok(publicUser(u));
  });

  mock.onPost('/auth/register').reply((config) => {
    const input = body<RegisterInput>(config);
    const errors: Record<string, string[]> = {};
    if (!input.fullName?.trim()) errors.fullName = ['Enter your name'];
    if (!/^\+\d{8,15}$/.test(input.phone ?? '')) errors.phone = ['Enter a valid phone number'];
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.email ?? ''))
      errors.email = ['Enter a valid email'];
    // Only a confirmed account blocks the email. Unconfirmed attempts are drafts: a new
    // draft is created each time, and whoever enters the email code first wins (see verify).
    if (db.users.some((u) => u.email === input.email && u.emailConfirmed))
      errors.email = ['This email is already registered'];
    if (!/^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(input.password ?? ''))
      errors.password = ['At least 8 characters, with a letter and a number'];
    if (input.role === 'provider' && !input.providerTypeId) errors.providerTypeId = ['Pick a type'];
    if (Object.keys(errors).length) return validation(errors);

    const id = `usr-${Date.now()}`;
    db.users.push({
      id,
      role: input.role,
      fullName: input.fullName,
      gender: input.gender,
      phone: input.phone,
      email: input.email,
      phoneConfirmed: false,
      emailConfirmed: false,
      photoUrl: null,
      createdAt: new Date().toISOString(),
      passwordChangedAt: null,
      password: input.password,
      providerId: input.role === 'provider' ? `prv-${id}` : undefined,
    });
    // A provider gets an empty, unlisted business right away: the profile, services and
    // schedule screens all read it. It is listed once it has at least one service.
    const type = db.providerTypes.find((t) => t.id === input.providerTypeId);
    if (input.role === 'provider' && type) {
      const weekday = { open: '10:00', close: '19:00' };
      db.providers.push({
        id: `prv-${id}`,
        businessName: input.fullName,
        typeId: type.id,
        typeName: type.name,
        about: null,
        address: '',
        district: null,
        lat: 40.17714,
        lng: 44.50889,
        photoUrl: null,
        rating: 0,
        ratingCount: 0,
        visits: 0,
        ratingsGiven: 0,
        listed: false,
        autoAccept: false,
        workingHours: {
          mon: weekday,
          tue: weekday,
          wed: weekday,
          thu: weekday,
          fri: weekday,
          sat: null,
          sun: null,
        },
        services: [],
        portfolio: [],
      });
    }
    return created({ userId: id });
  });

  mock.onPost('/auth/phone/send').reply(() => ok({ expiresInSec: 300 }));
  mock.onPost('/auth/phone/verify').reply((config) => {
    const { userId, code } = body<{ userId: string; code: string }>(config);
    const u = db.users.find((x) => x.id === userId);
    if (!u) return unauthorized();
    if (!/^\d{6}$/.test(code) || code === WRONG_CODE) return validation({ code: ['Wrong code'] });
    u.phoneConfirmed = true;
    return ok({ ok: true });
  });

  mock.onPost('/auth/email/send').reply(() => ok({ expiresInSec: 900 }));
  mock.onPost('/auth/email/verify').reply((config) => {
    const { userId, code } = body<{ userId: string; code: string }>(config);
    const u = db.users.find((x) => x.id === userId);
    if (!u) return unauthorized();
    if (!/^\d{6}$/.test(code) || code === WRONG_CODE) return validation({ code: ['Wrong code'] });
    if (db.users.some((x) => x.email === u.email && x.emailConfirmed && x.id !== u.id))
      return validation({ code: ['This email was just confirmed by another account'] });
    u.emailConfirmed = true;
    // Drop competing drafts for the same email.
    db.users = db.users.filter((x) => x.email !== u.email || x.emailConfirmed);
    db.session.userId = u.id;
    return ok({ token: `mock-token-${u.id}`, user: publicUser(u) });
  });

  mock.onPut('/providers/me/services').reply((config) => {
    const { services } = body<{ services: ServiceInput[] }>(config);
    if (!services?.length) return validation({ services: ['Pick at least one service'] });
    const u = db.users.find((x) => x.id === db.session.userId);
    const p = db.providers.find((x) => x.id === u?.providerId);
    if (p) {
      const catalog = db.serviceCategories.flatMap((c) => c.services);
      p.services = services.map((s, i) => ({
        id: `ps-${Date.now()}-${i}`,
        catalogServiceId: s.catalogServiceId,
        name: catalog.find((c) => c.id === s.catalogServiceId)?.name ?? 'Service',
        description: null,
        durationMin: s.durationMin,
        hidden: false,
      }));
      p.listed = true;
    }
    return ok({ ok: true });
  });
};
