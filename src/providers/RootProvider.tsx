import type { PropsWithChildren } from 'react';

import MocksGate from './MocksGate';
import QueryProvider from './QueryProvider';

export default function RootProvider({ children }: PropsWithChildren) {
  return (
    <MocksGate>
      <QueryProvider>{children}</QueryProvider>
    </MocksGate>
  );
}
