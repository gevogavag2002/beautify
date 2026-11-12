import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Icon, Text } from '@/components/ui';
import { colors } from '@/theme';

type Props = {
  title: string;
  heading: string;
  step: number;
  total: number;
  last?: boolean;
  backTo?: string;
  /** bottom padding of the violet band; main overlaps it by 24 */
  padBottom?: 48 | 44;
};

// Violet band with back arrow, progress pills, "Step n of m" and the page heading.
export default function RegisterHeader({
  title,
  heading,
  step,
  total,
  last,
  backTo,
  padBottom = 48,
}: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View
      className="bg-primary"
      style={{ paddingTop: insets.top + 12, paddingHorizontal: 16, paddingBottom: padBottom }}
    >
      <View className="flex-row items-center" style={{ gap: 4 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          onPress={() => (backTo ? router.replace(backTo as never) : router.back())}
          className="items-center justify-center rounded-full"
          style={{ width: 44, height: 44 }}
        >
          <Icon name="back" size={22} color={colors.sheet} strokeWidth={2.4} />
        </Pressable>
        <Text weight={800} className="text-[16px] text-sheet">
          {title}
        </Text>
      </View>
      <View style={{ paddingTop: 12, paddingHorizontal: 8 }}>
        <View className="flex-row items-center" style={{ gap: 6 }}>
          {Array.from({ length: total }).map((_, i) => (
            <View
              key={i}
              className="flex-1 rounded-pill"
              style={{
                height: 6,
                backgroundColor: i < step ? colors.sheet : 'rgba(255,255,255,0.32)',
              }}
            />
          ))}
        </View>
        <Text weight={700} className="text-[13px] text-primary-soft" style={{ marginTop: 10 }}>
          {last
            ? t('auth.register.lastStep', { current: step, total })
            : t('auth.register.step', { current: step, total })}
        </Text>
        <Text
          weight={800}
          className="text-[26px] leading-[32px] text-sheet"
          style={{ marginTop: 4 }}
        >
          {heading}
        </Text>
      </View>
    </View>
  );
}
