import { Pressable, View } from 'react-native';

import { Icon, Text, type IconName } from '@/components/ui';
import { icons } from '@/components/ui/Icon';
import { colors } from '@/theme';
import type { ProviderType } from '@/types';

// Icon and tint per provider type, keyed by slug (types themselves come from the backend).
export const typeTint: Record<string, { bg: string; fg: string }> = {
  barber: { bg: colors.primary.soft, fg: colors.primary.pressed },
  hair: colors.accent.amber,
  nails: colors.accent.rose,
  lashes: colors.accent.mint,
  makeup: colors.accent.amber,
  cosmo: colors.accent.sky,
};
export const typeIcon = (slug: string): IconName =>
  slug in icons ? (slug as IconName) : 'sparkle';
export const tintFor = (slug: string) => typeTint[slug] ?? typeTint.barber;

type Props = {
  type: ProviderType;
  selected: boolean;
  onPress: () => void;
  /** Unselected background: white on the Role screen, white on sheets too. */
  width?: number | `${number}%`;
};

// 60px radio card: 40px tinted icon circle + name 15/800; selected = violet border, #F7F5FF bg.
export default function ProviderTypeCard({ type, selected, onPress, width = '48.5%' }: Props) {
  const tint = tintFor(type.slug);
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      className="flex-row items-center"
      style={{
        width,
        height: 60,
        borderRadius: 18,
        borderWidth: 2,
        paddingHorizontal: 10,
        gap: 10,
        borderColor: selected ? colors.primary.DEFAULT : colors.hairline,
        backgroundColor: selected ? '#F7F5FF' : colors.sheet,
      }}
    >
      <View
        className="items-center justify-center rounded-full"
        style={{ width: 40, height: 40, backgroundColor: tint.bg }}
      >
        <Icon name={typeIcon(type.slug)} size={20} color={tint.fg} strokeWidth={2.1} />
      </View>
      <Text weight={800} className="flex-1 text-[15px] leading-[19px] text-ink" numberOfLines={2}>
        {type.name}
      </Text>
    </Pressable>
  );
}
