import { View } from 'react-native';

import { Icon, Text } from '@/components/ui';
import { colors } from '@/theme';

type Props = { text: string; bg?: 'sheet' | 'ground'; size?: 14 | 13; className?: string };

// Rounded note with an info icon (role screen, phone and email steps).
export default function InfoNote({ text, bg = 'ground', size = 13, className = '' }: Props) {
  return (
    <View
      className={`flex-row items-start rounded-[16px] p-[14px] ${bg === 'sheet' ? 'bg-sheet' : 'bg-ground'} ${className}`}
      style={{ gap: 10 }}
    >
      <Icon
        name="info"
        size={20}
        color={colors.primary.pressed}
        strokeWidth={2.2}
        style={{ marginTop: 1 }}
      />
      <Text
        weight={600}
        className="flex-1 text-[#4A4562]"
        style={{ fontSize: size, lineHeight: size === 14 ? 20 : 19 }}
      >
        {text}
      </Text>
    </View>
  );
}
