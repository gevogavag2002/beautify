import { useState } from 'react';
import { ActivityIndicator, Pressable, useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button, Input, Sheet, Text } from '@/components/ui';
import { useAddWalkIn } from '@/hooks/useBookings';
import { useSlots } from '@/hooks/useSlots';
import { colors } from '@/theme';
import type { Provider } from '@/types';
import { fieldErrors } from '@/utils/apiError';
import { atTime, dayLabel, localDate } from '@/utils/format';

type Props = {
  open: boolean;
  onClose: () => void;
  onDone: (message: string) => void;
  provider: Provider;
  /** Day the walk-in is added to (the day selected on the schedule). */
  date: Date;
};

// Reservation the provider adds for a client who walked in or called: name, services and
// one of the free start times of the selected day.
export default function WalkInSheet({ open, onClose, onDone, provider, date }: Props) {
  const { t } = useTranslation();
  return (
    <Sheet open={open} title={t('schedule.walkIn.title')} onClose={onClose}>
      <WalkInBody onDone={onDone} provider={provider} date={date} />
    </Sheet>
  );
}

const Label = ({ text, right }: { text: string; right?: string }) => (
  <View className="flex-row items-baseline justify-between" style={{ gap: 8, marginBottom: -6 }}>
    <Text weight={800} className="text-[14px] leading-[18px] text-ink">
      {text}
    </Text>
    {right ? (
      <Text weight={700} className="text-[13px] text-muted" numberOfLines={1}>
        {right}
      </Text>
    ) : null}
  </View>
);

function WalkInBody({ onDone, provider, date }: Pick<Props, 'onDone' | 'provider' | 'date'>) {
  const { t } = useTranslation();
  const add = useAddWalkIn();
  const { width } = useWindowDimensions();
  // Four equal pills per row across the sheet (20px gutters, 8px gaps), as on Booking.
  const pill = Math.floor((width - 40 - 8 * 3) / 4);
  const [name, setName] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const [pickedSlot, setPickedSlot] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const slots = useSlots(provider.id, picked);

  const duration = provider.services
    .filter((s) => picked.includes(s.id))
    .reduce((sum, s) => sum + s.durationMin, 0);
  const starts =
    picked.length > 0 ? (slots.data?.find((d) => d.date === localDate(date))?.starts ?? []) : [];
  const slot = pickedSlot && starts.includes(pickedSlot) ? pickedSlot : null;

  const submit = () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.clientName = t('schedule.walkIn.nameRequired');
    if (picked.length === 0) next.serviceIds = t('schedule.walkIn.serviceRequired');
    else if (!slot) next.startsAt = t('schedule.walkIn.timeRequired');
    setErrors(next);
    if (Object.keys(next).length || !slot) return;
    add.mutate(
      { clientName: name.trim(), serviceIds: picked, startsAt: atTime(date, slot).toISOString() },
      {
        onSuccess: () => onDone(t('schedule.walkIn.toast')),
        onError: (e) => {
          setErrors(fieldErrors(e, t('common.checkForm')));
          slots.refetch();
        },
      },
    );
  };

  return (
    <>
      <Input
        label={t('schedule.walkIn.name')}
        placeholder={t('schedule.walkIn.namePlaceholder')}
        value={name}
        onChangeText={setName}
        error={errors.clientName}
        autoCapitalize="words"
        maxLength={40}
        height={48}
      />

      <Label
        text={t('schedule.walkIn.services')}
        right={duration ? t('booking.total', { min: duration }) : undefined}
      />
      {provider.services.length === 0 ? (
        <Text weight={600} className="text-[14px] text-muted">
          {t('schedule.walkIn.noServices')}
        </Text>
      ) : (
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
                className="items-center justify-center rounded-pill"
                style={{
                  minHeight: 44,
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  backgroundColor: sel ? colors.primary.DEFAULT : colors.ground,
                }}
              >
                <Text weight={800} className={`text-[14px] ${sel ? 'text-sheet' : 'text-ink'}`}>
                  {`${s.name} · ${t('common.min', { value: s.durationMin })}`}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
      {errors.serviceIds ? (
        <Text weight={700} className="text-[13px] text-status-cancelled-fg">
          {errors.serviceIds}
        </Text>
      ) : null}

      <Label text={t('schedule.walkIn.time')} right={dayLabel(date)} />
      {picked.length === 0 ? (
        <Text weight={600} className="text-[14px] text-muted">
          {t('booking.empty.noServiceBody')}
        </Text>
      ) : slots.isPending ? (
        <ActivityIndicator color={colors.primary.DEFAULT} />
      ) : starts.length === 0 ? (
        <Text weight={600} className="text-[14px] text-muted">
          {t('booking.empty.fullBody', { min: duration })}
        </Text>
      ) : (
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
                  width: pill,
                  height: 44,
                  backgroundColor: sel ? colors.primary.DEFAULT : colors.ground,
                }}
              >
                <Text weight={800} className={`text-[15px] ${sel ? 'text-sheet' : 'text-ink'}`}>
                  {s}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
      {(errors.startsAt ?? errors.form) ? (
        <Text weight={700} className="text-[13px] text-status-cancelled-fg">
          {errors.startsAt ?? errors.form}
        </Text>
      ) : null}

      <Button label={t('schedule.walkIn.cta')} onPress={submit} disabled={add.isPending} />
    </>
  );
}
