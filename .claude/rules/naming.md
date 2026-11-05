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
