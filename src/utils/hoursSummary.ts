import type { TFunction } from 'i18next';

import type { WorkingDay, WorkingHours } from '@/types';

const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri'] as const;

const same = (a: WorkingDay, b: WorkingDay) =>
  a === b ||
  (!!a &&
    !!b &&
    a.open === b.open &&
    a.close === b.close &&
    a.breakStart === b.breakStart &&
    a.breakEnd === b.breakEnd);

/**
 * Two lines for the Working hours row, as on the canvas:
 * "Mon – Fri 10:00 – 20:00" / "Break 14:00 – 14:30 · Sat to 16:00 · Sun closed".
 * `showBreak: false` leaves the break out (provider profile row).
 * When the weekdays differ the first line falls back to a count of open days.
 */
export const hoursSummary = (hours: WorkingHours, t: TFunction, showBreak = true) => {
  const first = hours.mon;
  const uniform = !!first && WEEKDAYS.every((d) => same(hours[d], first));
  const weekend = (key: 'sat' | 'sun') => {
    const day = hours[key];
    const name = t(`days.${key}`);
    if (!day) return t('services.hours.dayClosed', { day: name });
    if (uniform && first && day.open === first.open) {
      return t('services.hours.dayTo', { day: name, close: day.close });
    }
    return `${name} ${day.open} – ${day.close}`;
  };
  if (uniform && first) {
    const parts = [weekend('sat'), weekend('sun')];
    if (showBreak && first.breakStart && first.breakEnd) {
      parts.unshift(t('services.hours.break', { start: first.breakStart, end: first.breakEnd }));
    }
    return {
      title: `${t('days.mon')} – ${t('days.fri')} ${first.open} – ${first.close}`,
      sub: parts.join(' · '),
    };
  }
  const open = Object.values(hours).filter(Boolean).length;
  return {
    title: t('services.hours.openDays', { count: open }),
    sub: t('services.hours.varies'),
  };
};
