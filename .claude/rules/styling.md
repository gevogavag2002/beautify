# Styling (NativeWind)

- Use `className` with Tailwind classes. Use `style={}` only for values Tailwind cannot
  express (animated values, measured layout).
- Tokens live in `src/theme/tokens.js` and are wired into `tailwind.config.js`. Use the
  token classes: `bg-ground`, `bg-sheet`, `bg-primary`, `text-ink`, `text-muted`,
  `border-hairline`, `rounded-card`, `rounded-sheet`, `rounded-pill`, `rounded-input`.
- Fonts: Nunito only. `font-sans` 400, `font-semibold` 600, `font-bold` 700,
  `font-extrabold` 800.
- Touch targets at least 44x44 (`min-h-11 min-w-11`). Text contrast at least 4.5:1.
- Status chips use the `status.*` token pairs (pending amber, confirmed mint, cancelled rose,
  no_show grey).
- Screens: ground background `#F4F2FF`, cards on `sheet` white, primary violet header with a
  28px rounded sheet overlapping it (see design canvas).
- Dark mode via `dark:` classes and `themeStore`; every new screen must look right in both.
