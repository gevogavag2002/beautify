import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui';
import { colors } from '@/theme';

type Props = {
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  /** True when the request succeeded with nothing to show. */
  empty?: boolean;
  emptyTitle?: string;
  emptyBody?: string;
  /** Card background: white on ground screens, ground on white sheets. */
  tone?: 'sheet' | 'ground';
  children: ReactNode;
};

// The three states every backend list needs: loading, error with Retry, empty.
export default function ListState({
  loading,
  error,
  onRetry,
  empty,
  emptyTitle,
  emptyBody,
  tone = 'sheet',
  children,
}: Props) {
  const { t } = useTranslation();
  const card = `rounded-card items-center ${tone === 'sheet' ? 'bg-sheet' : 'bg-ground'}`;
  if (loading) {
    return (
      <View className="items-center justify-center" style={{ paddingVertical: 28 }}>
        <ActivityIndicator color={colors.primary.DEFAULT} />
      </View>
    );
  }
  if (error) {
    return (
      <View className={card} style={{ padding: 22 }}>
        <Text weight={800} className="text-center text-[16px] text-ink">
          {t('common.loadError')}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          className="items-center justify-center rounded-pill bg-primary active:bg-primary-pressed"
          style={{ height: 44, paddingHorizontal: 24, marginTop: 12 }}
        >
          <Text weight={800} className="text-[15px] text-sheet">
            {t('common.retry')}
          </Text>
        </Pressable>
      </View>
    );
  }
  if (empty) {
    return (
      <View className={card} style={{ padding: 22 }}>
        <Text weight={800} className="text-center text-[16px] text-ink">
          {emptyTitle}
        </Text>
        {emptyBody ? (
          <Text
            weight={600}
            className="text-center text-[14px] text-muted"
            style={{ marginTop: 6 }}
          >
            {emptyBody}
          </Text>
        ) : null}
      </View>
    );
  }
  return <>{children}</>;
}
