import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, Alert, TextInput } from 'react-native';
import { Colors, Spacing, Radius } from '@src/constants/colors';
import PrimaryButton from '@src/components/PrimaryButton';
import SecondaryButton from '@src/components/SecondaryButton';
import { useRouter } from 'expo-router';
import { signOut, onAuthStateChanged, signInWithEmailAndPassword, User, sendEmailVerification, sendPasswordResetEmail, createUserWithEmailAndPassword, updateProfile, deleteUser, reload } from 'firebase/auth';
import { auth, db } from '@src/services/firebase';
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [resetEmail, setResetEmail] = useState<string>('');
  const [profileName, setProfileName] = useState<string>('');
  const [profileCity, setProfileCity] = useState<string>('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>('');
  const [profileLoading, setProfileLoading] = useState<boolean>(false);
  const [profileSaving, setProfileSaving] = useState<boolean>(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setProfileName('');
        setProfileCity('');
        setProfilePhotoUrl('');
        return;
      }

      setProfileLoading(true);
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        const data = snap.exists() ? snap.data() : {};
        setProfileName(String(data?.name ?? user.displayName ?? ''));
        setProfileCity(String(data?.city ?? ''));
        setProfilePhotoUrl(String(data?.photoUrl ?? user.photoURL ?? ''));
      } catch (e: any) {
        console.error(e?.message ?? e);
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.center}>
          <Image
            source={{ uri: profilePhotoUrl || 'https://placekitten.com/200/200' }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{profileName || user?.email || 'Odjavljen/a'}</Text>
          {user ? (
            <Text style={styles.meta}>UID: {user.uid}</Text>
          ) : (
            <Text style={styles.meta}>Spodaj se prijaviš</Text>
          )}
          {user ? (
            <Text style={styles.meta}>
              Email potrjen: {user.emailVerified ? 'Da' : 'Ne'}
            </Text>
          ) : null}
        </View>
        <View style={styles.card}>
          <PrimaryButton title="Zgodovina izposoj" onPress={() => router.push('/history')} />
        </View>
        <View style={styles.card}>
          <SecondaryButton title="Obvestila" onPress={() => router.push('/notifications')} />
        </View>
        {user ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Podatki profila</Text>
            <Text style={styles.meta}>Ime</Text>
            <TextInput
              value={profileName}
              onChangeText={setProfileName}
              placeholder="Tvoje ime"
              autoCapitalize="words"
              style={styles.input}
              editable={!profileLoading && !profileSaving}
            />
            <Text style={styles.meta}>Mesto</Text>
            <TextInput
              value={profileCity}
              onChangeText={setProfileCity}
              placeholder="Mesto"
              autoCapitalize="words"
              style={styles.input}
              editable={!profileLoading && !profileSaving}
            />
            <Text style={styles.meta}>URL slike</Text>
            <TextInput
              value={profilePhotoUrl}
              onChangeText={setProfilePhotoUrl}
              placeholder="https://..."
              autoCapitalize="none"
              style={styles.input}
              editable={!profileLoading && !profileSaving}
            />
            <PrimaryButton
              title={profileSaving ? 'Shranjujem...' : 'Shrani profil'}
              disabled={profileLoading || profileSaving}
              onPress={async () => {
                if (!user) return;
                try {
                  setProfileSaving(true);
                  const name = profileName.trim();
                  const city = profileCity.trim();
                  const photoUrl = profilePhotoUrl.trim();

                  await setDoc(
                    doc(db, 'users', user.uid),
                    {
                      email: user.email,
                      name: name || null,
                      city: city || null,
                      photoUrl: photoUrl || null,
                      updatedAt: serverTimestamp(),
                    },
                    { merge: true }
                  );

                  await updateProfile(user, {
                    displayName: name || null,
                    photoURL: photoUrl || null,
                  });

                  await reload(user);
                  setUser(auth.currentUser);
                  Alert.alert('Profil posodobljen');
                } catch (e: any) {
                  console.error(e?.message ?? e);
                  Alert.alert('Posodobitev ni uspela');
                } finally {
                  setProfileSaving(false);
                }
              }}
            />
          </View>
        ) : null}
        {user ? (
          <View style={styles.card}>
            <SecondaryButton title="Moji priljubljeni" onPress={() => router.push('/(tabs)/favorites')} />
          </View>
        ) : null}
        {user ? (
          <View style={styles.card}>
            <SecondaryButton title="Moji predmeti" onPress={() => router.push('/my-items')} />
          </View>
        ) : null}
        {user ? (
          <View style={styles.card}>
            <SecondaryButton
              title="Odjava"
              onPress={async () => {
                try {
                  await signOut(auth);
                  Alert.alert('Odjavljen/a');
                } catch (e: any) {
                  console.error(e?.message ?? e);
                  Alert.alert('Odjava ni uspela');
                }
              }}
            />
          </View>
        ) : (
          <View style={styles.card}>
            <PrimaryButton
              title="Prijava testnega uporabnika"
              onPress={async () => {
                try {
                  const cred = await signInWithEmailAndPassword(auth, 'testuser1@test.com', 'test123456');
                  console.log('LOGIN OK', cred.user?.uid);
                  Alert.alert('Prijavljen/a');
                } catch (e: any) {
                  console.error(e?.message ?? e);
                  Alert.alert('Prijava ni uspela. Če račun ne obstaja, ga registriraj spodaj.');
                }
              }}
            />
            <PrimaryButton
              title="Prijava testnega uporabnika 2"
              onPress={async () => {
                try {
                  const cred = await signInWithEmailAndPassword(auth, 'testuser2@test.com', 'test123456');
                  console.log('LOGIN2 OK', cred.user?.uid);
                  Alert.alert('Prijavljen/a');
                } catch (e: any) {
                  console.error(e?.message ?? e);
                  Alert.alert('Prijava ni uspela. Če račun ne obstaja, ga registriraj spodaj.');
                }
              }}
            />
            <SecondaryButton
              title="Registriraj testnega uporabnika"
              onPress={async () => {
                try {
                  const cred = await createUserWithEmailAndPassword(auth, 'testuser1@test.com', 'test123456');
                  console.log('REGISTER OK', cred.user?.uid);
                  Alert.alert('Uporabnik registriran. Verifikacija e-maila po prijavi.');
                } catch (e: any) {
                  console.error(e?.message ?? e);
                  Alert.alert(String(e?.code ?? 'auth/error'));
                }
              }}
            />
            <SecondaryButton
              title="Registriraj testnega uporabnika 2"
              onPress={async () => {
                try {
                  const cred = await createUserWithEmailAndPassword(auth, 'testuser2@test.com', 'test123456');
                  console.log('REGISTER2 OK', cred.user?.uid);
                  Alert.alert('Uporabnik registriran. Verifikacija e-maila po prijavi.');
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
            <SecondaryButton
              title="Izbriši račun"
              onPress={() => {
                Alert.alert(
                  'Izbriši račun',
                  'To bo odstranilo tvoj profil in dostop do aplikacije. Dejanja ni mogoče razveljaviti.',
                  [
                    { text: 'Prekliči', style: 'cancel' },
                    {
                      text: 'Izbriši',
                      style: 'destructive',
                      onPress: async () => {
                        try {
                          if (!auth.currentUser) throw new Error('No user');
                          const currentUser = auth.currentUser;
                          await deleteDoc(doc(db, 'users', currentUser.uid));
                          await deleteUser(currentUser);
                          Alert.alert('Račun izbrisan');
                        } catch (e: any) {
                          console.error(e?.message ?? e);
                          if (e?.code === 'auth/requires-recent-login') {
                            Alert.alert('Ponovno se prijavi in poskusi znova.');
                          } else {
                            Alert.alert('Brisanje računa ni uspelo');
                          }
                        }
                      },
                    },
                  ]
                );
              }}
            />
          </View>
        ) : null}

        {user ? (
          !user.emailVerified ? (
            <View style={styles.card}>
              <PrimaryButton
                title="Pošlji verifikacijo e-maila"
                onPress={async () => {
                  try {
                    if (!auth.currentUser) throw new Error('No user');
                    await sendEmailVerification(auth.currentUser);
                    Alert.alert('Verifikacijski e-mail poslan');
                  } catch (e: any) {
                    console.error(e?.message ?? e);
                    Alert.alert('Pošiljanje ni uspelo');
                  }
                }}
              />
            </View>
          ) : null
        ) : null}

        {user ? (
          <View style={styles.card}>
            <SecondaryButton
              title="Pošlji ponastavitev gesla"
              onPress={async () => {
                try {
                  const email = auth.currentUser?.email;
                  if (!email) throw new Error('No email on account');
                  await sendPasswordResetEmail(auth, email);
                  Alert.alert('E-mail za ponastavitev gesla je poslan');
                } catch (e: any) {
                  console.error(e?.message ?? e);
                  Alert.alert('Pošiljanje ni uspelo');
                }
              }}
            />
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.meta}>Vnesi e-mail za ponastavitev gesla:</Text>
            <TextInput
              value={resetEmail}
              onChangeText={setResetEmail}
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />
            <SecondaryButton
              title="Pošlji ponastavitev gesla"
              onPress={async () => {
                try {
                  if (!resetEmail) {
                    Alert.alert('Vnesi e-mail');
                    return;
                  }
                  await sendPasswordResetEmail(auth, resetEmail.trim());
                  Alert.alert('E-mail za ponastavitev gesla je poslan');
                } catch (e: any) {
                  console.error(e?.message ?? e);
                  Alert.alert(String(e?.code ?? 'auth/error'));
                }
              }}
            />
          </View>
        )}
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
  meta: { fontSize: 13, color: Colors.grayDark },
  card: { backgroundColor: Colors.white, padding: Spacing.md, borderRadius: Radius.md, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.black, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: Colors.grayLight, borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 10, marginTop: Spacing.sm },
});

export default ProfileScreen;
