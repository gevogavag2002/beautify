import { useEffect, useState, type PropsWithChildren } from 'react';

import { env } from '@/constants/env';

// Starts MSW before the first render in dev when EXPO_PUBLIC_USE_MOCKS=true.
// Renders nothing until mocks are ready so no request can slip past them.
export default function MocksGate({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(!env.useMocks);

  useEffect(() => {
    if (ready) return;
    import('@/mocks')
      .then(({ enableMocks }) => enableMocks())
      .catch((e) => console.error('[mocks] failed to start', e))
      .finally(() => setReady(true));
  }, [ready]);

  return ready ? <>{children}</> : null;
}
