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

## Screens with inputs

- Any screen with a TextInput is built on `src/components/common/FormScreen.tsx`
  (`header` = violet band that scrolls with the sheet, optional sticky `footer`). It handles the
  keyboard on both platforms, scroll when content no longer fits, and safe areas. No custom keyboard-dismiss behavior (platform default only).
  Never hand-roll KeyboardAvoidingView + ScrollView in a screen.
- Text and TextInput cap font scaling at 1.3x (`maxFontSizeMultiplier`) so system font sizes
  do not break layouts; keep that when adding new text primitives.
- In rows that mix text and controls, give the text `flex-1` + `numberOfLines` and the control
  `flexShrink: 0`. Long names, long emails and 2-line hints must never push controls off screen.
- Every list from the backend has three states: loading (`ActivityIndicator`), error with
  Retry, empty. Every form validates client-side before submit and shows 422 errors under the
  matching field (`fieldErrors` in `src/features/auth/hooks/useAuth.ts`).
