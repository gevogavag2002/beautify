import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import ProviderAvatar from '@/components/common/ProviderAvatar';
import { Icon, Text } from '@/components/ui';
import { colors } from '@/theme';
import type { Booking } from '@/types';
import { dayLabel } from '@/utils/format';

type Props = { booking: Booking; pending: boolean; onRate: (stars: number) => void };

// Violet "How was X?" card for a completed visit that has no rating yet: five star buttons.
export default function RateCard({ booking, pending, onRate }: Props) {
  const { t } = useTranslation();
  const [chosen, setChosen] = useState(0);
  return (
    <View className="bg-primary" style={{ borderRadius: 22, padding: 16 }}>
      <View className="flex-row items-center" style={{ gap: 12 }}>
        <ProviderAvatar
          name={booking.providerName}
          id={booking.providerId}
          size={48}
          fontSize={16}
          onViolet
        />
        <View className="flex-1">
          <Text weight={800} className="text-[16px] text-sheet" numberOfLines={1}>
            {t('reservations.howWas', { name: booking.providerName })}
          </Text>
          <Text
            weight={600}
            className="text-[13px] text-primary-soft"
            style={{ marginTop: 2 }}
            numberOfLines={1}
          >
            {`${booking.services.map((s) => s.name).join(' + ')} · ${dayLabel(booking.startsAt)}`}
          </Text>
        </View>
      </View>
      <View className="flex-row" style={{ marginTop: 14, gap: 6 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable
            key={n}
            accessibilityRole="button"
            accessibilityLabel={t('reservations.stars', { count: n })}
            disabled={pending}
            onPress={() => {
              setChosen(n);
              onRate(n);
            }}
            className="flex-1 items-center justify-center active:opacity-80"
            style={{ height: 44, borderRadius: 14, backgroundColor: colors.primary.tint }}
          >
            <Icon name="star" size={22} color={colors.sheet} strokeWidth={2} filled={n <= chosen} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}
