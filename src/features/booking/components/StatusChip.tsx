import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Icon, Text } from '@/components/ui';
import { colors } from '@/theme';
import type { BookingStatus } from '@/types';

const tone: Record<BookingStatus, { fg: string; bg: string }> = {
  pending: colors.status.pending,
  confirmed: colors.status.confirmed,
  completed: colors.status.confirmed,
  declined: colors.status.cancelled,
  cancelled: colors.status.cancelled,
  no_show: colors.status.noshow,
};

// Status pill of a reservation card: dot for pending, check for confirmed / completed.
export default function StatusChip({ status }: { status: BookingStatus }) {
  const { t } = useTranslation();
  const c = tone[status];
  const check = status === 'confirmed' || status === 'completed';
  return (
    <View
      className="flex-row items-center rounded-pill"
      style={{ gap: 6, paddingVertical: 4, paddingHorizontal: 10, backgroundColor: c.bg }}
    >
      {check ? (
        <Icon name="checkWide" size={12} color={c.fg} strokeWidth={3.4} />
      ) : (
        <View className="rounded-full" style={{ width: 7, height: 7, backgroundColor: c.fg }} />
      )}
      <Text weight={800} className="text-[12px]" style={{ color: c.fg }}>
        {t(`reservations.status.${status}`)}
      </Text>
    </View>
  );
}
