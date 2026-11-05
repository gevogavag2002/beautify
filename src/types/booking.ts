import type { Id } from './common';

export type BookingStatus =
  'pending' | 'confirmed' | 'declined' | 'cancelled' | 'completed' | 'no_show';

export type Booking = {
  id: Id;
  providerId: Id;
  providerName: string;
  providerAddress: string;
  clientId: Id;
  clientName: string;
  services: { id: Id; name: string; durationMin: number }[];
  startsAt: string; // ISO
  endsAt: string; // ISO
  status: BookingStatus;
  manual: boolean; // walk-in added by the provider
  createdAt: string;
};

export type CreateBookingInput = { providerId: Id; serviceIds: Id[]; startsAt: string };

export type DaySlots = { date: string; starts: string[] }; // 'HH:mm'
