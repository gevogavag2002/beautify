import { apiV1 } from '@/services/axiosInstance';
import type { EventCard } from '@/types';

export const eventsApi = {
  getUpcoming: async (limit = 1) => {
    const { data } = await apiV1.get<EventCard[]>('/events/upcoming', { params: { limit } });
    return data;
  },
};
