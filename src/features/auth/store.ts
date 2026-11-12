import { create } from 'zustand';

import type { Gender, Role } from '@/types';

// Draft of the registration wizard. Lives only while the wizard is open.
type RegisterDraft = {
  role: Role;
  providerTypeId: string | null;
  providerTypeName: string | null;
  photoUri: string | null;
  fullName: string;
  gender: Gender;
  countryCode: string;
  phone: string;
  email: string;
  password: string;
  passwordConfirm: string;
  services: Record<string, number | null>; // catalogServiceId -> minutes
  userId: string | null;
};

type RegisterState = RegisterDraft & {
  patch: (p: Partial<RegisterDraft>) => void;
  toggleService: (id: string) => void;
  setMinutes: (id: string, min: number | null) => void;
  reset: () => void;
};

const initial: RegisterDraft = {
  role: 'provider',
  providerTypeId: null,
  providerTypeName: null,
  photoUri: null,
  fullName: '',
  gender: 'male',
  countryCode: '+374',
  phone: '',
  email: '',
  password: '',
  passwordConfirm: '',
  services: {},
  userId: null,
};

export const useRegisterStore = create<RegisterState>((set) => ({
  ...initial,
  patch: (p) => set(p),
  toggleService: (id) =>
    set((st) => {
      const next = { ...st.services };
      if (id in next) delete next[id];
      else next[id] = null;
      return { services: next };
    }),
  setMinutes: (id, min) => set((st) => ({ services: { ...st.services, [id]: min } })),
  reset: () => set(initial),
}));

export const totalSteps = (role: Role) => (role === 'provider' ? 5 : 4);
