import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { providersApi } from '@/api/providersApi';
import { useLocation } from '@/hooks/useLocation';
import type { NearbyQuery } from '@/types';

export const useTopProviders = (limit = 3) => {
  const { lat, lng } = useLocation();
  return useQuery({
    queryKey: ['providers', 'top', lat, lng, limit],
    queryFn: () => providersApi.getTopRated({ lat, lng }, limit),
  });
};

export const useNearbyProviders = (filters: Omit<NearbyQuery, 'lat' | 'lng'>) => {
  const { lat, lng } = useLocation();
  const query: NearbyQuery = { lat, lng, ...filters };
  return useQuery({
    queryKey: ['providers', 'nearby', query],
    queryFn: () => providersApi.getNearby(query),
    // Keep the previous list on screen while a new radius / sort loads.
    placeholderData: keepPreviousData,
  });
};
