import { Tabs } from 'expo-router';

import TabBar, { type TabSpec } from '@/components/common/TabBar';

const tabs: TabSpec[] = [
  { name: 'index', icon: 'home', labelKey: 'tabs.home' },
  { name: 'map', icon: 'map', labelKey: 'tabs.map' },
  { name: 'reservations', icon: 'calendar', labelKey: 'tabs.reservations' },
  { name: 'profile', icon: 'user', labelKey: 'tabs.profile' },
];

export default function ClientTabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <TabBar {...props} tabs={tabs} />}
    >
      {tabs.map((t) => (
        <Tabs.Screen key={t.name} name={t.name} />
      ))}
    </Tabs>
  );
}
