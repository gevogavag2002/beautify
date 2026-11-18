import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/theme';

// Violet strip behind the system status bar. Screens scroll their header together with the
// content, so without it the clock and battery icons end up on top of scrolled content.
export default function StatusBarBand() {
  const insets = useSafeAreaInsets();
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: insets.top,
        backgroundColor: colors.primary.DEFAULT,
      }}
    />
  );
}
