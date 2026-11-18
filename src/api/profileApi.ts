import { apiV1 } from '@/services/axiosInstance';
import type { ClientStats, Gender, Id, Provider, User, WorkingHours } from '@/types';

export type UpdateDetailsInput = { fullName: string; gender: Gender };
export type ChangePasswordInput = { currentPassword: string; newPassword: string };
export type UpdateProviderInput = Partial<{
  businessName: string;
  about: string | null;
  typeId: Id;
  address: string;
  lat: number;
  lng: number;
  autoAccept: boolean;
  workingHours: WorkingHours;
}>;

// Everything under /me acts on the signed-in user (bearer token).
export const profileApi = {
  getClientStats: async () => {
    const { data } = await apiV1.get<ClientStats>('/me/client-stats');
    return data;
  },
  updateDetails: async (input: UpdateDetailsInput) => {
    const { data } = await apiV1.patch<User>('/me', input);
    return data;
  },
  /** Sends a code to the new number; the account keeps the old one until verified. */
  changePhone: async (phone: string) => {
    const { data } = await apiV1.post<{ expiresInSec: number }>('/me/phone/change', { phone });
    return data;
  },
  verifyPhoneChange: async (code: string) => {
    const { data } = await apiV1.post<User>('/me/phone/verify', { code });
    return data;
  },
  changeEmail: async (email: string) => {
    const { data } = await apiV1.post<{ expiresInSec: number }>('/me/email/change', { email });
    return data;
  },
  verifyEmailChange: async (code: string) => {
    const { data } = await apiV1.post<User>('/me/email/verify', { code });
    return data;
  },
  /** 422 on `currentPassword` when it is wrong. Other devices are signed out. */
  changePassword: async (input: ChangePasswordInput) => {
    const { data } = await apiV1.post<User>('/me/password', input);
    return data;
  },
  /** The signed-in provider's own business record (404 for clients). */
  getMyProvider: async () => {
    const { data } = await apiV1.get<Provider>('/me/provider');
    return data;
  },
  updateMyProvider: async (input: UpdateProviderInput) => {
    const { data } = await apiV1.patch<Provider>('/me/provider', input);
    return data;
  },
  logout: async () => {
    const { data } = await apiV1.post<{ ok: true }>('/auth/logout');
    return data;
  },
};
