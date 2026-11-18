import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { bookingsApi } from '@/api/bookingsApi';
import { myProviderApi } from '@/api/myProviderApi';

export const useMyBookings = (scope: 'upcoming' | 'past') =>
  useQuery({ queryKey: ['bookings', scope], queryFn: () => bookingsApi.getMine(scope) });

// Any booking change moves free slots, the provider's "next free time" and rating, and the
// client's own stats, so all of them are refreshed together.
const useBookingMutation = <TInput, TResult>(fn: (input: TInput) => Promise<TResult>) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['providers'] });
      qc.invalidateQueries({ queryKey: ['me', 'client-stats'] });
    },
  });
};

export const useCreateBooking = () => useBookingMutation(bookingsApi.create);
export const useSetBookingStatus = () => useBookingMutation(bookingsApi.setStatus);
export const useRateBooking = () => useBookingMutation(bookingsApi.rate);

// Provider side.
export const useSchedule = (days = 7) =>
  useQuery({
    queryKey: ['bookings', 'schedule', days],
    queryFn: () => myProviderApi.getSchedule(days),
  });
export const useAddWalkIn = () => useBookingMutation(myProviderApi.addWalkIn);
