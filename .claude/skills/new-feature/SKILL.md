---
name: new-feature
description: Scaffold a new domain feature folder in src/features following the Beautify architecture. Use when adding a new domain (booking, schedule, portfolio, ...) or when the user says "create feature X".
---

# New feature

Create `src/features/<name>/` with this shape. Omit files the feature does not need yet,
but keep the folder names.

```
src/features/<name>/
  screens/<Name>Screen.tsx        # full screen composed from components; default export
  components/                     # feature-only components
  hooks/use<Name>.ts              # TanStack Query hooks wrapping src/api/<name>Api
  types.ts                        # feature types (or re-export from src/types)
  index.ts                        # public exports: screens and hooks only
```

Then:

1. Add `src/api/<name>Api.ts` with methods calling `apiV1` from `@/services/axiosInstance`.
2. Add shared contract types in `src/types/<name>.ts` if the backend returns them.
3. Add route files in the right `app/` group that render the screen (≤10 lines each).
4. Add translation keys to `src/locales/en.json` (and ru, hy) under `<name>.*`.
5. Run `pnpm typecheck`.

Follow `.claude/rules/architecture.md`, `naming.md`, `styling.md`.
