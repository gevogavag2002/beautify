import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import RoundButton from '@/components/common/RoundButton';
import ScreenState from '@/components/common/ScreenState';
import Toast, { useToast } from '@/components/common/Toast';
import { Icon, Sheet, Text } from '@/components/ui';
import { useProvider } from '@/hooks/useProvider';
import { useSlots } from '@/hooks/useSlots';
import { colors } from '@/theme';
import type { Booking, ProviderDetails, WorkingHours } from '@/types';
import { errorMessage, isNotFound } from '@/utils/apiError';
import {
  addDays,
  atTime,
  dayLabel,
  fromMinutes,
  hhmm,
  localDate,
  toMinutes,
  weekdayShort,
} from '@/utils/format';

import { useCreateBooking, useSetBookingStatus } from '@/hooks/useBookings';

const DOW: (keyof WorkingHours)[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const DAYS = 7;
const GUTTER = 20;

const SectionTitle = ({
  title,
  right,
  rightTone,
}: {
  title: string;
  right?: string;
  rightTone?: 'violet' | 'muted';
}) => (
  <View className="flex-row items-baseline justify-between" style={{ marginBottom: 10, gap: 10 }}>
    <Text weight={800} className="text-[17px] text-ink">
      {title}
    </Text>
    {right ? (
      <Text
        weight={rightTone === 'violet' ? 800 : 700}
        className={
          rightTone === 'violet' ? 'text-[14px] text-primary-pressed' : 'text-[13px] text-muted'
        }
        numberOfLines={1}
        style={{ flexShrink: 1 }}
      >
        {right}
      </Text>
    ) : null}
  </View>
);

function BookingBody({ provider }: { provider: ProviderDetails }) {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const toast = useToast();
  const [picked, setPicked] = useState<string[]>([]);
  const [dayIndex, setDayIndex] = useState(0);
  const [pickedSlot, setPickedSlot] = useState<string | null>(null);
  const [done, setDone] = useState<Booking | null>(null);
  const slots = useSlots(provider.id, picked);
  const create = useCreateBooking();
  const setStatus = useSetBookingStatus();

  const [today] = useState(() => new Date());
  const days = Array.from({ length: DAYS }, (_, i) => {
    const date = addDays(today, i);
    return { date, iso: localDate(date), closed: !provider.workingHours[DOW[date.getDay()]] };
  });
  const chosen = provider.services.filter((s) => picked.includes(s.id));
  const duration = chosen.reduce((sum, s) => sum + s.durationMin, 0);
  const startsFor = (iso: string) =>
    duration > 0 ? (slots.data?.find((d) => d.date === iso)?.starts ?? []) : [];
  const current = days[dayIndex];
  const starts = startsFor(current.iso);
  const slot = pickedSlot && starts.includes(pickedSlot) ? pickedSlot : null;
  const loadingSlots = duration > 0 && slots.isPending;

  const back = () =>
    router.canGoBack()
      ? router.back()
      : router.replace({ pathname: '/(client)/provider/[id]', params: { id: provider.id } });

  let emptyTitle = t('booking.empty.fullTitle');
  let emptyBody = t('booking.empty.fullBody', { min: duration });
  if (duration === 0) {
    emptyTitle = t('booking.empty.noServiceTitle');
    emptyBody = t('booking.empty.noServiceBody');
  } else if (current.closed) {
    emptyTitle = t('booking.empty.closedTitle', {
      day: t(`daysLong.${DOW[current.date.getDay()]}`),
    });
    emptyBody = t('booking.empty.closedBody');
  } else if (slots.isError) {
    emptyTitle = t('common.loadError');
    emptyBody = t('booking.empty.errorBody');
  }

  const range = (start: string) => `${start} – ${fromMinutes(toMinutes(start) + duration)}`;
  const summaryTop = slot
    ? `${dayLabel(current.date)} · ${range(slot)}`
    : duration
      ? t('booking.visit', { min: duration })
      : t('booking.nothing');
  const summaryBottom = chosen.length
    ? `${chosen.map((s) => s.name).join(' + ')} · ${t('booking.payAtVisit')}`
    : t('booking.chooseService');

  const confirm = () => {
    if (!slot || create.isPending) return;
    create.mutate(
      {
        providerId: provider.id,
        serviceIds: picked,
        startsAt: atTime(current.date, slot).toISOString(),
      },
      {
        onSuccess: setDone,
        onError: (e) => {
          toast.show(errorMessage(e, t('booking.failed')));
          setPickedSlot(null);
          slots.refetch();
        },
      },
    );
  };

  // "Change time" in the confirmation sheet: the request is withdrawn and the picker reopens.
  const changeTime = () => {
    if (!done || setStatus.isPending) return;
    setStatus.mutate(
      { id: done.id, status: 'cancelled' },
      {
        onSettled: () => {
          setDone(null);
          setPickedSlot(null);
          slots.refetch();
        },
      },
    );
  };
  const seeReservations = () => {
    setDone(null);
    if (router.canDismiss()) router.dismissAll();
    router.navigate('/(client)/(tabs)/reservations');
  };

  // The sheet reads the saved booking, not the picker: the picked time stops being "free"
  // the moment it is booked.
  const doneTop = done
    ? `${dayLabel(done.startsAt)} · ${hhmm(done.startsAt)} – ${hhmm(done.endsAt)}`
    : '';
  const doneBottom = done
    ? `${done.services.map((x) => x.name).join(' + ')} · ${t('booking.payAtVisit')}`
    : '';

  const col2 = Math.floor((width - GUTTER * 2 - 8) / 2);
  const col4 = Math.floor((width - GUTTER * 2 - 8 * 3) / 4);
  const auto = provider.autoAccept;
  const doneTone = auto ? colors.status.confirmed : colors.status.pending;

  return (
    <View className="flex-1 bg-primary">
      <View
        className="flex-row items-center"
        style={{ paddingTop: insets.top + 16, paddingHorizontal: 16, paddingBottom: 40, gap: 10 }}
      >
        <RoundButton icon="chevronLeft" label={t('common.back')} onPress={back} />
        <View className="flex-1">
          <Text weight={700} className="text-[13px] text-primary-soft" numberOfLines={1}>
            {provider.businessName}
          </Text>
          <Text weight={800} className="text-[20px] leading-[26px] text-sheet" numberOfLines={1}>
            {t('booking.title')}
          </Text>
        </View>
      </View>

      <View className="flex-1 overflow-hidden rounded-t-sheet bg-sheet" style={{ marginTop: -24 }}>
        <ScrollView
          bounces={false}
          overScrollMode="never"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: GUTTER, gap: 18 }}
        >
          <View>
            <SectionTitle
              title={t('booking.services')}
              right={duration ? t('booking.total', { min: duration }) : t('booking.noServices')}
              rightTone="violet"
            />
            <View className="flex-row flex-wrap" style={{ gap: 8 }}>
              {provider.services.map((s) => {
                const sel = picked.includes(s.id);
                return (
                  <Pressable
                    key={s.id}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: sel }}
                    onPress={() =>
                      setPicked((ids) => (sel ? ids.filter((x) => x !== s.id) : [...ids, s.id]))
                    }
                    className="flex-row items-center"
                    style={{
                      width: col2,
                      minHeight: 64,
                      borderRadius: 18,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      gap: 10,
                      backgroundColor: sel ? colors.primary.DEFAULT : colors.ground,
                    }}
                  >
                    <View
                      className="items-center justify-center rounded-full bg-sheet"
                      style={{ width: 26, height: 26, flexShrink: 0 }}
                    >
                      <Icon
                        name={sel ? 'checkWide' : 'plusWide'}
                        size={14}
                        color={colors.primary.DEFAULT}
                        strokeWidth={sel ? 3.2 : 3}
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        weight={800}
                        className={`text-[15px] ${sel ? 'text-sheet' : 'text-ink'}`}
                        numberOfLines={2}
                      >
                        {s.name}
                      </Text>
                      <Text
                        weight={700}
                        className={`text-[13px] ${sel ? 'text-primary-soft' : 'text-muted'}`}
                      >
                        {t('common.min', { value: s.durationMin })}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View>
            <SectionTitle title={t('booking.day')} />
            <View className="flex-row" style={{ gap: 6 }}>
              {days.map((d, i) => {
                const sel = i === dayIndex;
                const free = startsFor(d.iso).length;
                const dot = d.closed
                  ? 'transparent'
                  : sel
                    ? colors.sheet
                    : duration === 0 || loadingSlots
                      ? colors.chevron
                      : free > 0
                        ? colors.status.confirmed.fg
                        : colors.status.cancelled.fg;
                return (
                  <Pressable
                    key={d.iso}
                    accessibilityRole="button"
                    accessibilityState={{ selected: sel, disabled: d.closed }}
                    accessibilityLabel={`${dayLabel(d.date)}, ${
                      d.closed ? t('booking.closed') : t('booking.startTimes', { count: free })
                    }`}
                    disabled={d.closed}
                    onPress={() => setDayIndex(i)}
                    className="flex-1 items-center justify-center"
                    style={{
                      height: 66,
                      borderRadius: 16,
                      gap: 2,
                      backgroundColor: d.closed
                        ? colors.disabled.bg
                        : sel
                          ? colors.primary.DEFAULT
                          : colors.ground,
                    }}
                  >
                    <Text
                      weight={800}
                      className="text-[11px]"
                      numberOfLines={1}
                      style={{ color: d.closed ? colors.chevron : sel ? colors.sheet : colors.ink }}
                    >
                      {i === 0 ? t('common.today') : weekdayShort(d.date)}
                    </Text>
                    <Text
                      weight={800}
                      className="text-[19px] leading-[22px]"
                      style={{ color: d.closed ? colors.chevron : sel ? colors.sheet : colors.ink }}
                    >
                      {d.date.getDate()}
                    </Text>
                    <View
                      key={dot}
                      style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: dot }}
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View>
            <SectionTitle
              title={t('booking.startTime')}
              right={starts.length ? t('booking.freeCount', { count: starts.length }) : undefined}
            />
            {loadingSlots ? (
              <View className="items-center" style={{ paddingVertical: 22 }}>
                <ActivityIndicator color={colors.primary.DEFAULT} />
              </View>
            ) : starts.length > 0 ? (
              <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                {starts.map((s) => {
                  const sel = s === slot;
                  return (
                    <Pressable
                      key={s}
                      accessibilityRole="button"
                      accessibilityState={{ selected: sel }}
                      onPress={() => setPickedSlot(s)}
                      className="items-center justify-center rounded-pill"
                      style={{
                        width: col4,
                        height: 44,
                        backgroundColor: sel ? colors.primary.DEFAULT : colors.ground,
                      }}
                    >
                      <Text
                        weight={800}
                        className={`text-[15px] ${sel ? 'text-sheet' : 'text-ink'}`}
                      >
                        {s}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <View className="items-center rounded-card bg-ground" style={{ padding: 22 }}>
                <Text weight={800} className="text-center text-[16px] text-ink">
                  {emptyTitle}
                </Text>
                <Text
                  weight={600}
                  className="text-center text-[14px] text-muted"
                  style={{ marginTop: 6 }}
                >
                  {emptyBody}
                </Text>
                {slots.isError && duration > 0 && !current.closed ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => slots.refetch()}
                    hitSlop={10}
                    style={{ marginTop: 10 }}
                  >
                    <Text weight={800} className="text-[15px] text-primary-pressed">
                      {t('common.retry')}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            )}
          </View>
        </ScrollView>

        <View
          className="bg-sheet"
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.hairline,
            paddingTop: 12,
            paddingHorizontal: GUTTER,
            paddingBottom: Math.max(insets.bottom, 22),
            gap: 10,
          }}
        >
          <View className="flex-row items-center" style={{ gap: 10 }}>
            <View
              className="items-center justify-center rounded-full bg-primary-soft"
              style={{ width: 40, height: 40, flexShrink: 0 }}
            >
              <Icon name="clock" size={20} color={colors.primary.pressed} strokeWidth={2.2} />
            </View>
            <View className="flex-1">
              <Text weight={800} className="text-[15px] text-ink" numberOfLines={1}>
                {summaryTop}
              </Text>
              <Text weight={600} className="text-[13px] text-muted" numberOfLines={1}>
                {summaryBottom}
              </Text>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            disabled={!slot || create.isPending}
            onPress={confirm}
            className={`items-center justify-center rounded-pill ${
              slot ? 'bg-primary active:bg-primary-pressed' : 'bg-hairline'
            }`}
            style={{ height: 56 }}
          >
            {create.isPending ? (
              <ActivityIndicator color={colors.sheet} />
            ) : (
              <Text
                weight={800}
                className="text-[17px]"
                style={{ color: slot ? colors.sheet : colors.disabled.fg }}
              >
                {slot
                  ? auto
                    ? t('booking.reserveNow')
                    : t('booking.sendRequest')
                  : t('booking.pickTime')}
              </Text>
            )}
          </Pressable>
        </View>
      </View>

      <Toast message={toast.message} bottom={Math.max(insets.bottom, 22) + 140} />

      <Sheet
        open={done != null}
        onClose={() => {
          setDone(null);
          back();
        }}
      >
        {done ? (
          <View className="items-center" style={{ paddingHorizontal: 4 }}>
            <View
              className="items-center justify-center rounded-full"
              style={{ width: 76, height: 76, backgroundColor: doneTone.bg }}
            >
              <Icon name="checkWide" size={36} color={doneTone.fg} strokeWidth={2.6} />
            </View>
            <Text
              weight={800}
              className="text-center text-[24px] text-ink"
              style={{ marginTop: 16 }}
            >
              {auto ? t('booking.done.titleAuto') : t('booking.done.title')}
            </Text>
            <Text
              weight={600}
              className="text-center text-[15px] leading-[22px] text-muted"
              style={{ marginTop: 8 }}
            >
              {auto
                ? t('booking.done.bodyAuto', { name: provider.businessName })
                : t('booking.done.body', { name: provider.businessName })}
            </Text>
            <View
              className="self-stretch bg-ground"
              style={{
                marginTop: 18,
                borderRadius: 18,
                paddingVertical: 14,
                paddingHorizontal: 16,
              }}
            >
              <Text weight={800} className="text-[16px] text-ink">
                {doneTop}
              </Text>
              <Text weight={600} className="text-[14px] text-muted" style={{ marginTop: 2 }}>
                {doneBottom}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={seeReservations}
              className="items-center justify-center self-stretch rounded-pill bg-primary active:bg-primary-pressed"
              style={{ marginTop: 18, height: 56 }}
            >
              <Text weight={800} className="text-[17px] text-sheet">
                {t('booking.done.seeReservations')}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={setStatus.isPending}
              onPress={changeTime}
              className="items-center justify-center self-stretch"
              style={{ marginTop: 8, height: 48 }}
            >
              {setStatus.isPending ? (
                <ActivityIndicator color={colors.primary.DEFAULT} />
              ) : (
                <Text weight={800} className="text-[15px] text-primary-pressed">
                  {t('booking.done.changeTime')}
                </Text>
              )}
            </Pressable>
          </View>
        ) : null}
      </Sheet>
    </View>
  );
}

export default function BookingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useProvider(id);
  return (
    <ScreenState
      loading={query.isPending}
      error={query.isError}
      notFound={isNotFound(query.error)}
      onRetry={query.refetch}
      onBack={() => (router.canGoBack() ? router.back() : router.replace('/(client)/(tabs)'))}
    >
      {query.data ? <BookingBody provider={query.data} /> : null}
    </ScreenState>
  );
}
