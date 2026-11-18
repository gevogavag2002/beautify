import type { Id } from './common';

export type BookingStatus =
  'pending' | 'confirmed' | 'declined' | 'cancelled' | 'completed' | 'no_show';

export type Booking = {
  id: Id;
  providerId: Id;
  providerName: string;
  providerAddress: string;
  providerLat: number;
  providerLng: number;
  clientId: Id;
  clientName: string;
  services: { id: Id; name: string; durationMin: number }[];
  startsAt: string; // ISO
  endsAt: string; // ISO
  status: BookingStatus;
  manual: boolean; // walk-in added by the provider
  /** Stars (1-5) the client gave after a completed visit; null until rated. */
  rating: number | null;
  createdAt: string;
};

export type CreateBookingInput = { providerId: Id; serviceIds: Id[]; startsAt: string };

/** One day of free start times. `date` is the provider's local 'YYYY-MM-DD', starts are 'HH:mm'. */
export type DaySlots = { date: string; closed: boolean; starts: string[] };
