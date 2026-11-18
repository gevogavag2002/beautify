import type { Id } from './common';

export type WorkingDay = {
  open: string;
  close: string;
  breakStart?: string;
  breakEnd?: string;
} | null;
export type WorkingHours = Record<
  'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun',
  WorkingDay
>;

export type ProviderService = {
  id: Id;
  catalogServiceId: Id;
  name: string;
  description: string | null;
  durationMin: number;
  hidden: boolean;
};

export type Provider = {
  id: Id;
  businessName: string;
  typeId: Id;
  typeName: string;
  about: string | null;
  address: string;
  /** Short area name shown under the business name ("Kentron"). */
  district: string | null;
  lat: number;
  lng: number;
  photoUrl: string | null;
  rating: number;
  ratingCount: number;
  visits: number;
  /** Ratings the provider gave to clients. */
  ratingsGiven: number;
  /** False while the profile is incomplete or hidden by admin: not shown in search. */
  listed: boolean;
  autoAccept: boolean;
  workingHours: WorkingHours;
  services: ProviderService[];
  portfolio: PortfolioPhoto[];
};

export type ProviderCard = Pick<
  Provider,
  | 'id'
  | 'businessName'
  | 'typeId'
  | 'typeName'
  | 'address'
  | 'lat'
  | 'lng'
  | 'rating'
  | 'ratingCount'
  | 'visits'
  | 'photoUrl'
> & {
  distanceKm: number;
  /** Closing time today ('HH:mm'); null when closed today. */
  closesAt: string | null;
};

/** Public provider page: `GET /providers/:id?lat=&lng=`. Hidden services are left out. */
export type ProviderDetails = Provider & {
  /** Null when the request had no coordinates. */
  distanceKm: number | null;
  /** First free start (ISO) for the shortest service within 7 days; null when none. */
  nextFreeAt: string | null;
};

export type PortfolioPhoto = { id: Id; url: string | null; isCover: boolean; order: number };

/** A star rating a client left after a completed visit. Stars only, no text. */
export type ProviderRating = { id: Id; clientName: string; stars: number; createdAt: string };

export type NearbyQuery = {
  lat: number;
  lng: number;
  radiusKm: number;
  typeId?: Id;
  /** Free text: matches the business name and service names. */
  q?: string;
  sort?: 'distance' | 'rating' | 'visits';
};
