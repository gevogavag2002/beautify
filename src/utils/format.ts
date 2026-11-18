// "+37491204482" -> "+374 91 204 482". Armenian numbers only for now; other countries
// fall back to the raw E.164 string.
export const prettyPhone = (e164: string) => {
  const m = /^\+374(\d{2})(\d{3})(\d{3})$/.exec(e164);
  return m ? `+374 ${m[1]} ${m[2]} ${m[3]}` : e164;
};

export const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

const FILLER = new Set(['the', 'a', 'an', 'it', 'of', 'and', '&']);

/** Business initials as on the canvas: "The Fade Room" -> "FR", "Nailed It Studio" -> "NS". */
export const businessInitials = (name: string) => {
  const words = name.trim().split(/\s+/);
  const main = words.filter((w) => !FILLER.has(w.toLowerCase()));
  return initials((main.length ? main : words).join(' '));
};

// Locale for every date helper below; i18n keeps it equal to the app language.
let dateLocale = 'en';
export const setDateLocale = (locale: string) => {
  dateLocale = locale;
};
export const getDateLocale = () => dateLocale;

export const monthYear = (iso: string, locale = dateLocale) =>
  new Date(iso).toLocaleDateString(locale, { month: 'long', year: 'numeric' });

export const monthName = (iso: string, locale = dateLocale) =>
  new Date(iso).toLocaleDateString(locale, { month: 'long' });

const pad = (n: number) => String(n).padStart(2, '0');

/** Local calendar date as 'YYYY-MM-DD'. */
export const localDate = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Local time as 'HH:mm'. */
export const hhmm = (d: Date | string) => {
  const x = typeof d === 'string' ? new Date(d) : d;
  return `${pad(x.getHours())}:${pad(x.getMinutes())}`;
};

export const toMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

export const fromMinutes = (min: number) => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;

/** Local date + 'HH:mm' as a Date. */
export const atTime = (date: Date, time: string) => {
  const [h, m] = time.split(':').map(Number);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, m, 0, 0);
};

export const addDays = (d: Date, days: number) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);

/** Whole days from today to `d` (0 today, 1 tomorrow, -1 yesterday). */
export const dayDiff = (d: Date | string, now = new Date()) => {
  const x = typeof d === 'string' ? new Date(d) : d;
  const a = new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const b = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round((a - b) / 86400000);
};

/** "Thu" */
const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** "Thu"; capitalised in every language ("Чт"), since it labels day chips and cards. */
export const weekdayShort = (d: Date | string, locale = dateLocale) =>
  capitalize(new Date(d).toLocaleDateString(locale, { weekday: 'short' }));

/** "Nov" */
export const monthShort = (d: Date | string, locale = dateLocale) =>
  new Date(d).toLocaleDateString(locale, { month: 'short' });

/** "Thu 5 Nov" */
export const dayLabel = (d: Date | string, locale = dateLocale) => {
  const x = new Date(d);
  return `${weekdayShort(x, locale)} ${x.getDate()} ${monthShort(x, locale)}`;
};

/** "12 Tumanyan St, Yerevan" -> "12 Tumanyan St" */
export const shortAddress = (address: string) => address.split(',')[0].trim();
