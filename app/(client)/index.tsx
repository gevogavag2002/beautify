import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Text } from '@/components/ui';
import { useTopProviders } from '@/features/search/hooks/useTopProviders';
import { useSessionStore } from '@/store/sessionStore';

// Placeholder until the Client Home screen is built.
export default function ClientHome() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, clear } = useSessionStore();
  const { data } = useTopProviders();
  return (
    <View className="flex-1 bg-ground px-5" style={{ paddingTop: insets.top + 16 }}>
      <Text weight={800} className="text-[26px] text-ink">
        Client home
      </Text>
      <Text weight={600} className="mb-4 text-muted">
        {user ? `${user.fullName} · ${user.email}` : 'guest'}
      </Text>
      {data?.map((p) => (
        <View key={p.id} className="mb-3 rounded-card bg-sheet p-4">
          <Text weight={800} className="text-[16px] text-ink">
            {p.businessName}
          </Text>
          <Text className="text-muted">
            {p.typeName} · {p.distanceKm} km · {p.rating} ({p.ratingCount})
          </Text>
        </View>
      ))}
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
