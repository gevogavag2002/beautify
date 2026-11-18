import { Pressable, View } from 'react-native';

import { colors } from '@/theme';

import Icon from './Icon';
import Text from './Text';

type Props = {
  /** Text on the left of the row. */
  label: string;
  /** Current value as shown between the buttons ("30 min", "10:00"). */
  value: string;
  onLess: () => void;
  onMore: () => void;
  lessDisabled?: boolean;
  moreDisabled?: boolean;
  lessLabel: string;
  moreLabel: string;
};

// Row with a label and a − value + control (44px round buttons), as in the service cards.
export default function Stepper({
  label,
  value,
  onLess,
  onMore,
  lessDisabled,
  moreDisabled,
  lessLabel,
  moreLabel,
}: Props) {
  return (
    <View className="flex-row items-center justify-between" style={{ gap: 10, minHeight: 44 }}>
      <Text weight={800} className="flex-1 text-[15px] text-ink" numberOfLines={2}>
        {label}
      </Text>
      <View className="flex-row items-center" style={{ gap: 6, flexShrink: 0 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={lessLabel}
          disabled={lessDisabled}
          onPress={onLess}
          className="items-center justify-center rounded-full bg-ground"
          style={{ width: 44, height: 44 }}
        >
          <Icon
            name="minus"
            size={18}
            color={lessDisabled ? colors.chevron : colors.primary.pressed}
            strokeWidth={2.6}
          />
        </Pressable>
        <Text weight={800} className="text-center text-[16px] text-ink" style={{ minWidth: 64 }}>
          {value}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={moreLabel}
          disabled={moreDisabled}
          onPress={onMore}
          className={`items-center justify-center rounded-full ${moreDisabled ? 'bg-hairline' : 'bg-primary'}`}
          style={{ width: 44, height: 44 }}
        >
          <Icon name="plus" size={18} color={colors.sheet} strokeWidth={2.6} />
        </Pressable>
      </View>
    </View>
  );
}
