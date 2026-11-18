import { Pressable } from 'react-native';

import { Icon, type IconName } from '@/components/ui';
import { colors } from '@/theme';

type Props = {
  icon: IconName;
  label: string;
  onPress: () => void;
  iconSize?: number;
  strokeWidth?: number;
};

// 44px round button on the violet header (back, share).
export default function RoundButton({
  icon,
  label,
  onPress,
  iconSize = 20,
  strokeWidth = 2.4,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="items-center justify-center rounded-full active:opacity-80"
      style={{ width: 44, height: 44, backgroundColor: colors.primary.tint, flexShrink: 0 }}
    >
      <Icon name={icon} size={iconSize} color={colors.sheet} strokeWidth={strokeWidth} />
    </Pressable>
  );
}
