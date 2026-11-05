import { useQuery } from '@tanstack/react-query';

import { providersApi } from '@/api/providersApi';

export const useTopProviders = () =>
  useQuery({ queryKey: ['providers', 'top'], queryFn: providersApi.getTopRated });
