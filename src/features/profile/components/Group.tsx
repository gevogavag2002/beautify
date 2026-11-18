import type { PropsWithChildren } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui';

// Section title 17/800 + white 22px-rounded card holding rows.
export default function Group({ title, children }: PropsWithChildren<{ title: string }>) {
  return (
    <View>
      <Text
        weight={800}
        className="text-[17px] text-ink"
        style={{ marginHorizontal: 2, marginBottom: 8 }}
      >
        {title}
      </Text>
      <View className="overflow-hidden rounded-[22px] bg-sheet">{children}</View>
    </View>
  );
}
