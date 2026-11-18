import type { TFunction } from 'i18next';

import { dayDiff, dayLabel, hhmm } from './format';

/** "Today" / "Tomorrow" / "Thu 5 Nov" */
export const relativeDay = (date: Date | string, t: TFunction) => {
  const diff = dayDiff(date);
  if (diff === 0) return t('common.today');
  if (diff === 1) return t('common.tomorrow');
  return dayLabel(date);
};

/** "Today, 12:30" / "Thu 5 Nov, 10:00" */
export const whenLabel = (iso: string, t: TFunction) => `${relativeDay(iso, t)}, ${hhmm(iso)}`;
