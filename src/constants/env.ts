// All environment access goes through here. Values come from .env (EXPO_PUBLIC_* only).
export const env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1',
  useMocks: __DEV__ && process.env.EXPO_PUBLIC_USE_MOCKS === 'true',
} as const;
