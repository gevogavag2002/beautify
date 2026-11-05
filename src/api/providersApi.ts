import { apiV1 } from '@/services/axiosInstance';
import type { DaySlots, NearbyQuery, Provider, ProviderCard } from '@/types';

export const providersApi = {
  getNearby: async (query: NearbyQuery) => {
    const { data } = await apiV1.get<ProviderCard[]>('/providers/nearby', { params: query });
    return data;
  },
  getTopRated: async () => {
    const { data } = await apiV1.get<ProviderCard[]>('/providers/top');
    return data;
  },
  getById: async (id: string) => {
    const { data } = await apiV1.get<Provider>(`/providers/${id}`);
    return data;
  },
  getSlots: async (id: string, serviceIds: string[], from: string, days = 7) => {
    const { data } = await apiV1.get<DaySlots[]>(`/providers/${id}/slots`, {
      params: { serviceIds: serviceIds.join(','), from, days },
    });
    return data;
  },
};
