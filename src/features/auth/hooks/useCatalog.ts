import { useQuery } from '@tanstack/react-query';

import { catalogApi } from '@/api/catalogApi';

export const useProviderTypes = () =>
  useQuery({
    queryKey: ['catalog', 'provider-types'],
    queryFn: catalogApi.getProviderTypes,
    staleTime: Infinity,
  });

export const useServiceCategories = () =>
  useQuery({
    queryKey: ['catalog', 'services'],
    queryFn: catalogApi.getServiceCategories,
    staleTime: Infinity,
  });
