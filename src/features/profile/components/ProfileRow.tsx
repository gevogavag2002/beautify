import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Icon, Text, type IconName } from '@/components/ui';
import { colors } from '@/theme';

type Props = {
  icon: IconName;
  iconBg: string;
  iconFg: string;
  /** Small grey text; for "personal" rows it is above the value, for "account" rows below. */
  label: string;
  value: string;
  /** Optional third line (working hours). */
  sub?: string;
  layout?: 'personal' | 'account';
  confirmed?: boolean;
  divider?: boolean;
  onPress?: () => void;
};

// One row of a white 22px-rounded group: 40px tinted icon circle, two-line text, optional
// "Confirmed" chip, grey chevron. Min height 64 (56 for help rows handled by padding).
export default function ProfileRow({
  icon,
  iconBg,
  iconFg,
  label,
  value,
  sub,
  layout = 'personal',
  confirmed,
  divider,
  onPress,
}: Props) {
  const { t } = useTranslation();
  const big = (text: string) => (
    <Text weight={800} className="text-[16px] text-ink" numberOfLines={1}>
      {text}
    </Text>
  );
  const small = (text: string, weight: 700 | 600) => (
    <Text weight={weight} className="text-[13px] text-muted" numberOfLines={1}>
      {text}
    </Text>
  );
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center active:bg-ground"
      style={{
        minHeight: 64,
        paddingVertical: 10,
        paddingLeft: 14,
        paddingRight: 12,
        gap: 12,
        borderTopWidth: divider ? 1 : 0,
        borderTopColor: colors.divider,
      }}
    >
      <View
        className="items-center justify-center rounded-full"
        style={{ width: 40, height: 40, backgroundColor: iconBg, flexShrink: 0 }}
      >
        <Icon name={icon} size={19} color={iconFg} strokeWidth={2.2} />
      </View>
      <View className="flex-1">
        {layout === 'personal' ? (
          <>
            {small(label, 700)}
            {big(value)}
            {sub ? small(sub, 600) : null}
          </>
        ) : (
          <>
            {big(label)}
            {value ? small(value, 600) : null}
          </>
        )}
      </View>
      {confirmed && (
        <View
          className="flex-row items-center rounded-pill bg-status-confirmed-bg"
          style={{ gap: 4, paddingVertical: 3, paddingHorizontal: 9, flexShrink: 0 }}
        >
          <Icon name="check" size={11} color={colors.status.confirmed.fg} strokeWidth={3.4} />
          <Text weight={800} className="text-[12px] text-status-confirmed-fg">
            {t('profile.confirmed')}
          </Text>
        </View>
      )}
      {onPress && <Icon name="chevronRight" size={18} color={colors.chevron} strokeWidth={2.4} />}
    </Pressable>
  );
}
