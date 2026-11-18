import { useQuery } from '@tanstack/react-query';

import { providersApi } from '@/api/providersApi';
import { useLocation } from '@/hooks/useLocation';

export const useProvider = (id: string) => {
  const { lat, lng } = useLocation();
  return useQuery({
    queryKey: ['providers', 'detail', id, lat, lng],
    queryFn: () => providersApi.getById(id, { lat, lng }),
    enabled: !!id,
  });
};

export const useProviderRatings = (id: string, enabled: boolean) =>
  useQuery({
    queryKey: ['providers', 'ratings', id],
    queryFn: () => providersApi.getRatings(id),
    enabled: enabled && !!id,
  });
