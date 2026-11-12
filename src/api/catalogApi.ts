import { apiV1 } from '@/services/axiosInstance';
import type { Id, ProviderType, ServiceCategory } from '@/types';

export const catalogApi = {
  getProviderTypes: async () => {
    const { data } = await apiV1.get<ProviderType[]>('/catalog/provider-types');
    return data;
  },
  /** Categories for one provider type (barber sees hair + beard, nail artist sees nails). */
  getServiceCategories: async (providerTypeId: Id) => {
    const { data } = await apiV1.get<ServiceCategory[]>('/catalog/services', {
      params: { providerTypeId },
    });
    return data;
  },
};
