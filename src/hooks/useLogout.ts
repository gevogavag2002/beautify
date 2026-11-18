import { useMutation, useQueryClient } from '@tanstack/react-query';

import { profileApi } from '@/api/profileApi';
import { useSessionStore } from '@/store/sessionStore';

export const useLogout = () => {
  const clear = useSessionStore((s) => s.clear);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: profileApi.logout,
    // Local session is dropped even if the request fails: the user asked to leave.
    onSettled: () => {
      clear();
      qc.clear();
    },
  });
};
