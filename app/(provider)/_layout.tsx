import { Stack } from 'expo-router';

import RoleGate from '@/components/common/RoleGate';
import { colors } from '@/theme';

// Tabs live in (tabs); the public page preview opens above them without the tab bar.
export default function ProviderLayout() {
  return (
    <RoleGate role="provider">
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.ground } }}
      />
    </RoleGate>
  );
}
