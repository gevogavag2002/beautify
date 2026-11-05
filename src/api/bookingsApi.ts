import { apiV1 } from '@/services/axiosInstance';
import type { Booking, BookingStatus, CreateBookingInput } from '@/types';

export const bookingsApi = {
  getMine: async (scope: 'upcoming' | 'past') => {
    const { data } = await apiV1.get<Booking[]>('/bookings', { params: { scope } });
    return data;
  },
  create: async (input: CreateBookingInput) => {
    const { data } = await apiV1.post<Booking>('/bookings', input);
    return data;
  },
  setStatus: async (id: string, status: BookingStatus) => {
    const { data } = await apiV1.patch<Booking>(`/bookings/${id}/status`, { status });
    return data;
  },
};
