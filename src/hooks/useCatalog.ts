import { useQuery } from '@tanstack/react-query';

import { catalogApi } from '@/api/catalogApi';
import type { Id } from '@/types';

export const useProviderTypes = () =>
  useQuery({
    queryKey: ['catalog', 'provider-types'],
    queryFn: catalogApi.getProviderTypes,
    staleTime: Infinity,
  });

export const useServiceCategories = (providerTypeId: Id | null) =>
  useQuery({
    queryKey: ['catalog', 'services', providerTypeId],
    queryFn: () => catalogApi.getServiceCategories(providerTypeId as Id),
    enabled: providerTypeId != null,
    staleTime: Infinity,
  });
