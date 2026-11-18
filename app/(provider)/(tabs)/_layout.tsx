import { Tabs } from 'expo-router';

import TabBar, { type TabSpec } from '@/components/common/TabBar';

const tabs: TabSpec[] = [
  { name: 'schedule', icon: 'calendar', labelKey: 'tabs.schedule' },
  { name: 'services', icon: 'barber', labelKey: 'tabs.services' },
  { name: 'portfolio', icon: 'image', labelKey: 'tabs.portfolio' },
  { name: 'profile', icon: 'user', labelKey: 'tabs.profile' },
];

export default function ProviderTabsLayout() {
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
