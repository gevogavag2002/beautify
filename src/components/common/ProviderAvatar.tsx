import { View } from 'react-native';

import { Text } from '@/components/ui';
import { colors } from '@/theme';
import { businessInitials } from '@/utils/format';
import { providerTint } from '@/utils/tint';

type Props = {
  name: string;
  /** Provider id: picks the tint. */
  id: string;
  size: number;
  fontSize: number;
  /** White circle with tinted initials, for violet backgrounds. */
  onViolet?: boolean;
};

// Initials circle used wherever a provider has no photo yet.
export default function ProviderAvatar({ id, name, size, fontSize, onViolet }: Props) {
  const tint = providerTint(id);
  return (
    <View
      className="items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        backgroundColor: onViolet ? colors.sheet : tint.bg,
      }}
    >
      <Text weight={800} style={{ fontSize, color: tint.fg }}>
        {businessInitials(name)}
      </Text>
    </View>
  );
}
