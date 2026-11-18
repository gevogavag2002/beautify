# Backlog and status

Single place for what is done, what was deliberately stubbed, and what the backend must
know. Updated in the same change as the code it describes (see CLAUDE.md, "Docs move with
the code"); the date in the Status heading is the date of the last update.

## Status (2026-11-18)

Tasks are tracked as GitHub issues #1 to #12 (one per screen); this file is the detail.

- Done: project setup, rules/skills, phone dev-client workflow, mocks, "Sign in & register"
  (Login, Role, Details, phone code, email code, pick services).
- Done, client: tab bar, Home, Nearby search (drawn map), Provider page (services, portfolio,
  ratings), Pick services and time (request and auto-accept), My reservations (cancel,
  directions, rate), Profile, FAQ, Privacy policy.
- Done, provider: tab bar, Schedule (accept / decline, done / no-show, walk-in), Services and
  settings (auto-accept, add / edit / hide / remove, working hours), Portfolio (delete,
  reorder), Profile, Public page preview.
- Done, app-wide: error screens (not found, no access, something went wrong), role guards on
  both route groups, 401 clears the session, bottom sheets, English and Russian (Profile →
  Language).
- Next: session persistence, device location, photo upload, forgot password (see Deferred),
  then dark mode and the Armenian locale.

## Deferred (stubs in code, must be finished)

| Item                                            | Where                                                                                                                                                                                                                                        | What is needed                                                                                                                              |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Session persistence                             | `sessionStore.ts` in memory only: every app restart or full reload asks to sign in                                                                                                                                                           | `expo-secure-store` (native: rebuild the dev APK) for the token, restore on launch in `app/_layout.tsx`, `GET /auth/me` to refresh the user |
| Device location                                 | `src/constants/location.ts` is a fixed point in Kentron; every screen reads it through `useLocation()`                                                                                                                                       | `expo-location` (native: rebuild), permission flow, reverse geocode for the "Kentron, Yerevan" label; only `useLocation` changes            |
| Live map                                        | `search/components/MapMock.tsx` is the drawn map from the canvas (pins at real bearing and distance)                                                                                                                                         | A map module (native: rebuild): `react-native-maps` or `expo-maps`; tap a pin to open the provider                                          |
| Map pin in Address sheet                        | `profile/components/providerSheets.tsx` `MapPlaceholder` is decorative; save keeps the old lat/lng                                                                                                                                           | Same map module; drag pin, geocode address                                                                                                  |
| Photo upload                                    | Profile photo: `DetailsScreen.tsx` "Add photo", camera button in both profile screens do nothing. Portfolio: `PortfolioScreen.tsx` "Add photos" calls `POST /me/provider/portfolio` without a file and the mock adds an empty tile           | `expo-image-picker` (native: rebuild), pick + crop + multipart upload, real upload progress in the "Processing…" tile                       |
| Portfolio drag and drop                         | `PortfolioScreen.tsx` Reorder mode is tap a photo, then tap its new place                                                                                                                                                                    | Drag handles if wanted; the API (`PUT /me/provider/portfolio/order`) stays                                                                  |
| Events                                          | Home shows the next event from `GET /events/upcoming`; "See all" and the event card show a "coming soon" toast                                                                                                                               | Design the events list and event page, then routes for them                                                                                 |
| Country code picker                             | `DetailsScreen.tsx` and `profile/components/sheets.tsx`, `+374` is fixed                                                                                                                                                                     | Country list sheet; store `countryCode` in register store (already exists)                                                                  |
| Forgot password                                 | `LoginScreen.tsx`, link does nothing                                                                                                                                                                                                         | Screens: enter email, code, new password. Endpoints `POST /auth/password/forgot`, `/auth/password/reset`                                    |
| My ratings screen                               | `ClientProfileScreen.tsx` and `ProviderProfileScreen.tsx` row is informational only                                                                                                                                                          | No mockup yet; design it, then `GET /me/ratings`                                                                                            |
| Provider rates the client                       | Web FAQ says providers rate clients too; no mobile mockup                                                                                                                                                                                    | Design the step after "Mark done", then `POST /bookings/:id/client-rating`                                                                  |
| Help texts                                      | `GET /content/faq`, `/content/privacy` mocks hold the canvas copy with its placeholders (`[COMPANY LEGAL NAME]`, `[DATE]`); `supportEmail` is null so the contact card is hidden. FAQ and Privacy are reachable from the client profile only | Final texts and support email from the backend; a Help group in the provider profile if wanted                                              |
| Error ID and "Contact us" on the failure screen | `components/common/ErrorScreen.tsx` leaves the line out                                                                                                                                                                                      | Crash reporting that gives an error id, plus the support contact                                                                            |
| Locale hy                                       | `en.json` and `ru.json` exist; Armenian does not                                                                                                                                                                                             | Add `hy.json`, the `hy` plural rule in `src/i18n/pluralRules.ts`, and `hy` to `LANGUAGES`                                                   |
| Language is not remembered                      | The choice in Profile → Language lives in memory; a restart goes back to `EXPO_PUBLIC_DEFAULT_LANG`, else the phone's language                                                                                                               | Save it together with the session once storage is added; a language switch on the Sign in screen needs a design                             |
| Final logo and splash                           | `assets/*.png` are a temporary white sparkle on `#6247E8`, generated by script                                                                                                                                                               | Replace with the designed logo (icon 1024, adaptive fg/bg/mono, splash), then rebuild the APK                                               |
| Dark mode                                       | tokens have no dark values                                                                                                                                                                                                                   | Define dark palette in `tokens.js`, `themeStore`, check every screen                                                                        |

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
5. Profile (`/me`, bearer token): `GET /me/client-stats` → `ClientStats`;
   `PATCH /me { fullName, gender }` → `User`; `POST /me/phone/change { phone }` then
   `POST /me/phone/verify { code }` → `User` (old number stays until verified; same for
   `/me/email/change` + `/me/email/verify`); `POST /me/password { currentPassword, newPassword }`
   → `User`, 422 on `currentPassword`, signs out other devices; `POST /auth/logout`.
   `User` has `passwordChangedAt: string | null`.
6. Provider self-service: `GET /me/provider` → `Provider` (404 for clients);
   `PATCH /me/provider` with any of `{ businessName, about, typeId, address, lat, lng }` → `Provider`,
   422 per field (`about` max 300 chars). `Provider` has `district: string | null`,
   `ratingsGiven: number`, `listed: boolean` (shown in search).
7. Booking statuses: `pending | confirmed | declined | cancelled | completed | no_show`.
   Allowed changes (`PATCH /bookings/:id/status`): pending → confirmed, declined, cancelled;
   confirmed → cancelled, completed, no_show. Anything else is 422 on `status`. `completed`
   adds a visit to the provider and the client, `no_show` adds a no-show to the client.
8. Catalogue: `ProviderType` has `shortName` ("Nails", Home tiles) and `pluralName`
   ("Nail artists", search title) next to `name`.
9. Search: `GET /providers/nearby?lat&lng&radiusKm&typeId&sort&q` returns `ProviderCard[]`
   (listed providers only; `q` matches business name, type name and visible service names;
   `sort=rating` breaks ties by distance). `GET /providers/top?lat&lng&limit` is best rated
   first, nearer wins a tie. `ProviderCard` carries `typeId`, `address`, `lat`, `lng`,
   `distanceKm`, `closesAt` (today, null when closed).
10. Provider page: `GET /providers/:id?lat&lng` → `ProviderDetails` = `Provider` without hidden
    services, portfolio sorted by `order`, plus `distanceKm` (null without coordinates) and
    `nextFreeAt` (first free start for the shortest service within 7 days, or null).
    `GET /providers/:id/ratings` → `ProviderRating[]` (stars only, newest first). 404 opens the
    "We can't find this" screen.
11. Free times: `GET /providers/:id/slots?serviceIds=a,b&days=7` → `DaySlots[]` starting today:
    `{ date: 'YYYY-MM-DD', closed, starts: ['HH:mm'] }` in the provider's local time. A start is
    free when the summed duration fits before closing, avoids the break and every
    pending/confirmed booking, on a 15-minute grid, never in the past.
12. Bookings: `POST /bookings { providerId, serviceIds, startsAt }` → 201 `Booking`, status
    `confirmed` when the provider has auto-accept, else `pending`; 422 on `startsAt` when the
    time is no longer free. `GET /bookings?scope=upcoming` = pending/confirmed that are not over
    (soonest first), `scope=past` = everything else (newest first). `Booking` carries
    `providerLat`, `providerLng` and `rating` (the client's stars, null until rated).
    `POST /bookings/:id/rating { stars: 1..5 }` once per completed visit; it moves the
    provider's average.
13. Events: `GET /events/upcoming?limit` → `EventCard[]` that have not ended, soonest first.
14. Provider self-service (all return the full `Provider`): `PATCH /me/provider` also accepts
    `autoAccept` and `workingHours` (422 on `workingHours` when close is not after open or the
    break is outside the day); `POST /me/provider/services { catalogServiceId, durationMin,
description? }` (422 when already listed or not offered for the type; duration 5 to 480 in
    steps of 5; description up to 80); `PATCH` and `DELETE /me/provider/services/:id`
    (`durationMin`, `description`, `hidden`); `POST /me/provider/portfolio` (upload),
    `DELETE /me/provider/portfolio/:id`, `PUT /me/provider/portfolio/order { ids }` (every id
    once; the first becomes the cover). A provider is `listed` once it has a service.
15. Schedule: `GET /me/schedule?days=7` → the provider's `Booking[]` from today, declined and
    cancelled left out. `POST /me/schedule/walk-in { clientName, serviceIds, startsAt }` →
    confirmed booking with `manual: true`; 422 on `startsAt` when it overlaps or the day is closed.
16. Registration creates the provider's business record right away (unlisted, default hours);
    `PUT /providers/me/services` fills its services and lists it.
17. Help texts: `GET /content/faq` → `Faq`, `GET /content/privacy` → `PrivacyPolicy`
    (`src/types/content.ts`), the same texts the web pages show.
18. Language: every request carries `Accept-Language` (`en` or `ru`). Everything the server
    writes comes back in that language: provider type and service names, service descriptions,
    about texts, addresses, event titles, FAQ, privacy policy, and 422 / 404 messages. Search
    `q` matches in the request language too.
19. Any 401 on a request that carried a token signs the user out in the app.
