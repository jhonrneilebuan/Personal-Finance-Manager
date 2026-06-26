import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/auth.store';
import { useSettingsStore } from '@/store/settings.store';
import { createAppTheme } from '@/theme/theme';

export default function RootLayout() {
  const hydrate = useAuthStore((state) => state.hydrate);
  const isDarkMode = useSettingsStore((state) => state.isDarkMode);
  const theme = createAppTheme(isDarkMode);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

