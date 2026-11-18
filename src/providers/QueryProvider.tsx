import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';

import { useSessionStore } from '@/store/sessionStore';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

// Server data belongs to the signed-in account: when the account changes (sign out, 401,
// another user signs in) nothing cached for the previous one may be shown.
useSessionStore.subscribe((state, prev) => {
  if (state.user?.id !== prev.user?.id) queryClient.clear();
});

export default function QueryProvider({ children }: PropsWithChildren) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
