import { View } from 'react-native';

import { Icon, Text } from '@/components/ui';
import { colors } from '@/theme';

// Amber star + rating. `pill` adds the amber background used on the Home cards.
export default function RatingValue({ value, pill }: { value: number; pill?: boolean }) {
  const fg = colors.status.pending.fg;
  return (
    <View
      className="flex-row items-center rounded-pill"
      style={[
        { gap: 4, flexShrink: 0 },
        pill && {
          backgroundColor: colors.status.pending.bg,
          paddingVertical: 5,
          paddingHorizontal: 10,
        },
      ]}
    >
      <Icon name="star" size={14} color={fg} filled />
      <Text weight={800} className="text-[14px]" style={{ color: fg }}>
        {value.toFixed(1)}
      </Text>
    </View>
  );
}
