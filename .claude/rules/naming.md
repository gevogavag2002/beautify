# Naming

- Folders: `camelCase` (`features/booking`, `components/ui/statusBadge`).
- Component files: `PascalCase.tsx`; the component is the default export and has the same name.
- Hooks: `useSomething.ts`. Stores: `somethingStore.ts`. API objects: `somethingApi.ts`.
- Types next to a component: `Something.types.ts`. Shared types: `src/types/<domain>.ts`.
- Route files in `app/` follow Expo Router: lowercase, `[id].tsx` for params, `_layout.tsx`,
  groups in parentheses `(client)`.
- Translation keys: `feature.screen.element` (`booking.pickTime.cta`).
- Booking statuses, exactly these strings everywhere (match backend):
  `pending | confirmed | declined | cancelled | completed | no_show`.
- Roles: `client | provider | admin`. Provider types and the service catalogue come from the
  backend (admin-managed), never hardcode them as the source of truth.
- Every key exists in both `src/locales/en.json` and `src/locales/ru.json`. Counted strings use
  i18next plural suffixes: `_one`, `_other` in English; `_one`, `_few`, `_many`, `_other` in
  Russian. Never glue a number to a noun in code, and never build a phrase from pieces whose
  grammar differs per language (case endings): give each language its own full sentence.
- Dates and weekdays go through `src/utils/format.ts` (they follow the app language); day
  names in sentences come from the `days.*` / `daysLong.*` keys.
