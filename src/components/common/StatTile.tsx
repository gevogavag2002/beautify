import { View } from 'react-native';

import { Text } from '@/components/ui';
import { colors } from '@/theme';

// Lighter-violet stat tile on the violet header: small label, big value, optional suffix.
export default function StatTile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <View
      className="flex-1 rounded-[16px]"
      style={{ backgroundColor: colors.primary.tint, paddingVertical: 8, paddingHorizontal: 10 }}
    >
      <Text weight={700} className="text-[12px] text-primary-soft" numberOfLines={1}>
        {label}
      </Text>
      <Text weight={800} className="text-[17px] text-sheet" numberOfLines={1}>
        {value}
        {sub ? (
          <Text weight={700} className="text-[12px] text-primary-soft">
            {' '}
            {sub}
          </Text>
        ) : null}
      </Text>
    </View>
  );
}
