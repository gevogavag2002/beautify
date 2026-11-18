import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import ListState from '@/components/common/ListState';
import Toast, { useToast } from '@/components/common/Toast';
import StatusBarBand from '@/components/common/StatusBarBand';
import { Icon, Text } from '@/components/ui';
import { useSchedule, useSetBookingStatus } from '@/hooks/useBookings';
import { useMyProvider } from '@/hooks/useMyProvider';
import { useNow } from '@/hooks/useNow';
import { useRefetchOnFocus } from '@/hooks/useRefetchOnFocus';
import { colors } from '@/theme';
import type { Booking, BookingStatus, WorkingHours } from '@/types';
import { errorMessage } from '@/utils/apiError';
import { addDays, dayLabel, hhmm, localDate, weekdayShort } from '@/utils/format';

import WalkInSheet from '../components/WalkInSheet';

const DOW: (keyof WorkingHours)[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const DAYS = 7;

/** "Haircut ×2 + Kids cut" */
const serviceLine = (b: Booking) => {
  const counts = new Map<string, number>();
  for (const s of b.services) counts.set(s.name, (counts.get(s.name) ?? 0) + 1);
  return [...counts].map(([name, n]) => (n > 1 ? `${name} ×${n}` : name)).join(' + ');
};

type ChipTone = { label: string; fg: string; bg: string };

const HeadStat = ({ value, label, amber }: { value: number; label: string; amber?: boolean }) => (
  <View
    className="items-center justify-center"
    style={{
      minWidth: 64,
      height: 50,
      borderRadius: 16,
      paddingHorizontal: 8,
      backgroundColor: amber ? colors.status.pending.bg : colors.primary.tint,
    }}
  >
    <Text
      weight={800}
      className="text-[18px] leading-[20px]"
      style={{ color: amber ? colors.status.pending.fg : colors.sheet }}
    >
      {value}
    </Text>
    <Text
      weight={amber ? 800 : 700}
      className="text-[11px]"
      style={{ color: amber ? colors.status.pending.fg : colors.primary.soft }}
    >
      {label}
    </Text>
  </View>
);

const ActionButton = ({
  label,
  onPress,
  disabled,
  look,
}: {
  label: string;
  onPress: () => void;
  disabled: boolean;
  look: 'decline' | 'accept' | 'noShow' | 'done';
}) => {
  const style = {
    decline: {
      bg: colors.sheet,
      fg: colors.status.cancelled.fg,
      border: colors.status.cancelled.bg,
    },
    accept: { bg: colors.primary.DEFAULT, fg: colors.sheet, border: colors.primary.DEFAULT },
    noShow: { bg: colors.sheet, fg: colors.status.noshow.fg, border: colors.hairline },
    done: {
      bg: colors.status.confirmed.bg,
      fg: colors.status.confirmed.fg,
      border: colors.status.confirmed.bg,
    },
  }[look];
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      className="flex-1 items-center justify-center rounded-pill active:opacity-80"
      style={{
        height: 44,
        borderWidth: 2,
        borderColor: style.border,
        backgroundColor: style.bg,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <Text weight={800} className="text-[14px]" style={{ color: style.fg }} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
};

export default function ScheduleScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const provider = useMyProvider();
  const schedule = useSchedule(DAYS);
  const setStatus = useSetBookingStatus();
  const [dayIndex, setDayIndex] = useState(0);
  const [walkIn, setWalkIn] = useState(false);
  const [today] = useState(() => new Date());
  useRefetchOnFocus(schedule.refetch);
  const now = useNow();

  const p = provider.data;
  const all = schedule.data ?? [];
  const days = Array.from({ length: DAYS }, (_, i) => {
    const date = addDays(today, i);
    const iso = localDate(date);
    return {
      date,
      iso,
      hours: p?.workingHours[DOW[date.getDay()]] ?? null,
      items: all.filter((b) => localDate(new Date(b.startsAt)) === iso),
    };
  });
  const current = days[dayIndex];
  const pendingCount = all.filter((b) => b.status === 'pending').length;
  const visitCount = current.items.filter((b) => b.status !== 'no_show').length;

  const chipFor = (b: Booking): ChipTone => {
    if (b.status === 'pending')
      return { label: t('schedule.chip.request'), ...colors.status.pending };
    if (b.status === 'completed')
      return { label: t('schedule.chip.done'), ...colors.status.confirmed };
    if (b.status === 'no_show')
      return { label: t('schedule.chip.noShow'), ...colors.status.noshow };
    if (b.manual)
      return {
        label: t('schedule.chip.walkIn'),
        fg: colors.primary.pressed,
        bg: colors.primary.soft,
      };
    return { label: t('schedule.chip.confirmed'), ...colors.status.confirmed };
  };

  const decide = (b: Booking, status: BookingStatus) =>
    setStatus.mutate(
      { id: b.id, status },
      {
        onSuccess: () => toast.show(t(`schedule.toast.${status}`, { name: b.clientName })),
        onError: (e) => toast.show(errorMessage(e, t('schedule.failed'))),
      },
    );

  type Row =
    | { kind: 'booking'; key: string; start: string; end: string; booking: Booking }
    | { kind: 'break'; key: string; start: string; end: string };
  const rows: Row[] = current.items.map((b) => ({
    kind: 'booking',
    key: b.id,
    start: hhmm(b.startsAt),
    end: hhmm(b.endsAt),
    booking: b,
  }));
  if (current.hours?.breakStart && current.hours.breakEnd) {
    rows.push({
      kind: 'break',
      key: 'break',
      start: current.hours.breakStart,
      end: current.hours.breakEnd,
    });
  }
  rows.sort((a, b) => a.start.localeCompare(b.start));

  const hoursLine = !current.hours
    ? t('schedule.closed')
    : `${current.hours.open} – ${current.hours.close} · ${
        current.hours.breakStart
          ? t('schedule.breakAt', { time: current.hours.breakStart })
          : t('schedule.noBreak')
      }`;
  const dayTitle =
    dayIndex === 0 ? `${t('common.today')}, ${dayLabel(current.date)}` : dayLabel(current.date);

  return (
    <View className="flex-1 bg-ground">
      <ScrollView bounces={false} overScrollMode="never" showsVerticalScrollIndicator={false}>
        <View
          className="bg-primary"
          style={{ paddingTop: insets.top + 20, paddingHorizontal: 20, paddingBottom: 42 }}
        >
          <View className="flex-row items-center justify-between" style={{ gap: 12 }}>
            <View className="flex-1">
              <Text weight={700} className="text-[13px] text-primary-soft" numberOfLines={1}>
                {p?.businessName ?? ' '}
              </Text>
              <Text
                weight={800}
                className="text-[24px] leading-[30px] text-sheet"
                style={{ marginTop: 2 }}
              >
                {t('schedule.title')}
              </Text>
            </View>
            <View className="flex-row" style={{ gap: 8, flexShrink: 0 }}>
              <HeadStat value={visitCount} label={t('schedule.visits', { count: visitCount })} />
              <HeadStat
                value={pendingCount}
                label={t('schedule.requests', { count: pendingCount })}
                amber
              />
            </View>
          </View>

          <View className="flex-row" style={{ marginTop: 16, gap: 6 }}>
            {days.map((d, i) => {
              const sel = i === dayIndex;
              const hasPending = d.items.some((b) => b.status === 'pending');
              return (
                <Pressable
                  key={d.iso}
                  accessibilityRole="button"
                  accessibilityState={{ selected: sel }}
                  accessibilityLabel={dayLabel(d.date)}
                  onPress={() => setDayIndex(i)}
                  className="flex-1 items-center justify-center"
                  style={{
                    height: 62,
                    borderRadius: 16,
                    gap: 1,
                    backgroundColor: sel ? colors.sheet : colors.primary.tint,
                  }}
                >
                  <Text
                    weight={800}
                    className="text-[11px]"
                    numberOfLines={1}
                    style={{ color: sel ? colors.primary.pressed : colors.sheet }}
                  >
                    {i === 0 ? t('common.today') : weekdayShort(d.date)}
                  </Text>
                  <Text
                    weight={800}
                    className="text-[19px] leading-[22px]"
                    style={{ color: sel ? colors.primary.pressed : colors.sheet }}
                  >
                    {d.date.getDate()}
                  </Text>
                  {/* Keyed: a colour set on an existing transparent view loses its radius. */}
                  <View
                    key={hasPending ? 'dot' : 'none'}
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: 2.5,
                      backgroundColor: hasPending
                        ? sel
                          ? colors.status.pending.fg
                          : colors.amberBright
                        : 'transparent',
                    }}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>

        <View
          className="rounded-t-sheet bg-ground"
          style={{ marginTop: -24, paddingTop: 18, paddingHorizontal: 16, paddingBottom: 16 }}
        >
          <View
            className="flex-row items-center justify-between"
            style={{ marginHorizontal: 4, marginBottom: 12, gap: 8 }}
          >
            <View className="flex-1">
              <Text weight={800} className="text-[18px] text-ink" numberOfLines={1}>
                {dayTitle}
              </Text>
              <Text weight={700} className="text-[13px] text-muted" numberOfLines={1}>
                {p ? hoursLine : ' '}
              </Text>
            </View>
            <Pressable
              // Keyed: Android keeps a square ghost of the first background otherwise.
              key={!p || !current.hours ? 'off' : 'on'}
              accessibilityRole="button"
              disabled={!p || !current.hours}
              onPress={() => setWalkIn(true)}
              className="flex-row items-center active:opacity-80"
              style={{
                height: 44,
                borderRadius: 22,
                paddingLeft: 12,
                paddingRight: 16,
                gap: 6,
                flexShrink: 0,
                backgroundColor: !p || !current.hours ? colors.chevron : colors.primary.DEFAULT,
              }}
            >
              <Icon name="plusWide" size={18} color={colors.sheet} strokeWidth={2.6} />
              <Text weight={800} className="text-[14px] text-sheet">
                {t('schedule.walkInButton')}
              </Text>
            </Pressable>
          </View>

          <ListState
            loading={schedule.isPending || provider.isPending}
            error={schedule.isError || provider.isError}
            onRetry={() => {
              schedule.refetch();
              provider.refetch();
            }}
          >
            <View style={{ gap: 10 }}>
              {!current.hours ? (
                <View
                  className="items-center rounded-card bg-sheet"
                  style={{ paddingVertical: 28, paddingHorizontal: 20 }}
                >
                  <Text weight={800} className="text-center text-[16px] text-ink">
                    {t('booking.empty.closedTitle', {
                      day: t(`daysLong.${DOW[current.date.getDay()]}`),
                    })}
                  </Text>
                  <Text
                    weight={600}
                    className="text-center text-[14px] text-muted"
                    style={{ marginTop: 6 }}
                  >
                    {t('schedule.closedBody')}
                  </Text>
                </View>
              ) : current.items.length === 0 ? (
                <View
                  className="items-center rounded-card bg-sheet"
                  style={{ paddingVertical: 22, paddingHorizontal: 20 }}
                >
                  <Text weight={800} className="text-center text-[16px] text-ink">
                    {t('schedule.quietTitle')}
                  </Text>
                  <Text
                    weight={600}
                    className="text-center text-[14px] text-muted"
                    style={{ marginTop: 6 }}
                  >
                    {t('schedule.quietBody')}
                  </Text>
                </View>
              ) : null}

              {current.hours
                ? rows.map((row) => (
                    <View key={row.key} className="flex-row" style={{ gap: 10 }}>
                      <View style={{ width: 46, flexShrink: 0, paddingTop: 10 }}>
                        <Text weight={800} className="text-right text-[14px] text-ink">
                          {row.start}
                        </Text>
                        <Text weight={700} className="text-right text-[12px] text-muted">
                          {row.end}
                        </Text>
                      </View>
                      {row.kind === 'break' ? (
                        <View
                          className="flex-1 flex-row items-center"
                          style={{
                            height: 44,
                            borderRadius: 16,
                            borderWidth: 2,
                            borderStyle: 'dashed',
                            borderColor: colors.dash.soft,
                            paddingHorizontal: 14,
                            gap: 8,
                          }}
                        >
                          <Icon name="cup" size={16} color={colors.muted} strokeWidth={2.2} />
                          <Text weight={800} className="text-[14px] text-muted">
                            {t('schedule.break')}
                          </Text>
                        </View>
                      ) : (
                        (() => {
                          const b = row.booking;
                          const chip = chipFor(b);
                          const past = Date.parse(b.endsAt) < now;
                          return (
                            <View
                              className="flex-1 bg-sheet"
                              style={{
                                borderRadius: 18,
                                paddingVertical: 12,
                                paddingHorizontal: 14,
                              }}
                            >
                              <View
                                className="flex-row items-center justify-between"
                                style={{ gap: 8 }}
                              >
                                <Text
                                  weight={800}
                                  className="flex-1 text-[16px] text-ink"
                                  numberOfLines={1}
                                >
                                  {b.manual
                                    ? t('schedule.walkInName', { name: b.clientName })
                                    : b.clientName}
                                </Text>
                                <View
                                  className="rounded-pill"
                                  style={{
                                    flexShrink: 0,
                                    paddingVertical: 3,
                                    paddingHorizontal: 9,
                                    backgroundColor: chip.bg,
                                  }}
                                >
                                  <Text
                                    weight={800}
                                    className="text-[12px]"
                                    style={{ color: chip.fg }}
                                  >
                                    {chip.label}
                                  </Text>
                                </View>
                              </View>
                              <Text
                                weight={600}
                                className="text-[13px] text-muted"
                                style={{ marginTop: 2 }}
                                numberOfLines={2}
                              >
                                {serviceLine(b)}
                              </Text>
                              {b.status === 'pending' ? (
                                <View className="flex-row" style={{ marginTop: 10, gap: 8 }}>
                                  <ActionButton
                                    look="decline"
                                    label={t('schedule.decline')}
                                    disabled={setStatus.isPending}
                                    onPress={() => decide(b, 'declined')}
                                  />
                                  <ActionButton
                                    look="accept"
                                    label={t('schedule.accept')}
                                    disabled={setStatus.isPending}
                                    onPress={() => decide(b, 'confirmed')}
                                  />
                                </View>
                              ) : b.status === 'confirmed' && past ? (
                                <View className="flex-row" style={{ marginTop: 10, gap: 8 }}>
                                  <ActionButton
                                    look="noShow"
                                    label={t('schedule.noShow')}
                                    disabled={setStatus.isPending}
                                    onPress={() => decide(b, 'no_show')}
                                  />
                                  <ActionButton
                                    look="done"
                                    label={t('schedule.markDone')}
                                    disabled={setStatus.isPending}
                                    onPress={() => decide(b, 'completed')}
                                  />
                                </View>
                              ) : null}
                            </View>
                          );
                        })()
                      )}
                    </View>
                  ))
                : null}
            </View>
          </ListState>
        </View>
      </ScrollView>
      <StatusBarBand />

      <Toast message={toast.message} />

      {p ? (
        <WalkInSheet
          open={walkIn}
          onClose={() => setWalkIn(false)}
          onDone={(message) => {
            setWalkIn(false);
            toast.show(message);
          }}
          provider={p}
          date={current.date}
        />
      ) : null}
    </View>
  );
}
