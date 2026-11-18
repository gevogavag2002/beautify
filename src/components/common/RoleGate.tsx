import { Redirect } from 'expo-router';
import type { ReactNode } from 'react';

import { useSessionStore } from '@/store/sessionStore';
import type { Role } from '@/types';

import ErrorScreen from './ErrorScreen';

// Wraps a route group: no session -> Sign in, wrong account type -> "You can't open this".
export default function RoleGate({ role, children }: { role: Role; children: ReactNode }) {
  const user = useSessionStore((s) => s.user);
  if (!user) return <Redirect href="/(auth)/login" />;
  if (user.role !== role) return <ErrorScreen kind="forbidden" />;
  return <>{children}</>;
}
