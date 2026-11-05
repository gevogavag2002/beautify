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
  lat: number;
  lng: number;
  photoUrl: string | null;
  rating: number;
  ratingCount: number;
  visits: number;
  autoAccept: boolean;
  workingHours: WorkingHours;
  services: ProviderService[];
  portfolio: PortfolioPhoto[];
};

export type ProviderCard = Pick<
  Provider,
  'id' | 'businessName' | 'typeName' | 'rating' | 'ratingCount' | 'visits' | 'photoUrl'
> & { distanceKm: number; closesAt: string | null };

export type PortfolioPhoto = { id: Id; url: string; isCover: boolean; order: number };

export type NearbyQuery = {
  lat: number;
  lng: number;
  radiusKm: number;
  typeId?: Id;
  sort?: 'distance' | 'rating' | 'visits';
};
