import { Stack } from 'expo-router';

import RoleGate from '@/components/common/RoleGate';
import { colors } from '@/theme';

// Tabs live in (tabs); provider page, booking, FAQ and privacy open above them without
// the tab bar, as on the design canvas.
export default function ClientLayout() {
  return (
    <RoleGate role="client">
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.ground } }}
      />
    </RoleGate>
  );
}
