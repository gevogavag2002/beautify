import { create } from 'zustand';

import { setAuthToken, setUnauthorizedHandler } from '@/services/axiosInstance';
import type { User } from '@/types';

type SessionState = {
  token: string | null;
  user: User | null;
  setSession: (token: string, user: User) => void;
  setUser: (user: User) => void;
  clear: () => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  token: null,
  user: null,
  setSession: (token, user) => {
    setAuthToken(token);
    set({ token, user });
  },
  setUser: (user) => set({ user }),
  clear: () => {
    setAuthToken(null);
    set({ token: null, user: null });
  },
}));

// Expired or revoked token: drop the session. The route guards (RoleGate) then send the
// user to Sign in.
setUnauthorizedHandler(() => useSessionStore.getState().clear());
