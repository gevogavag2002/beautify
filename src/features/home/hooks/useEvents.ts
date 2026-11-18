import { useQuery } from '@tanstack/react-query';

import { eventsApi } from '@/api/eventsApi';

export const useUpcomingEvents = (limit = 1) =>
  useQuery({
    queryKey: ['events', 'upcoming', limit],
    queryFn: () => eventsApi.getUpcoming(limit),
  });
