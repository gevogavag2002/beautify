import { View } from 'react-native';

import { Icon } from '@/components/ui';
import { colors } from '@/theme';

// Five small stars, the first `value` filled.
export default function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <View
      className="flex-row"
      style={{ gap: 2, flexShrink: 0 }}
      accessibilityLabel={`${value} / 5`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon
          key={n}
          name="star"
          size={size}
          color={n <= value ? colors.status.pending.fg : colors.hairline}
          filled
        />
      ))}
    </View>
  );
}
