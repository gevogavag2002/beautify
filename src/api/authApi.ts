import { apiV1 } from '@/services/axiosInstance';
import type { User } from '@/types';

export type LoginInput = { email: string; password: string };
export type AuthResponse = { token: string; user: User };

export const authApi = {
  login: async (input: LoginInput) => {
    const { data } = await apiV1.post<AuthResponse>('/auth/login', input);
    return data;
  },
  me: async () => {
    const { data } = await apiV1.get<User>('/auth/me');
    return data;
  },
};
