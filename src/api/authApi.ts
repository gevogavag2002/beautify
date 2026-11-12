import { apiV1 } from '@/services/axiosInstance';
import type { Gender, Role, User } from '@/types';

export type LoginInput = { email: string; password: string };
export type AuthResponse = { token: string; user: User };

export type RegisterInput = {
  role: Role;
  providerTypeId?: string;
  fullName: string;
  gender: Gender;
  phone: string; // E.164
  email: string;
  password: string;
};
export type RegisterResponse = { userId: string };

export type ServiceInput = { catalogServiceId: string; durationMin: number };

export const authApi = {
  login: async (input: LoginInput) => {
    const { data } = await apiV1.post<AuthResponse>('/auth/login', input);
    return data;
  },
  me: async () => {
    const { data } = await apiV1.get<User>('/auth/me');
    return data;
  },
  register: async (input: RegisterInput) => {
    const { data } = await apiV1.post<RegisterResponse>('/auth/register', input);
    return data;
  },
  sendPhoneCode: async (userId: string) => {
    const { data } = await apiV1.post<{ expiresInSec: number }>('/auth/phone/send', { userId });
    return data;
  },
  verifyPhone: async (userId: string, code: string) => {
    const { data } = await apiV1.post<{ ok: true }>('/auth/phone/verify', { userId, code });
    return data;
  },
  sendEmailCode: async (userId: string) => {
    const { data } = await apiV1.post<{ expiresInSec: number }>('/auth/email/send', { userId });
    return data;
  },
  // Email is the last step for clients: the backend returns a session.
  verifyEmail: async (userId: string, code: string) => {
    const { data } = await apiV1.post<AuthResponse>('/auth/email/verify', { userId, code });
    return data;
  },
  setMyServices: async (services: ServiceInput[]) => {
    const { data } = await apiV1.put<{ ok: true }>('/providers/me/services', { services });
    return data;
  },
};
