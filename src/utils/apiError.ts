import { isAxiosError } from 'axios';

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

export const isNotFound = (e: unknown) => isAxiosError(e) && e.response?.status === 404;
