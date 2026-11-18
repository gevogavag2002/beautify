import { apiV1 } from '@/services/axiosInstance';
import type { Booking, Id, Provider } from '@/types';

export type AddServiceInput = {
  catalogServiceId: Id;
  durationMin: number;
  description?: string | null;
};
export type UpdateServiceInput = {
  id: Id;
  durationMin?: number;
  description?: string | null;
  hidden?: boolean;
};
export type WalkInInput = { clientName: string; serviceIds: Id[]; startsAt: string };

// The signed-in provider's own business: services, portfolio, schedule. Every change to the
// business returns the full `Provider`, so one cache entry stays in sync.
export const myProviderApi = {
  /** 422 on `catalogServiceId` when it is already in the list or not offered for the type. */
  addService: async (input: AddServiceInput) => {
    const { data } = await apiV1.post<Provider>('/me/provider/services', input);
    return data;
  },
  updateService: async ({ id, ...patch }: UpdateServiceInput) => {
    const { data } = await apiV1.patch<Provider>(`/me/provider/services/${id}`, patch);
    return data;
  },
  removeService: async (id: Id) => {
    const { data } = await apiV1.delete<Provider>(`/me/provider/services/${id}`);
    return data;
  },
  /** Upload is not wired yet (docs/BACKLOG.md): the mock appends an empty photo. */
  addPhoto: async () => {
    const { data } = await apiV1.post<Provider>('/me/provider/portfolio');
    return data;
  },
  removePhoto: async (id: Id) => {
    const { data } = await apiV1.delete<Provider>(`/me/provider/portfolio/${id}`);
    return data;
  },
  /** Full list of photo ids in the new order; the first one becomes the cover. */
  reorderPhotos: async (ids: Id[]) => {
    const { data } = await apiV1.put<Provider>('/me/provider/portfolio/order', { ids });
    return data;
  },
  /** Reservations from today for `days` days, declined and cancelled ones left out. */
  getSchedule: async (days = 7) => {
    const { data } = await apiV1.get<Booking[]>('/me/schedule', { params: { days } });
    return data;
  },
  /** Booking added by the provider for a client without the app. 422 on `startsAt` if it overlaps. */
  addWalkIn: async (input: WalkInInput) => {
    const { data } = await apiV1.post<Booking>('/me/schedule/walk-in', input);
    return data;
  },
};
