import { Linking, Platform, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Icon, Text } from '@/components/ui';
import { useLocation } from '@/hooks/useLocation';
import { colors } from '@/theme';
import type { Booking } from '@/types';
import { hhmm, shortAddress } from '@/utils/format';
import { distanceKm } from '@/utils/geo';
import { providerTint } from '@/utils/tint';
import { relativeDay } from '@/utils/when';

import StatusChip from './StatusChip';

const openDirections = (b: Booking) => {
  const label = encodeURIComponent(b.providerName);
  const web = `https://www.google.com/maps/search/?api=1&query=${b.providerLat},${b.providerLng}`;
  const native =
    Platform.OS === 'ios'
      ? `maps:0,0?q=${label}@${b.providerLat},${b.providerLng}`
      : `geo:0,0?q=${b.providerLat},${b.providerLng}(${label})`;
  Linking.openURL(native).catch(() => Linking.openURL(web).catch(() => undefined));
};

type Props = {
  booking: Booking;
  /** Shown for upcoming reservations only. */
  onCancel?: () => void;
  onOpenProvider: () => void;
};

// White card from the canvas: status chip + day, time tile tinted by provider type, provider
// and services, then Directions / Cancel for upcoming reservations.
export default function ReservationCard({ booking, onCancel, onOpenProvider }: Props) {
  const { t } = useTranslation();
  const location = useLocation();
  const tint = providerTint(booking.providerId);
  const minutes = booking.services.reduce((sum, s) => sum + s.durationMin, 0);
  const km = distanceKm(location.lat, location.lng, booking.providerLat, booking.providerLng);
  return (
    <View className="bg-sheet" style={{ borderRadius: 22, padding: 16 }}>
      <View className="flex-row items-center justify-between" style={{ gap: 8 }}>
        <StatusChip status={booking.status} />
        <Text weight={700} className="text-[13px] text-muted" numberOfLines={1}>
          {relativeDay(booking.startsAt, t)}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={booking.providerName}
        onPress={onOpenProvider}
        className="flex-row items-center active:opacity-70"
        style={{ marginTop: 12, gap: 12 }}
      >
        <View
          className="items-center justify-center"
          style={{
            width: 64,
            height: 64,
            borderRadius: 18,
            flexShrink: 0,
            backgroundColor: tint.bg,
          }}
        >
          <Text weight={800} className="text-[18px] leading-[20px]" style={{ color: tint.fg }}>
            {hhmm(booking.startsAt)}
          </Text>
          <Text weight={700} className="text-[12px]" style={{ color: tint.fg }}>
            {t('common.min', { value: minutes })}
          </Text>
        </View>
        <View className="flex-1">
          <Text weight={800} className="text-[17px] text-ink" numberOfLines={1}>
            {booking.providerName}
          </Text>
          <Text
            weight={600}
            className="text-[14px] text-muted"
            style={{ marginTop: 2 }}
            numberOfLines={1}
          >
            {booking.services.map((s) => s.name).join(' + ')}
          </Text>
          <Text
            weight={600}
            className="text-[13px] text-muted"
            style={{ marginTop: 2 }}
            numberOfLines={1}
          >
            {`${shortAddress(booking.providerAddress)} · ${t('common.km', { value: km })}`}
          </Text>
        </View>
      </Pressable>

      {onCancel ? (
        <View className="flex-row" style={{ marginTop: 14, gap: 8 }}>
          <Pressable
            accessibilityRole="button"
            onPress={() => openDirections(booking)}
            className="flex-1 flex-row items-center justify-center rounded-pill bg-ground active:bg-primary-soft"
            style={{ height: 44, gap: 6 }}
          >
            <Icon name="pin" size={16} color={colors.primary.pressed} strokeWidth={2.2} />
            <Text weight={800} className="text-[14px] text-primary-pressed">
              {t('reservations.directions')}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={onCancel}
            className="flex-1 items-center justify-center rounded-pill bg-sheet active:bg-status-cancelled-bg"
            style={{ height: 44, borderWidth: 2, borderColor: colors.status.cancelled.bg }}
          >
            <Text weight={800} className="text-[14px] text-status-cancelled-fg">
              {t('reservations.cancel')}
            </Text>
          </Pressable>
        </View>
      ) : booking.rating != null ? (
        <View className="flex-row items-center" style={{ marginTop: 12, gap: 6 }}>
          <Icon name="star" size={14} color={colors.status.pending.fg} filled />
          <Text weight={700} className="text-[13px] text-muted">
            {t('reservations.youRated', { stars: booking.rating })}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
