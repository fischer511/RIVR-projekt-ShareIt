import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Radius, Spacing } from '@src/constants/colors';
import FormField from '@src/components/FormField';
import PrimaryButton from '@src/components/PrimaryButton';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@src/services/firebase';
import { getItemById } from '@src/services/items';

const RequestBookingScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ fromDate?: string; toDate?: string }>({});
  const [loading, setLoading] = useState(false);
  const [itemOwnerId, setItemOwnerId] = useState<string | null>(null);
  const [itemTitle, setItemTitle] = useState<string>('');

  useEffect(() => {
    const fetchItem = async () => {
      if (id) {
        const item = await getItemById(id);
        if (item) {
          setItemOwnerId(item.ownerUid);
          setItemTitle(item.title);
        }
      }
    };
    fetchItem();
  }, [id]);

  const submit = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Napaka', 'Morate biti prijavljeni za rezervacijo');
      return;
    }

    if (!itemOwnerId) {
      Alert.alert('Napaka', 'Predmet ni najden');
      return;
    }

    const e: typeof errors = {};
    if (!fromDate) e.fromDate = 'Obvezno';
    if (!toDate) e.toDate = 'Obvezno';
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'bookings'), {
        itemId: id,
        itemTitle: itemTitle,
        userUid: user.uid,
        ownerUid: itemOwnerId,
        fromDate,
        toDate,
        message: message || null,
        status: 'Pending',
        createdAt: serverTimestamp(),
      });
      Alert.alert('Uspeh', 'Zahteva za rezervacijo je bila poslana!');
      router.back();
    } catch (error: any) {
      console.error('Error creating booking:', error);
      Alert.alert('Napaka', 'Ni bilo mogoče poslati zahteve');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Rezervacija</Text>
        <FormField label="Od datuma" value={fromDate} onChangeText={setFromDate} placeholder="YYYY-MM-DD" error={errors.fromDate} />
        <FormField label="Do datuma" value={toDate} onChangeText={setToDate} placeholder="YYYY-MM-DD" error={errors.toDate} />
        <FormField label="Sporočilo (neobvezno)" value={message} onChangeText={setMessage} placeholder="Napišite sporočilo lastniku" />

        <PrimaryButton 
          title={loading ? "Pošiljanje..." : "Pošlji zahtevo"} 
          onPress={submit} 
          style={{ marginTop: Spacing.md }} 
          disabled={loading}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  container: { flex: 1, paddingHorizontal: Spacing.md, paddingTop: Spacing.md, gap: Spacing.sm },
  title: { fontSize: 18, fontWeight: '700', color: Colors.black },
});

export default RequestBookingScreen;
