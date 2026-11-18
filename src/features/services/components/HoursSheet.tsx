import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button, Sheet, Stepper, Switch, Text } from '@/components/ui';
import { useUpdateMyProvider } from '@/hooks/useMyProvider';
import { colors } from '@/theme';
import type { Provider, WorkingDay, WorkingHours } from '@/types';
import { fieldErrors } from '@/utils/apiError';
import { fromMinutes, toMinutes } from '@/utils/format';

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
type DayKey = (typeof DAYS)[number];
const STEP = 30;
const BREAK_STEP = 15;
const DEFAULT_DAY = { open: '10:00', close: '19:00' };

type Props = {
  open: boolean;
  onClose: () => void;
  onDone: (message: string) => void;
  provider: Provider;
};

// Working hours editor: pick a day, switch it open or closed, step the opening and closing
// time by 30 minutes, optionally add a break. One Save for the whole week.
export default function HoursSheet({ open, onClose, onDone, provider }: Props) {
  const { t } = useTranslation();
  return (
    <Sheet open={open} title={t('services.hours.title')} onClose={onClose}>
      <HoursBody provider={provider} onDone={onDone} />
    </Sheet>
  );
}

const shift = (time: string, by: number) => fromMinutes(toMinutes(time) + by);

function HoursBody({ provider, onDone }: Pick<Props, 'provider' | 'onDone'>) {
  const { t } = useTranslation();
  const update = useUpdateMyProvider();
  const [hours, setHours] = useState<WorkingHours>(provider.workingHours);
  const [day, setDay] = useState<DayKey>('mon');
  const [error, setError] = useState<string | undefined>();
  const current = hours[day];

  const setCurrent = (value: WorkingDay) => setHours((h) => ({ ...h, [day]: value }));
  const patch = (p: Partial<NonNullable<WorkingDay>>) =>
    current && setCurrent({ ...current, ...p });
  const hasBreak = !!current?.breakStart && !!current.breakEnd;

  const toggleBreak = (on: boolean) => {
    if (!current) return;
    if (!on) {
      setCurrent({ open: current.open, close: current.close });
      return;
    }
    // Middle of the day, snapped to the half hour, 30 minutes long.
    const mid = Math.round((toMinutes(current.open) + toMinutes(current.close)) / 2 / 30) * 30;
    setCurrent({ ...current, breakStart: fromMinutes(mid), breakEnd: fromMinutes(mid + 30) });
  };
  // Changing opening or closing time drops a break that no longer fits inside the day.
  const setEdge = (edge: 'open' | 'close', value: string) => {
    if (!current) return;
    const next = { ...current, [edge]: value };
    const fits =
      !next.breakStart ||
      !next.breakEnd ||
      (next.breakStart >= next.open && next.breakEnd <= next.close);
    setCurrent(fits ? next : { open: next.open, close: next.close });
  };
  const applyToOpenDays = () =>
    setHours((h) => {
      const out = { ...h };
      for (const d of DAYS) if (out[d]) out[d] = current ? { ...current } : null;
      return out;
    });

  const save = () =>
    update.mutate(
      { workingHours: hours },
      {
        onSuccess: () => onDone(t('services.hours.toast')),
        onError: (e) => {
          const f = fieldErrors(e, t('common.checkForm'));
          setError(f.workingHours ?? f.form);
        },
      },
    );

  return (
    <>
      <View className="flex-row" style={{ gap: 6 }} accessibilityRole="tablist">
        {DAYS.map((d) => {
          const sel = d === day;
          const isOpen = !!hours[d];
          return (
            <Pressable
              key={d}
              accessibilityRole="tab"
              accessibilityState={{ selected: sel }}
              accessibilityLabel={t(`days.${d}`)}
              onPress={() => setDay(d)}
              className="flex-1 items-center justify-center"
              style={{
                height: 52,
                borderRadius: 14,
                gap: 3,
                backgroundColor: sel ? colors.primary.DEFAULT : colors.ground,
              }}
            >
              <Text
                weight={800}
                className="text-[13px]"
                style={{ color: sel ? colors.sheet : isOpen ? colors.ink : colors.chevron }}
              >
                {t(`days.${d}`)}
              </Text>
              <View
                key={`${sel}-${isOpen}`}
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 2.5,
                  backgroundColor: sel
                    ? colors.sheet
                    : isOpen
                      ? colors.status.confirmed.fg
                      : colors.chevron,
                }}
              />
            </Pressable>
          );
        })}
      </View>

      <View className="flex-row items-center" style={{ gap: 12, minHeight: 44 }}>
        <Text weight={800} className="flex-1 text-[15px] text-ink">
          {t('services.hours.openDay', { day: t(`daysLong.${day}`) })}
        </Text>
        <Switch
          value={!!current}
          onChange={(on) => setCurrent(on ? { ...DEFAULT_DAY } : null)}
          label={t('services.hours.openDay', { day: t(`daysLong.${day}`) })}
        />
      </View>

      {current ? (
        <>
          <Stepper
            label={t('services.hours.opens')}
            value={current.open}
            onLess={() => setEdge('open', shift(current.open, -STEP))}
            onMore={() => setEdge('open', shift(current.open, STEP))}
            lessDisabled={toMinutes(current.open) <= 0}
            moreDisabled={toMinutes(current.open) + STEP >= toMinutes(current.close)}
            lessLabel={t('services.hours.earlier')}
            moreLabel={t('services.hours.later')}
          />
          <Stepper
            label={t('services.hours.closes')}
            value={current.close}
            onLess={() => setEdge('close', shift(current.close, -STEP))}
            onMore={() => setEdge('close', shift(current.close, STEP))}
            lessDisabled={toMinutes(current.close) - STEP <= toMinutes(current.open)}
            moreDisabled={toMinutes(current.close) + STEP > 24 * 60 - 30}
            lessLabel={t('services.hours.earlier')}
            moreLabel={t('services.hours.later')}
          />
          <View className="flex-row items-center" style={{ gap: 12, minHeight: 44 }}>
            <Text weight={800} className="flex-1 text-[15px] text-ink">
              {t('services.hours.hasBreak')}
            </Text>
            <Switch value={hasBreak} onChange={toggleBreak} label={t('services.hours.hasBreak')} />
          </View>
          {current.breakStart && current.breakEnd ? (
            <>
              <Stepper
                label={t('services.hours.breakStarts')}
                value={current.breakStart}
                onLess={() => patch({ breakStart: shift(current.breakStart!, -BREAK_STEP) })}
                onMore={() => patch({ breakStart: shift(current.breakStart!, BREAK_STEP) })}
                lessDisabled={toMinutes(current.breakStart) - BREAK_STEP < toMinutes(current.open)}
                moreDisabled={
                  toMinutes(current.breakStart) + BREAK_STEP >= toMinutes(current.breakEnd)
                }
                lessLabel={t('services.hours.earlier')}
                moreLabel={t('services.hours.later')}
              />
              <Stepper
                label={t('services.hours.breakEnds')}
                value={current.breakEnd}
                onLess={() => patch({ breakEnd: shift(current.breakEnd!, -BREAK_STEP) })}
                onMore={() => patch({ breakEnd: shift(current.breakEnd!, BREAK_STEP) })}
                lessDisabled={
                  toMinutes(current.breakEnd) - BREAK_STEP <= toMinutes(current.breakStart)
                }
                moreDisabled={toMinutes(current.breakEnd) + BREAK_STEP > toMinutes(current.close)}
                lessLabel={t('services.hours.earlier')}
                moreLabel={t('services.hours.later')}
              />
            </>
          ) : null}
          <Pressable
            accessibilityRole="button"
            onPress={applyToOpenDays}
            className="items-center justify-center"
            style={{ height: 44 }}
          >
            <Text weight={800} className="text-[15px] text-primary-pressed">
              {t('services.hours.applyAll')}
            </Text>
          </Pressable>
        </>
      ) : null}

      {error ? (
        <Text weight={700} className="text-[13px] text-status-cancelled-fg">
          {error}
        </Text>
      ) : null}
      <Button label={t('common.save')} onPress={save} disabled={update.isPending} />
    </>
  );
}
