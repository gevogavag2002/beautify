import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { providersApi } from '@/api/providersApi';

export const useSlots = (providerId: string, serviceIds: string[]) => {
  const ids = [...serviceIds].sort();
  return useQuery({
    queryKey: ['providers', 'slots', providerId, ids],
    queryFn: () => providersApi.getSlots(providerId, ids),
    enabled: ids.length > 0,
    placeholderData: keepPreviousData,
    // Free times change as other people book: never serve them from cache.
    staleTime: 0,
    gcTime: 0,
  });
};
