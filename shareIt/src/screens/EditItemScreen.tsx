import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing } from '@src/constants/colors';
import FormField from '@src/components/FormField';
import PrimaryButton from '@src/components/PrimaryButton';
import { getItemById, updateItem, deleteItem } from '@src/services/items';
import { auth } from '@src/services/firebase';

const EditItemScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const item = await getItemById(id);
      if (!item) return;
      if (auth.currentUser?.uid !== item.ownerUid) {
        Alert.alert('Nimaš pravic za urejanje');
        router.back();
        return;
      }
      setTitle(item.title || '');
      setDescription(item.description || '');
      setCategory(item.category || '');
      setPrice(String(item.pricePerDay || ''));
      setFromDate(String(item.availabilityFrom || ''));
      setToDate(String(item.availabilityTo || ''));
      setCity(item.city || '');
    };
    load();
  }, [id, router]);

  const save = async () => {
    if (!id) return;
    await updateItem(id, {
      title,
      description,
      category,
      pricePerDay: Number(price),
      availabilityFrom: fromDate || null,
      availabilityTo: toDate || null,
      city,
    } as any);
    Alert.alert('Oglas posodobljen');
    router.back();
  };

  const remove = async () => {
    if (!id) return;
    Alert.alert('Izbriši oglas', 'Si prepričan/a?', [
      { text: 'Prekliči', style: 'cancel' },
      {
        text: 'Izbriši',
        style: 'destructive',
        onPress: async () => {
          await deleteItem(id);
          router.replace('/my-items');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Uredi oglas</Text>
        <FormField label="Naslov" value={title} onChangeText={setTitle} />
        <FormField label="Opis" value={description} onChangeText={setDescription} />
        <FormField label="Kategorija" value={category} onChangeText={setCategory} />
        <FormField label="Cena/dan (EUR)" value={price} onChangeText={setPrice} />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <FormField label="Razpoložljivo od" value={fromDate} onChangeText={setFromDate} placeholder="YYYY-MM-DD" />
          <FormField label="Razpoložljivo do" value={toDate} onChangeText={setToDate} placeholder="YYYY-MM-DD" />
        </View>
        <FormField label="Mesto" value={city} onChangeText={setCity} />

        <PrimaryButton title="Shrani" onPress={save} style={{ marginTop: Spacing.md }} />
        <PrimaryButton title="Izbriši" onPress={remove} style={{ marginTop: Spacing.sm, backgroundColor: Colors.danger }} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  container: { flex: 1, paddingHorizontal: Spacing.md, paddingTop: Spacing.md, gap: Spacing.sm },
  title: { fontSize: 18, fontWeight: '700', color: Colors.black },
});

export default EditItemScreen;
