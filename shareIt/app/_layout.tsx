import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments, Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '../hooks/use-color-scheme';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../src/services/firebase';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  // Leaflet CSS is required for web map tiles and markers.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('leaflet/dist/leaflet.css');
}

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const segments = useSegments();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isReady || typeof segments[0] === 'undefined') return;
    const inAuthGroup = segments[0] === '(auth)';

    if (user && inAuthGroup) {
      router.replace('/(tabs)');
    } else if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    }
  }, [user, segments, router, isReady]);

  return <>{children}</>;
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthLayout>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)/login" />
          <Stack.Screen name="(auth)/registration" options={{ 
            headerShown: true,
            title: 'Create Account',
            headerStyle: { backgroundColor: colorScheme === 'dark' ? DarkTheme.colors.card : DefaultTheme.colors.card },
            headerTintColor: colorScheme === 'dark' ? DarkTheme.colors.text : DefaultTheme.colors.text,
          }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
      </AuthLayout>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
