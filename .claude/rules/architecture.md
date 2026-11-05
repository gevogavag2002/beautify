# File architecture

Layered by type at the top, grouped by feature inside. Mirrors the team's admin panel
conventions (exchange-hub-front) adapted to Expo Router and NativeWind.

## Folders

| Path                           | What goes here                                                                                                                                           | What must NOT go here                                                                            |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `app/`                         | Route files and layouts only. Each file imports a screen from `src/features/*/screens` and renders it. Route groups: `(auth)`, `(client)`, `(provider)`. | Business logic, API calls, big JSX, styles beyond a wrapper                                      |
| `src/features/<name>/`         | Everything owned by one domain: `screens/`, `components/`, `hooks/`, `api.ts`, `types.ts`, `store.ts` (only if the feature needs local global state)     | Code used by two or more features (lift it to `src/components/common`, `src/hooks`, `src/utils`) |
| `src/components/ui/`           | Design-system primitives built on tokens: `Button`, `Input`, `Text`, `Card`, `Chip`, `Sheet`, `Avatar`, `StatusBadge`                                    | Anything that knows about bookings, providers, users                                             |
| `src/components/common/`       | Reusable composites not tied to a feature: `Screen`, `Header`, `TabBar`, `EmptyState`, `Toast`                                                           | Feature-specific components                                                                      |
| `src/api/`                     | One object per backend domain: `authApi`, `providersApi`, `bookingsApi`. Methods only call `apiV1` from services and return `data`.                      | React hooks, state, UI                                                                           |
| `src/services/`                | `axiosInstance.ts`, `storage.ts` (secure store), `notifications.ts`                                                                                      | Domain logic                                                                                     |
| `src/store/`                   | Zustand stores for truly global state: `sessionStore`, `themeStore`                                                                                      | Server data (use TanStack Query)                                                                 |
| `src/hooks/`                   | Shared hooks (`useTheme`, `useDebounce`, `useKeyboard`)                                                                                                  | Feature hooks                                                                                    |
| `src/theme/`                   | `tokens.js` is the single source of truth; `index.ts` re-exports it                                                                                      | Hardcoded colors anywhere else                                                                   |
| `src/types/`                   | Shared / API contract types by domain (`booking.ts`, `provider.ts`, `common.ts`)                                                                         | Component prop types (keep next to the component)                                                |
| `src/constants/`, `src/utils/` | Pure constants and pure functions                                                                                                                        | React code                                                                                       |
| `src/i18n/`, `src/locales/`    | i18next setup and `en.json`, `ru.json`, `hy.json`                                                                                                        | Hardcoded user-facing strings in components                                                      |
| `src/providers/`               | `RootProvider`, `QueryProvider`, `AuthGate`                                                                                                              | Screens                                                                                          |
| `assets/`                      | Fonts, images, icons                                                                                                                                     | Code                                                                                             |

## Route groups in `app/`

```
app/
  _layout.tsx            root: providers, fonts, auth gate
  (auth)/                login, register/role, register/details, register/phone, register/email, register/services
  (client)/              tabs: index (home), map, reservations, profile; stack: provider/[id], booking/[id]
  (provider)/            tabs: schedule, services, portfolio, profile
  +not-found.tsx
```

The root layout decides which group the user lands in from `sessionStore.role`.

## Rules

1. A route file in `app/` is at most ~10 lines: import the screen, render it, export `options` if needed.
2. New domain code starts in `src/features/<name>/`. Move to shared folders only when a second
   feature needs it.
3. One component per folder when it has more than one file:
   `Button/Button.tsx`, `Button/Button.types.ts`, `Button/index.ts`. Single-file components
   may be a bare `Button.tsx`.
4. Imports use the `@/` alias for everything under `src/`; relative imports only inside the
   same folder.
5. No hardcoded hex colors, font names, or radii in components. Use Tailwind classes backed
   by `src/theme/tokens.js` (`bg-ground`, `text-ink`, `rounded-card`, `font-extrabold`).
6. No user-facing strings inline; use `t('...')` from i18next.
7. Server data goes through TanStack Query hooks in the feature (`useProviders`,
   `useCreateBooking`); components never call `api/*` directly.
8. Do not add native modules without asking: they move the project from Expo Go to a
   development build.
