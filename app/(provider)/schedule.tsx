import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Text } from '@/components/ui';
import { useSessionStore } from '@/store/sessionStore';

// Placeholder until the Provider Schedule screen is built.
export default function ProviderSchedule() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, clear } = useSessionStore();
  return (
    <View className="flex-1 bg-ground px-5" style={{ paddingTop: insets.top + 16 }}>
      <Text weight={800} className="text-[26px] text-ink">
        Provider schedule
      </Text>
      <Text weight={600} className="mb-4 text-muted">
        {user ? `${user.fullName} · ${user.email}` : 'guest'}
      </Text>
      <Button
        label="Sign out"
        variant="secondary"
        onPress={() => {
          clear();
          router.replace('/(auth)/login');
        }}
      />
    </View>
  );
}
