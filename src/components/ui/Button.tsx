import { Pressable, type PressableProps } from 'react-native';

import Text from './Text';

type Props = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  height?: 56 | 54 | 48;
  className?: string;
};

// Pill buttons from the canvas: primary violet, secondary white with violet border,
// disabled grey. Text 17/800 (16 when disabled, as in PickServices).
export default function Button({
  label,
  variant = 'primary',
  disabled,
  height = 56,
  className = '',
  ...rest
}: Props) {
  const base = 'items-center justify-center rounded-pill';
  const look = disabled
    ? 'bg-hairline'
    : variant === 'primary'
      ? 'bg-primary active:bg-primary-pressed'
      : 'bg-sheet border-2 border-primary active:bg-primary-soft';
  const text = disabled
    ? 'text-[#5A5478]'
    : variant === 'primary'
      ? 'text-sheet'
      : 'text-primary-pressed';
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      className={`${base} ${look} ${className}`}
      style={{ height }}
      {...rest}
    >
      <Text weight={800} className={`${disabled ? 'text-[16px]' : 'text-[17px]'} ${text}`}>
        {label}
      </Text>
    </Pressable>
  );
}
