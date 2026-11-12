import { Redirect } from 'expo-router';

import { useSessionStore } from '@/store/sessionStore';

// Entry: send the user to the right group. Session persistence comes later.
export default function Index() {
  const user = useSessionStore((s) => s.user);
  if (!user) return <Redirect href="/(auth)/login" />;
  return <Redirect href={user.role === 'provider' ? '/(provider)/schedule' : '/(client)'} />;
}
