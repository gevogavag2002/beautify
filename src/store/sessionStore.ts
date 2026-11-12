import { create } from 'zustand';

import { setAuthToken } from '@/services/axiosInstance';
import type { User } from '@/types';

type SessionState = {
  token: string | null;
  user: User | null;
  setSession: (token: string, user: User) => void;
  clear: () => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  token: null,
  user: null,
  setSession: (token, user) => {
    setAuthToken(token);
    set({ token, user });
  },
  clear: () => {
    setAuthToken(null);
    set({ token: null, user: null });
  },
}));
