import { apiV1 } from '@/services/axiosInstance';
import type { ProviderType, ServiceCategory } from '@/types';

export const catalogApi = {
  getProviderTypes: async () => {
    const { data } = await apiV1.get<ProviderType[]>('/catalog/provider-types');
    return data;
  },
  getServiceCategories: async () => {
    const { data } = await apiV1.get<ServiceCategory[]>('/catalog/services');
    return data;
  },
};
