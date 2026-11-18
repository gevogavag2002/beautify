import { useMutation } from '@tanstack/react-query';

import { authApi, type AuthResponse } from '@/api/authApi';
import { useSessionStore } from '@/store/sessionStore';

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
