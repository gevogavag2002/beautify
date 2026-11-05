import '../global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import RootProvider from '@/providers/RootProvider';

export default function RootLayout() {
  return (
    <RootProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
    </RootProvider>
  );
}
