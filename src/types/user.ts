import type { Id } from './common';

export type Role = 'client' | 'provider' | 'admin';
export type Gender = 'male' | 'female';

export type User = {
  id: Id;
  role: Role;
  fullName: string;
  gender: Gender;
  phone: string;
  email: string;
  phoneConfirmed: boolean;
  emailConfirmed: boolean;
  photoUrl: string | null;
  createdAt: string;
};

export type ClientStats = { rating: number; ratingCount: number; visits: number; noShows: number };
