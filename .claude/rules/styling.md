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
  matching field (`fieldErrors` in `src/utils/apiError.ts`).

## Sheets, toasts, tabs

- Modal edit flows (change name, phone, password, confirm sign out) use `Sheet` from
  `components/ui`, built on `@gorhom/bottom-sheet`: sized to content (max 92%), drag and
  swipe-down to close, backdrop tap closes, follows the keyboard. Never use RN `Modal` for
  bottom sheets. Inputs inside sheets are `Input` / `TextArea` as usual: they switch to the
  sheet-aware TextInput through `SheetInputContext` automatically.
  Control it only through `open` / `onClose`; never call `present()` / `dismiss()` from a
  screen. `Sheet` mounts its children while visible and unmounts them after the close
  animation, so put form state in a body component and it resets on every open.
- Success feedback is `Toast` + `useToast` from `components/common` (dark pill, mint check,
  auto-hides). No `Alert.alert` for success messages.
- Client tabs live in `app/(client)/_layout.tsx`, provider tabs in `app/(provider)/_layout.tsx`,
  both with the custom `TabBar`; hidden routes in a group get `options={{ href: null }}`.
- Multi-line text uses `TextArea` from `components/ui` (label, optional counter, hint).
- Segmented controls (provider page tabs, sort, Upcoming / Past) are `Segmented` from
  `components/ui` (`tone`: `ground`, `sheet`, `violet`). Steppers and switches are `Stepper`
  and `Switch`.

## Screen skeleton

- Tab and stack screens: `View flex-1 bg-ground` → `ScrollView` (`bounces={false}`,
  `overScrollMode="never"`) with the violet header inside, the rounded sheet overlapping it by
  24, then `<StatusBarBand />` after the ScrollView. The header scrolls with the content; the
  band keeps the status bar readable. Headers pad `insets.top + N`.
- Lists from the backend go through `ListState` (loading, error + Retry, empty). A stack screen
  that cannot render without its data wraps itself in `ScreenState` (pass `notFound` for 404).
- Provider avatars are `ProviderAvatar`: initials via `businessInitials` ("The Fade Room" →
  "FR") and a tint from `providerTint(id)` (stable per provider, no API field).
- Grid cells get `Math.floor`ed widths; a fractional width wraps the last cell on some screens.

## Android pitfall: background added later loses its radius

On Android a view that is first drawn without a background (or transparent) and gets a colour
later is painted with square corners. So never toggle a background on a rounded view through a
class or style (`${on ? 'bg-primary-soft' : ''}`). Mount a separate rounded view for the "on"
state (`Segmented`, the focus halo in `Input`), or give the view a `key` that changes with the
state (`TabBar` pill, day dots). Colour → colour changes are fine.
