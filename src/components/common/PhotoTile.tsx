import { Image, View } from 'react-native';

import { Icon } from '@/components/ui';
import { colors } from '@/theme';

type Props = { url: string | null; index: number; size: number; height?: number };

// Portfolio photo. The tinted placeholder from the canvas stays underneath, so a missing or
// slow image never leaves a hole.
export default function PhotoTile({ url, index, size, height = 96 }: Props) {
  const tint = colors.photo[index % colors.photo.length];
  return (
    <View
      accessibilityRole="image"
      className="items-center justify-center overflow-hidden"
      style={{ width: size, height, borderRadius: 16, backgroundColor: tint.bg }}
    >
      <Icon name="image" size={26} color={tint.fg} strokeWidth={1.8} />
      {url ? (
        <Image
          source={{ uri: url }}
          resizeMode="cover"
          style={{ position: 'absolute', top: 0, left: 0, width: size, height }}
        />
      ) : null}
    </View>
  );
}
