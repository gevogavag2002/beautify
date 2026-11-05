---
name: new-screen
description: Build a screen from the Beautify design canvas. Use when the user asks to implement a mockup screen (login, home, booking, schedule, ...).
---

# New screen from the design canvas

1. Read the screen from the canvas with the Artifact tool:
   `action: read`, `url: https://claude.ai/artifact/4bB9fUGV8CR9wRwV9C3fUU`,
   `path: <Screen>.dc.html` (e.g. `Login.dc.html`, `Booking.dc.html`, `Schedule.dc.html`).
   The file holds the HTML template and a `renderVals()` script with the screen's state logic.
   Reproduce layout, copy, states and interactions from it; do not invent.
2. Map HTML to RN: `div`→`View`, `p/span/h1`→`Text` from `@/components/ui`, `button`→`Pressable`
   or `Button`, `input`→`Input`, scrollable lists→`FlatList`/`ScrollView`.
3. Put the screen in `src/features/<feature>/screens/<Name>Screen.tsx`; reuse `components/ui`
   primitives, add missing primitives there first.
4. Mock data: keep it in `src/features/<feature>/mock.ts` until the backend endpoint exists,
   behind the same TanStack Query hook signature.
5. Register the route in `app/` and wire navigation targets to the links the canvas uses.
6. Check: `pnpm typecheck`, both light and dark, tap targets ≥44, strings via i18n.

Follow `.claude/rules/*.md`.
