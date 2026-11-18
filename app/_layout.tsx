import '../global.css';
import '@/i18n';

import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/nunito';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import ErrorScreen from '@/components/common/ErrorScreen';
import RootProvider from '@/providers/RootProvider';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync();

// Expo Router renders this instead of a screen that threw while rendering.
export function ErrorBoundary({ retry }: { error: Error; retry: () => Promise<void> }) {
  return (
    <SafeAreaProvider>
      <ErrorScreen kind="failure" onRetry={() => void retry()} />
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <RootProvider>
          <BottomSheetModalProvider>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.ground },
              }}
            />
          </BottomSheetModalProvider>
        </RootProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
