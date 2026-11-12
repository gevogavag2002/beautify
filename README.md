# Beautify

Mobile app for booking beauty providers (barbers, nail artists, lash and brow, makeup,
cosmetologists). Clients send booking requests, providers accept or decline. Built with
Expo / React Native. Backend (Laravel) and web (Vue 3) live in separate repos.

- Conventions and architecture: `CLAUDE.md`, `.claude/rules/`
- Status, deferred work, backend contract notes: `docs/BACKLOG.md`
- Design: Claude Design canvas linked in `CLAUDE.md`

```bash
pnpm install
cp .env.example .env     # EXPO_PUBLIC_USE_MOCKS=true for offline development
pnpm start               # dev server; open the dev-client app on the phone
pnpm typecheck
```
