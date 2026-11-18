import { apiV1 } from '@/services/axiosInstance';
import type { Booking, BookingStatus, CreateBookingInput } from '@/types';

export const bookingsApi = {
  /** upcoming: pending/confirmed and not over yet (soonest first); past: the rest (newest first). */
  getMine: async (scope: 'upcoming' | 'past') => {
    const { data } = await apiV1.get<Booking[]>('/bookings', { params: { scope } });
    return data;
  },
  /** 422 on `startsAt` when the time is no longer free. */
  create: async (input: CreateBookingInput) => {
    const { data } = await apiV1.post<Booking>('/bookings', input);
    return data;
  },
  setStatus: async ({ id, status }: { id: string; status: BookingStatus }) => {
    const { data } = await apiV1.patch<Booking>(`/bookings/${id}/status`, { status });
    return data;
  },
  /** Stars 1-5 for a completed visit, once. */
  rate: async ({ id, stars }: { id: string; stars: number }) => {
    const { data } = await apiV1.post<Booking>(`/bookings/${id}/rating`, { stars });
    return data;
  },
};
