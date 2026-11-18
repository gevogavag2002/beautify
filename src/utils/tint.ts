import { colors } from '@/theme';

// Avatar tints from the canvas, in the order the hash below maps to.
const palette = [
  colors.accent.rose,
  { bg: colors.primary.soft, fg: colors.primary.pressed },
  colors.accent.amber,
  colors.accent.sky,
  colors.accent.mint,
] as { bg: string; fg: string }[];

/**
 * Stable tint for a provider without a photo. Derived from the id so the same provider has
 * the same colour on every screen and device, with no extra field in the API.
 */
export const providerTint = (id: string) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 104 + id.charCodeAt(i)) % 4294967296;
  return palette[h % palette.length];
};
