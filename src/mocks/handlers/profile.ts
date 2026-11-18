import type MockAdapter from 'axios-mock-adapter';

import type {
  ChangePasswordInput,
  UpdateDetailsInput,
  UpdateProviderInput,
} from '@/api/profileApi';

import { db } from '../db';
import { body, notFound, ok, unauthorized, validation } from '../utils';
import { publicUser } from './auth';

const WRONG_CODE = '000000';
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PHONE_RE = /^\+\d{8,15}$/;
const PASSWORD_RE = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;

const me = () => db.users.find((x) => x.id === db.session.userId);
const myProvider = () => {
  const u = me();
  return u?.providerId ? db.providers.find((p) => p.id === u.providerId) : undefined;
};
const ABOUT_MAX = 300;

export const profileHandlers = (mock: MockAdapter) => {
  mock.onGet('/me/client-stats').reply(() => {
    const u = me();
    if (!u) return unauthorized();
    return ok(
      u.clientStats ?? { rating: 0, ratingCount: 0, ratingsGiven: 0, visits: 0, noShows: 0 },
    );
  });

  mock.onPatch('/me').reply((config) => {
    const u = me();
    if (!u) return unauthorized();
    const input = body<UpdateDetailsInput>(config);
    if (!input.fullName?.trim()) return validation({ fullName: ['Enter your name'] });
    u.fullName = input.fullName.trim();
    u.gender = input.gender;
    return ok(publicUser(u));
  });

  mock.onPost('/me/phone/change').reply((config) => {
    const u = me();
    if (!u) return unauthorized();
    const { phone } = body<{ phone: string }>(config);
    if (!PHONE_RE.test(phone ?? '')) return validation({ phone: ['Enter a valid phone number'] });
    if (phone === u.phone) return validation({ phone: ['That is your current number'] });
    if (db.users.some((x) => x.phone === phone && x.phoneConfirmed))
      return validation({ phone: ['This number is used by another account'] });
    db.session.pendingPhone = phone;
    return ok({ expiresInSec: 300 });
  });
  mock.onPost('/me/phone/verify').reply((config) => {
    const u = me();
    if (!u) return unauthorized();
    const { code } = body<{ code: string }>(config);
    if (!db.session.pendingPhone) return validation({ code: ['No change in progress'] });
    if (!/^\d{6}$/.test(code) || code === WRONG_CODE) return validation({ code: ['Wrong code'] });
    u.phone = db.session.pendingPhone;
    u.phoneConfirmed = true;
    db.session.pendingPhone = null;
    return ok(publicUser(u));
  });

  mock.onPost('/me/email/change').reply((config) => {
    const u = me();
    if (!u) return unauthorized();
    const { email } = body<{ email: string }>(config);
    if (!EMAIL_RE.test(email ?? '')) return validation({ email: ['Enter a valid email'] });
    if (email === u.email) return validation({ email: ['That is your current email'] });
    if (db.users.some((x) => x.email === email && x.emailConfirmed))
      return validation({ email: ['This email is used by another account'] });
    db.session.pendingEmail = email;
    return ok({ expiresInSec: 900 });
  });
  mock.onPost('/me/email/verify').reply((config) => {
    const u = me();
    if (!u) return unauthorized();
    const { code } = body<{ code: string }>(config);
    if (!db.session.pendingEmail) return validation({ code: ['No change in progress'] });
    if (!/^\d{6}$/.test(code) || code === WRONG_CODE) return validation({ code: ['Wrong code'] });
    u.email = db.session.pendingEmail;
    u.emailConfirmed = true;
    db.session.pendingEmail = null;
    return ok(publicUser(u));
  });

  mock.onPost('/me/password').reply((config) => {
    const u = me();
    if (!u) return unauthorized();
    const { currentPassword, newPassword } = body<ChangePasswordInput>(config);
    if (currentPassword !== u.password)
      return validation({ currentPassword: ['Wrong current password'] });
    if (!PASSWORD_RE.test(newPassword ?? ''))
      return validation({ newPassword: ['At least 8 characters, with a letter and a number'] });
    u.password = newPassword;
    u.passwordChangedAt = new Date().toISOString();
    return ok(publicUser(u));
  });

  mock.onGet('/me/provider').reply(() => {
    if (!me()) return unauthorized();
    const p = myProvider();
    return p ? ok(p) : notFound();
  });
  mock.onPatch('/me/provider').reply((config) => {
    if (!me()) return unauthorized();
    const p = myProvider();
    if (!p) return notFound();
    const input = body<UpdateProviderInput>(config);
    const errors: Record<string, string[]> = {};
    if (input.businessName !== undefined && !input.businessName.trim())
      errors.businessName = ['Enter your business name'];
    if (input.about && input.about.length > ABOUT_MAX)
      errors.about = [`Keep it under ${ABOUT_MAX} characters`];
    if (input.address !== undefined && !input.address.trim())
      errors.address = ['Enter your address'];
    const type = input.typeId ? db.providerTypes.find((t) => t.id === input.typeId) : undefined;
    if (input.typeId && !type) errors.typeId = ['Unknown provider type'];
    if (input.workingHours) {
      for (const day of Object.values(input.workingHours)) {
        if (!day) continue;
        const bad =
          day.open >= day.close ||
          (day.breakStart != null &&
            day.breakEnd != null &&
            (day.breakStart >= day.breakEnd ||
              day.breakStart < day.open ||
              day.breakEnd > day.close));
        if (bad) errors.workingHours = ['Check the opening, closing and break times'];
      }
    }
    if (Object.keys(errors).length) return validation(errors);
    if (input.autoAccept !== undefined) p.autoAccept = input.autoAccept;
    if (input.workingHours) p.workingHours = input.workingHours;
    if (input.businessName !== undefined) p.businessName = input.businessName.trim();
    if (input.about !== undefined) p.about = input.about?.trim() || null;
    if (input.address !== undefined) p.address = input.address.trim();
    if (input.lat !== undefined) p.lat = input.lat;
    if (input.lng !== undefined) p.lng = input.lng;
    if (type) {
      p.typeId = type.id;
      p.typeName = type.name;
    }
    return ok(p);
  });

  mock.onPost('/auth/logout').reply(() => {
    db.session.userId = null;
    db.session.pendingPhone = null;
    db.session.pendingEmail = null;
    return ok({ ok: true });
  });
};
