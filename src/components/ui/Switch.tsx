import { Pressable, View } from 'react-native';

import { colors } from '@/theme';

type Props = {
  value: boolean;
  onChange: (value: boolean) => void;
  label: string;
  disabled?: boolean;
};

// 56x34 pill switch from the canvas: lavender track when off, violet when on, white knob.
export default function Switch({ value, onChange, label, disabled }: Props) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={label}
      disabled={disabled}
      onPress={() => onChange(!value)}
      hitSlop={6}
      className="flex-row items-center rounded-pill"
      style={{
        width: 56,
        height: 34,
        padding: 4,
        flexShrink: 0,
        justifyContent: value ? 'flex-end' : 'flex-start',
        backgroundColor: value ? colors.primary.DEFAULT : colors.switchOff,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <View
        className="rounded-full bg-sheet"
        style={{
          width: 26,
          height: 26,
          shadowColor: colors.primary.deep,
          shadowOpacity: 0.2,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
          elevation: 2,
        }}
      />
    </Pressable>
  );
}
