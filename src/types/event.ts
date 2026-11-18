import type { Id } from './common';

// Public beauty events shown on the client Home ("Happening soon").
export type EventCard = {
  id: Id;
  title: string;
  startsAt: string; // ISO
  endsAt: string; // ISO
  venueName: string;
  /** Short badge under the title ("Free entry"); null when there is none. */
  tag: string | null;
};
