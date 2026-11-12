# Backlog and status

Single place for what is done, what was deliberately stubbed, and what the backend must
know. Updated in the same change as the code it describes (see CLAUDE.md, "Docs move with
the code"); the date in the Status heading is the date of the last update.

## Status (2026-11-12)

- Done: project setup, rules/skills, phone dev-client workflow, mocks, the whole
  "Sign in & register" block (Login, Role, Details, phone code, email code, pick services).
- Next: client block, in this order: Home, Nearby (search + map), Provider page, Booking,
  Reservations, Profile. Then provider block: Schedule, Services, Portfolio, Profile.
  Then error screens, dark mode pass, ru/hy locales.

## Deferred (stubs in code, must be finished)

| Item | Where | What is needed |
| --- | --- | --- |
| Profile photo picker | `DetailsScreen.tsx`, "Add photo" toggles a placeholder | `npx expo install expo-image-picker` (native: rebuild the dev APK), pick + crop + upload `POST /me/photo` |
| Country code picker | `DetailsScreen.tsx`, `+374` is fixed | Country list sheet; store `countryCode` in register store (already exists) |
| Forgot password | `LoginScreen.tsx`, link does nothing | Screens: enter email, code, new password. Endpoints `POST /auth/password/forgot`, `/auth/password/reset` |
| Session persistence | `sessionStore.ts` in memory only | `expo-secure-store` for token, restore on launch in `app/_layout.tsx`, `GET /auth/me` to refresh user |
| Logout / token refresh | not implemented | `POST /auth/logout`, 401 interceptor in `axiosInstance.ts` clears session |
| Locales ru, hy | only `en.json` | Add `ru.json`, `hy.json`, language picker in Profile |
| Dark mode | tokens have no dark values | Define dark palette in `tokens.js`, `themeStore`, check every screen |

## Backend contract notes (for Armen)

Decisions made on the mobile side that the API must follow. Full contract: `src/types/*`,
mock behaviour: `src/mocks/handlers/*`.

1. `GET /catalog/services?providerTypeId=<id>` returns only the categories of that provider
   type (`ServiceCategory.providerTypeIds`). Without the param: 422.
2. `POST /auth/register` creates an **unconfirmed draft**. A confirmed account with the same
   email → 422 on `email`. Unconfirmed duplicates are allowed; the first draft to pass
   `POST /auth/email/verify` becomes the account, other drafts for that email are deleted.
   Drafts older than ~24h are purged by a cron.
3. Verification codes: 6 digits, `POST /auth/phone/send|verify`, `POST /auth/email/send|verify`.
   Email verify returns `{ token, user }` and logs the user in.
4. Validation errors are `422 { message, errors: { field: [msg] } }`; the app shows them under
   the matching field.
5. Booking statuses: `pending | confirmed | declined | cancelled | completed | no_show`.
