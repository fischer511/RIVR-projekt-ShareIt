import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius } from '@src/constants/colors';
import PrimaryButton from '@src/components/PrimaryButton';
import SecondaryButton from '@src/components/SecondaryButton';
import { useRouter } from 'expo-router';
import { signOut, onAuthStateChanged, User, sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@src/services/firebase';

const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [resetEmail, setResetEmail] = useState<string>('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.center}> 
          <Image source={{ uri: 'https://placekitten.com/200/200' }} style={styles.avatar} />
          <Text style={styles.name}>{user?.email ?? 'Signed out'}</Text>
          {user ? (
            <Text style={styles.meta}>UID: {user.uid}</Text>
          ) : (
            <Text style={styles.meta}>Login below to test Firebase</Text>
          )}
          {user ? (
            <Text style={styles.meta}>
              Email verified: {user.emailVerified ? 'Yes' : 'No'}
            </Text>
          ) : null}
        </View>
        <View style={styles.card}> 
          <PrimaryButton title="My bookings history" onPress={() => router.push('/history')} />
        </View>
        {user ? (
          <View style={styles.card}> 
            <SecondaryButton title="My items" onPress={() => {}} />
          </View>
        ) : null}
        {user ? (
          <View style={styles.card}> 
            <SecondaryButton
              title="Logout"
              onPress={async () => {
                try {
                  await signOut(auth);
                  Alert.alert('Signed out');
                } catch (e: any) {
                  console.error(e?.message ?? e);
                  Alert.alert('Sign out failed');
                }
              }}
            />
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.meta}>Niste prijavljeni</Text>
            <PrimaryButton
              title="Prijava"
              onPress={() => router.push('/login')}
            />
            <SecondaryButton
              title="Registracija"
              onPress={() => router.push('/registration')}
            />
          </View>
        )}

        {user ? (
          !user.emailVerified ? (
            <View style={styles.card}>
              <PrimaryButton
                title="Send verification email"
                onPress={async () => {
                  try {
                    if (!auth.currentUser) throw new Error('No user');
                    await sendEmailVerification(auth.currentUser);
                    Alert.alert('Verification email sent');
                  } catch (e: any) {
                    console.error(e?.message ?? e);
                    Alert.alert('Failed to send verification email');
                  }
                }}
              />
            </View>
          ) : null
        ) : null}

        {user ? (
          <View style={styles.card}>
            <SecondaryButton
              title="Send password reset"
              onPress={async () => {
                try {
                  const email = auth.currentUser?.email;
                  if (!email) throw new Error('No email on account');
                  await sendPasswordResetEmail(auth, email);
                  Alert.alert('Password reset email sent');
                } catch (e: any) {
                  console.error(e?.message ?? e);
                  Alert.alert('Failed to send reset email');
                }
              }}
            />
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.meta}>Enter email to reset password:</Text>
            <TextInput
              value={resetEmail}
              onChangeText={setResetEmail}
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />
            <SecondaryButton
              title="Send password reset"
              onPress={async () => {
                try {
                  if (!resetEmail) {
                    Alert.alert('Please enter an email');
                    return;
                  }
                  await sendPasswordResetEmail(auth, resetEmail.trim());
                  Alert.alert('Password reset email sent');
                } catch (e: any) {
                  console.error(e?.message ?? e);
                  Alert.alert(String(e?.code ?? 'auth/error'));
                }
              }}
            />
          </View>
        )}
        {user ? (
          <View style={styles.card}>
            <PrimaryButton title="Moji pogovori" onPress={() => router.push('/chats')} />
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  container: { flex: 1, paddingHorizontal: Spacing.md, paddingTop: Spacing.md, gap: Spacing.md },
  center: { alignItems: 'center', gap: 8 },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: Colors.grayLight },
  name: { fontSize: 18, fontWeight: '700', color: Colors.black },
  meta: { fontSize: 12, color: Colors.grayDark },
  card: { backgroundColor: Colors.white, padding: Spacing.md, borderRadius: Radius.md, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  input: { borderWidth: 1, borderColor: Colors.grayLight, borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 10, marginTop: Spacing.sm },
});

export default ProfileScreen;
