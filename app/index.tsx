import { ActivityIndicator, Text, View } from 'react-native';

import { env } from '@/constants/env';
import { useTopProviders } from '@/features/search/hooks/useTopProviders';

// Temporary smoke screen: proves the API layer and mocks work end to end.
export default function Index() {
  const { data, isLoading, error } = useTopProviders();

  return (
    <View className="flex-1 bg-ground px-5 pt-16">
      <Text className="font-extrabold text-2xl text-primary">Beautify</Text>
      <Text className="mb-6 text-muted">mocks: {env.useMocks ? 'on' : 'off'}</Text>
      {isLoading && <ActivityIndicator />}
      {error && <Text className="text-status-cancelled-fg">{String(error)}</Text>}
      {data?.map((p) => (
        <View key={p.id} className="mb-3 rounded-card bg-sheet p-4">
          <Text className="font-extrabold text-base text-ink">{p.businessName}</Text>
          <Text className="text-muted">
            {p.typeName} · {p.distanceKm} km · {p.rating} ({p.ratingCount})
          </Text>
        </View>
      ))}
    </View>
  );
}
