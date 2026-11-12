import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import { authApi, type AuthResponse } from '@/api/authApi';
import { useSessionStore } from '@/store/sessionStore';
import type { ApiError } from '@/types';

// First validation message from a 422, or a generic message.
export const errorMessage = (e: unknown, fallback: string) => {
  if (isAxiosError<ApiError>(e) && e.response?.data) {
    const d = e.response.data;
    const first = d.errors && Object.values(d.errors)[0]?.[0];
    return first ?? d.message ?? fallback;
  }
  return fallback;
};

// Map a 422 to { field: message }; anything else goes under `form`.
export const fieldErrors = (e: unknown, fallback: string): Record<string, string> => {
  if (isAxiosError<ApiError>(e) && e.response?.data?.errors) {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(e.response.data.errors)) out[k] = v[0] ?? fallback;
    return out;
  }
  return { form: errorMessage(e, fallback) };
};

export const useLogin = () => {
  const setSession = useSessionStore((s) => s.setSession);
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (r: AuthResponse) => setSession(r.token, r.user),
  });
};

export const useRegister = () => useMutation({ mutationFn: authApi.register });

export const useVerifyPhone = () =>
  useMutation({
    mutationFn: (v: { userId: string; code: string }) => authApi.verifyPhone(v.userId, v.code),
  });

export const useVerifyEmail = () => {
  const setSession = useSessionStore((s) => s.setSession);
  return useMutation({
    mutationFn: (v: { userId: string; code: string }) => authApi.verifyEmail(v.userId, v.code),
    onSuccess: (r) => setSession(r.token, r.user),
  });
};

export const useSetMyServices = () => useMutation({ mutationFn: authApi.setMyServices });

export const useResend = (kind: 'phone' | 'email') =>
  useMutation({
    mutationFn: (userId: string) =>
      kind === 'phone' ? authApi.sendPhoneCode(userId) : authApi.sendEmailCode(userId),
  });
