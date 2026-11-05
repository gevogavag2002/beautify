# Mock data (axios-mock-adapter)

The app talks to the backend only through `src/api/*` and the single axios instance. In
development with `EXPO_PUBLIC_USE_MOCKS=true` (see `.env`), axios-mock-adapter attaches to that
instance and answers the same requests from `src/mocks`. Screens and hooks never know whether
data is mocked. (MSW was tried and dropped: it needs too many DOM polyfills on Hermes.)

```
src/mocks/
  data/*.json              seed data per domain (providers, bookings, users, catalog)
  db.ts                    in-memory DB seeded from data/, mutated by handlers within a session
  handlers/<domain>.ts     `(mock) => { mock.onGet('/path').reply(config => ok(...)) }`, one file per domain
  handlers/index.ts        registerHandlers(mock) calls every domain
  utils.ts                 ok(), created(), notFound(), validation(), unauthorized(), params(), body(), param()
  index.ts                 enableMocks(): creates the adapter on apiV1 once (Fast Refresh safe)
```

Paths in handlers are relative to the axios baseURL (`'/providers/top'`, not the full URL).
Dynamic segments use a RegExp route plus `param(config, /\/providers\/([^/]+)$/)`.
Register more specific RegExp routes before the generic ones (`/slots$` before `/providers/[^/]+$`).

## Rules

1. **Every screen ships with its mock data.** When you build or integrate a screen, in the same
   change you must: add or extend the JSON in `src/mocks/data`, add the handler(s) in
   `src/mocks/handlers/<domain>.ts`, register them in `handlers/index.ts`, and add the matching
   method in `src/api/<domain>Api.ts` with types in `src/types/<domain>.ts`. A screen that shows
   hardcoded arrays in JSX is not done.
2. Handlers must match the real API contract: path, query params, request body, response shape,
   status codes (200/201/404/422/401). The contract is `src/types/*` and is shared with Armen's
   backend. If the backend differs later, change `src/api` and `src/types`, never the screens.
3. Handlers behave like a server: filter, sort, paginate, validate, mutate `db` so that
   create/accept/decline are visible on other screens within the session.
4. The adapter adds 300 ms latency globally so loading states stay visible.
5. Mock users and passwords live in `users.json` (client `ani.karapetyan@mail.com` /
   `sunny-days-7`, provider `aram.grigoryan@mail.com` / `fade-room-24`).
6. Mocks are dev-only: `env.useMocks` is false outside `__DEV__`. Never import `src/mocks`
   from app code except `MocksGate`.
7. Turning mocks off = `EXPO_PUBLIC_USE_MOCKS=false` and restart Metro. Nothing else changes.
