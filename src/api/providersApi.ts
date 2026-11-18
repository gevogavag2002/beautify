import { apiV1 } from '@/services/axiosInstance';
import type { DaySlots, NearbyQuery, ProviderCard, ProviderDetails, ProviderRating } from '@/types';

type Coords = { lat: number; lng: number };

export const providersApi = {
  getNearby: async (query: NearbyQuery) => {
    const { data } = await apiV1.get<ProviderCard[]>('/providers/nearby', { params: query });
    return data;
  },
  /** Best rated first; the nearer provider wins a tie. */
  getTopRated: async (coords: Coords, limit = 3) => {
    const { data } = await apiV1.get<ProviderCard[]>('/providers/top', {
      params: { ...coords, limit },
    });
    return data;
  },
  /** Public page. Coordinates are optional; without them `distanceKm` is null. */
  getById: async (id: string, coords?: Coords) => {
    const { data } = await apiV1.get<ProviderDetails>(`/providers/${id}`, { params: coords });
    return data;
  },
  getRatings: async (id: string) => {
    const { data } = await apiV1.get<ProviderRating[]>(`/providers/${id}/ratings`);
    return data;
  },
  /** Free start times for the next `days` days, today first, for the summed duration. */
  getSlots: async (id: string, serviceIds: string[], days = 7) => {
    const { data } = await apiV1.get<DaySlots[]>(`/providers/${id}/slots`, {
      params: { serviceIds: serviceIds.join(','), days },
    });
    return data;
  },
};
