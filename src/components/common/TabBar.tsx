import type { BottomTabBarProps } from 'expo-router/build/layouts/Tabs';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Icon, Text, type IconName } from '@/components/ui';
import { colors } from '@/theme';

export type TabSpec = { name: string; icon: IconName; labelKey: string };

// Bottom nav from the canvas: 84px white bar, hairline on top, 4 equal columns, active tab
// gets a 56x32 soft-violet pill behind the icon and violet 800 label.
export default function TabBar({
  state,
  navigateToTab,
  tabs,
}: BottomTabBarProps & { tabs: TabSpec[] }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-row bg-sheet"
      style={{
        borderTopWidth: 1,
        borderTopColor: colors.hairline,
        paddingTop: 8,
        paddingHorizontal: 10,
        paddingBottom: Math.max(insets.bottom, 14),
      }}
    >
      {tabs.map((tab) => {
        const route = state.routes.find((r) => r.name === tab.name);
        if (!route) return null;
        const active = state.routes[state.index]?.name === tab.name;
        return (
          <Pressable
            key={tab.name}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={t(tab.labelKey)}
            onPress={() => {
              if (!active) navigateToTab(route.key);
            }}
            className="flex-1 items-center justify-center"
            style={{ gap: 4, minHeight: 62 }}
          >
            <View
              // Remounted on change: a background added to an existing view later loses
              // its radius on Android.
              key={active ? 'on' : 'off'}
              className="items-center justify-center"
              style={{
                width: 56,
                height: 32,
                borderRadius: 16,
                backgroundColor: active ? colors.primary.soft : 'transparent',
              }}
            >
              <Icon
                name={tab.icon}
                size={22}
                color={active ? colors.primary.pressed : colors.muted}
                strokeWidth={2.2}
              />
            </View>
            <Text
              weight={active ? 800 : 700}
              className={`text-[12px] ${active ? 'text-primary-pressed' : 'text-muted'}`}
              numberOfLines={1}
            >
              {t(tab.labelKey)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
