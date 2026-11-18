import { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { Icon, Text } from '@/components/ui';
import { colors } from '@/theme';

// Dark pill with a mint check, floats above the tab bar. Hides itself after 2.5 s.
export const useToast = () => {
  const [message, setMessage] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = useCallback((text: string) => {
    setMessage(text);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(''), 2500);
  }, []);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  return { message, show };
};

export default function Toast({ message, bottom = 16 }: { message: string; bottom?: number }) {
  if (!message) return null;
  return (
    <View
      accessibilityRole="alert"
      className="absolute flex-row items-center rounded-[16px] bg-ink"
      style={{
        left: 20,
        right: 20,
        bottom,
        paddingVertical: 14,
        paddingHorizontal: 16,
        gap: 10,
        shadowColor: colors.ink,
        shadowOpacity: 0.3,
        shadowRadius: 30,
        shadowOffset: { width: 0, height: 12 },
        elevation: 8,
      }}
    >
      <Icon name="check" size={18} color={colors.mintBright} strokeWidth={3} />
      <Text weight={800} className="flex-1 text-[15px] text-sheet" numberOfLines={2}>
        {message}
      </Text>
    </View>
  );
}
