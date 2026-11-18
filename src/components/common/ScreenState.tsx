import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui';
import { colors } from '@/theme';

import ErrorScreen from './ErrorScreen';
import RoundButton from './RoundButton';

type Props = {
  loading: boolean;
  error: boolean;
  /** The request answered 404: shows the "We can't find this" screen instead of Retry. */
  notFound?: boolean;
  onRetry: () => void;
  onBack: () => void;
  children: ReactNode;
};

// Full-screen loading / error for stack screens that cannot render without their data:
// violet band with Back, then a spinner or "Couldn't load" with Retry.
export default function ScreenState({
  loading,
  error,
  notFound,
  onRetry,
  onBack,
  children,
}: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  if (!loading && !error) return <>{children}</>;
  if (notFound) return <ErrorScreen kind="notFound" />;
  return (
    <View className="flex-1 bg-primary">
      <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 16, paddingBottom: 40 }}>
        <RoundButton icon="chevronLeft" label={t('common.back')} onPress={onBack} />
      </View>
      <View
        className="flex-1 items-center justify-center rounded-t-sheet bg-sheet"
        style={{ marginTop: -24, padding: 24 }}
      >
        {loading ? (
          <ActivityIndicator color={colors.primary.DEFAULT} />
        ) : (
          <>
            <Text weight={800} className="text-center text-[17px] text-ink">
              {t('common.loadError')}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={onRetry}
              className="items-center justify-center rounded-pill bg-primary active:bg-primary-pressed"
              style={{ height: 48, paddingHorizontal: 28, marginTop: 14 }}
            >
              <Text weight={800} className="text-[16px] text-sheet">
                {t('common.retry')}
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}
