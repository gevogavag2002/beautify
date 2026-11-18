// All environment access goes through here. Values come from .env (EXPO_PUBLIC_* only).
export const env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1',
  /** Optional language for the first launch: 'en' or 'ru'. */
  defaultLang: process.env.EXPO_PUBLIC_DEFAULT_LANG,
  useMocks: __DEV__ && process.env.EXPO_PUBLIC_USE_MOCKS === 'true',
} as const;
