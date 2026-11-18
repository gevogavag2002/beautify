// Icon geometry copied 1:1 from the design canvas SVGs (24x24 viewBox, stroke based).
export type IconShape =
  | { t: 'path'; d: string }
  | { t: 'circle'; cx: number; cy: number; r: number }
  | { t: 'rect'; x: number; y: number; w: number; h: number; rx?: number };

export const icons = {
  store: [
    {
      t: 'path',
      d: 'M6 7h12a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-7a3 3 0 0 1 3-3zM8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
    },
  ],
  pin: [
    {
      t: 'path',
      d: 'M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11zM14.5 10a2.5 2.5 0 1 1-5 0a2.5 2.5 0 1 1 5 0z',
    },
  ],
  textLines: [{ t: 'path', d: 'M4 6h16M4 10h16M4 14h10M4 18h7' }],
  image: [
    { t: 'rect', x: 3, y: 4, w: 18, h: 16, rx: 3 },
    { t: 'circle', cx: 8.5, cy: 9.5, r: 1.8 },
    { t: 'path', d: 'M21 16l-5-5-6 6' },
  ],
  clockRow: [
    { t: 'circle', cx: 12, cy: 12, r: 9 },
    { t: 'path', d: 'M12 7v5l3 2' },
  ],
  home: [
    { t: 'path', d: 'M3 11l9-7 9 7' },
    { t: 'path', d: 'M5 10v10h14V10' },
  ],
  map: [
    { t: 'path', d: 'M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z' },
    { t: 'path', d: 'M9 4v14M15 6v14' },
  ],
  calendar: [
    { t: 'rect', x: 3, y: 5, w: 18, h: 16, rx: 3 },
    { t: 'path', d: 'M8 3v4M16 3v4M3 10h18' },
  ],
  user: [
    { t: 'circle', cx: 12, cy: 8, r: 4 },
    { t: 'path', d: 'M4 21c0-4 3.6-6 8-6s8 2 8 6' },
  ],
  userRow: [{ t: 'path', d: 'M16 8a4 4 0 1 1-8 0a4 4 0 1 1 8 0zM4 21c0-4 3.6-6 8-6s8 2 8 6' }],
  gender: [
    {
      t: 'path',
      d: 'M12.5 8a3.5 3.5 0 1 1-7 0a3.5 3.5 0 1 1 7 0zM2.5 20c0-3.6 2.9-5.5 6.5-5.5s6.5 1.9 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 7M18 14.8c2.1.6 3.5 2.3 3.5 5.2',
    },
  ],
  phoneRow: [
    {
      t: 'path',
      d: 'M9 2.5h6a3 3 0 0 1 3 3v13a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-13a3 3 0 0 1 3-3zM11 18.5h2',
    },
  ],
  mailRow: [
    {
      t: 'path',
      d: 'M6 5h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3zM3.5 7l8.5 6 8.5-6',
    },
  ],
  lock: [
    {
      t: 'path',
      d: 'M7 11h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2zM8 11V8a4 4 0 0 1 8 0v3',
    },
  ],
  star: [
    { t: 'path', d: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z' },
  ],
  help: [
    { t: 'circle', cx: 12, cy: 12, r: 9 },
    { t: 'path', d: 'M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01' },
  ],
  shield: [{ t: 'path', d: 'M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z' }],
  chevronRight: [{ t: 'path', d: 'M9 6l6 6-6 6' }],
  close: [{ t: 'path', d: 'M6 6l12 12M18 6L6 18' }],
  signout: [{ t: 'path', d: 'M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H3' }],
  cameraSmall: [
    { t: 'path', d: 'M4 8h3l2-3h6l2 3h3v11H4z' },
    { t: 'circle', cx: 12, cy: 13, r: 3.5 },
  ],
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
  // client block
  chevronLeft: [{ t: 'path', d: 'M15 6l-6 6 6 6' }],
  filters: [{ t: 'path', d: 'M4 7h16M7 12h10M10 17h4' }],
  share: [{ t: 'path', d: 'M12 15V3M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6' }],
  checkWide: [{ t: 'path', d: 'M4 12.5l5 5L20 6.5' }],
  plusWide: [{ t: 'path', d: 'M12 5v14M5 12h14' }],
  nailsDuo: [
    {
      t: 'path',
      d: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 17l.7 1.8L21.5 19.5l-1.8.7L19 22l-.7-1.8-1.8-.7 1.8-.7z',
    },
  ],
  // provider block
  cup: [
    { t: 'path', d: 'M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 10h1.5a2.5 2.5 0 0 1 0 5H17' },
  ],
  bolt: [{ t: 'path', d: 'M13 3L5 14h6l-1 7 8-11h-6z' }],
  pencil: [{ t: 'path', d: 'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4' }],
  reorder: [{ t: 'path', d: 'M7 4v16M7 4L4 7M7 4l3 3M17 20V4M17 20l-3-3M17 20l3-3' }],
  refresh: [{ t: 'path', d: 'M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7' }],
  globe: [
    { t: 'circle', cx: 12, cy: 12, r: 9 },
    {
      t: 'path',
      d: 'M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9s1.3-6.3 3.8-9z',
    },
  ],
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
