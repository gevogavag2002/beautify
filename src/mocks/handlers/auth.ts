import type MockAdapter from 'axios-mock-adapter';

import type { RegisterInput, ServiceInput } from '@/api/authApi';
import type { User } from '@/types';

import { db } from '../db';
import { body, created, ok, unauthorized, validation } from '../utils';

const publicUser = (u: (typeof db.users)[number]): User => {
  const { password: _pw, providerId: _pid, ...rest } = u;
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
      password: input.password,
      providerId: input.role === 'provider' ? `prv-${id}` : undefined,
    });
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
    return ok({ ok: true });
  });
};
