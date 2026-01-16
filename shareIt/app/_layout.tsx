import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments, Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import { useColorScheme } from '../hooks/use-color-scheme';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../src/services/firebase';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  // Load Leaflet CSS only on web by injecting a <link> into document.head.
  // Use CDN so Metro/bundler does not try to resolve CSS during native builds.
  try {
    if (typeof document !== 'undefined' && !document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.3/dist/leaflet.css';
      // optional: set crossorigin or integrity if desired
      document.head.appendChild(link);
    }
  } catch (err) {
    // ignore: not running on web environment
    // console.warn('[app/_layout] Failed to inject leaflet CSS', err);
  }
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
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthLayout>
          <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="(auth)/login" />
              <Stack.Screen name="(auth)/registration" options={{ 
                headerShown: true,
                title: 'Ustvari račun',
                headerStyle: { backgroundColor: colorScheme === 'dark' ? DarkTheme.colors.card : DefaultTheme.colors.card },
                headerTintColor: colorScheme === 'dark' ? DarkTheme.colors.text : DefaultTheme.colors.text,
              }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
          </SafeAreaView>
        </AuthLayout>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
