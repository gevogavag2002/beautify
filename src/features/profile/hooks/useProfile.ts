import { useMutation, useQuery } from '@tanstack/react-query';

import { profileApi } from '@/api/profileApi';
import { useSessionStore } from '@/store/sessionStore';
import type { User } from '@/types';

export const useClientStats = () =>
  useQuery({ queryKey: ['me', 'client-stats'], queryFn: profileApi.getClientStats });

// Every mutation that returns the user refreshes the session copy.
const useUserMutation = <TInput>(fn: (input: TInput) => Promise<User>) => {
  const setUser = useSessionStore((s) => s.setUser);
  return useMutation({ mutationFn: fn, onSuccess: setUser });
};

export const useUpdateDetails = () => useUserMutation(profileApi.updateDetails);
export const useChangePhone = () => useMutation({ mutationFn: profileApi.changePhone });
export const useVerifyPhoneChange = () => useUserMutation(profileApi.verifyPhoneChange);
export const useChangeEmail = () => useMutation({ mutationFn: profileApi.changeEmail });
export const useVerifyEmailChange = () => useUserMutation(profileApi.verifyEmailChange);
export const useChangePassword = () => useUserMutation(profileApi.changePassword);

export { useLogout } from '@/hooks/useLogout';
