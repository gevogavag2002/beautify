import type MockAdapter from 'axios-mock-adapter';

import { db } from '../db';
import { body, ok, unauthorized, validation } from '../utils';

const publicUser = (u: (typeof db.users)[number]) => {
  const { password: _pw, providerId: _pid, ...rest } = u;
  return rest;
};

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
};
