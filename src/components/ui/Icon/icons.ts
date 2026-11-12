// Icon geometry copied 1:1 from the design canvas SVGs (24x24 viewBox, stroke based).
export type IconShape =
  | { t: 'path'; d: string }
  | { t: 'circle'; cx: number; cy: number; r: number }
  | { t: 'rect'; x: number; y: number; w: number; h: number; rx?: number };

export const icons = {
  sparkle: [
    { t: 'path', d: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z' },
    { t: 'path', d: 'M19 16l.7 1.8 1.8.7-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7z' },
  ],
  eyeOpen: [
    {
      t: 'path',
      d: 'M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6zM15 12a3 3 0 1 1-6 0a3 3 0 1 1 6 0z',
    },
  ],
  eyeOff: [
    {
      t: 'path',
      d: 'M3 3l18 18M10.6 6.1A9.8 9.8 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3.2 3.9M6.6 6.6C3.8 8.4 2 12 2 12s3.5 6 10 6c1.6 0 3-.4 4.3-1M9.9 9.9a3 3 0 0 0 4.2 4.2',
    },
  ],
  back: [{ t: 'path', d: 'M15 5l-7 7 7 7' }],
  check: [{ t: 'path', d: 'M5 12l5 5 9-10' }],
  info: [
    { t: 'circle', cx: 12, cy: 12, r: 9 },
    { t: 'path', d: 'M12 11v5M12 8h.01' },
  ],
  camera: [
    { t: 'path', d: 'M4 8h3l2-3h6l2 3h3v11H4z' },
    { t: 'circle', cx: 12, cy: 13, r: 3.5 },
  ],
  chevronDown: [{ t: 'path', d: 'M6 9l6 6 6-6' }],
  phone: [
    { t: 'rect', x: 6, y: 2.5, w: 12, h: 19, rx: 3 },
    { t: 'path', d: 'M11 18.5h2' },
  ],
  clock: [
    { t: 'circle', cx: 12, cy: 12, r: 9 },
    { t: 'path', d: 'M12 7v5l3 2' },
  ],
  mail: [
    { t: 'rect', x: 3, y: 5, w: 18, h: 14, rx: 3 },
    { t: 'path', d: 'M3.5 7l8.5 6 8.5-6' },
  ],
  external: [
    { t: 'path', d: 'M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4' },
  ],
  search: [
    { t: 'circle', cx: 11, cy: 11, r: 7 },
    { t: 'path', d: 'M20 20l-3.5-3.5' },
  ],
  minus: [{ t: 'path', d: 'M6 12h12' }],
  plus: [{ t: 'path', d: 'M12 6v12M6 12h12' }],
  // roles
  client: [
    {
      t: 'path',
      d: 'M3 8a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3zM8 3v4M16 3v4M3 10h18M9 15l2 2 4-4',
    },
  ],
  // provider types (by slug)
  barber: [
    {
      t: 'path',
      d: 'M9 6a3 3 0 1 1-6 0a3 3 0 1 1 6 0zM9 18a3 3 0 1 1-6 0a3 3 0 1 1 6 0zM20 4L8.1 15.9M14.5 14.5L20 20M8.1 8.1L12 12',
    },
  ],
  hair: [
    { t: 'path', d: 'M4 7c3-3 5 3 8 0s5 3 8 0M4 12c3-3 5 3 8 0s5 3 8 0M4 17c3-3 5 3 8 0s5 3 8 0' },
  ],
  nails: [{ t: 'path', d: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z' }],
  lashes: [
    {
      t: 'path',
      d: 'M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6zM14.5 12a2.5 2.5 0 1 1-5 0a2.5 2.5 0 1 1 5 0z',
    },
  ],
  makeup: [{ t: 'path', d: 'M9.5 14.5L3 21M14 4l6 6-7 7-6-6z' }],
  cosmo: [{ t: 'path', d: 'M12 3s6 6.5 6 10a6 6 0 0 1-12 0c0-3.5 6-10 6-10z' }],
} as const satisfies Record<string, readonly IconShape[]>;

export type IconName = keyof typeof icons;
