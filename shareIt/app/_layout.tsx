import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '../src/hooks/use-color-scheme';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../src/services/firebase';
import { useEffect, useState } from 'react';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

const AuthLayout = () => {
  const segments = useSegments();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (typeof segments[0] === 'undefined') return;
    const inAuthGroup = segments[0] === '(auth)';

    if (user && inAuthGroup) {
      router.replace('/(tabs)');
    } else if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    }
  }, [user, segments, router]);

  return null;
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthLayout />
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
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
