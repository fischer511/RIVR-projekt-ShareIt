import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Colors, Spacing } from '@src/constants/colors';
import FormField from '@src/components/FormField';
import PrimaryButton from '@src/components/PrimaryButton';
import SecondaryButton from '@src/components/SecondaryButton';
import { createItem } from '@src/services/items';

const AddItemScreen: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [city, setCity] = useState('');
  const [gps, setGps] = useState<{ lat?: number; lng?: number }>({});
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  const mockAddImage = () => Alert.alert('Image', 'Add image (mock)');
  const useGps = () => { setGps({ lat: 46.0569, lng: 14.5058 }); setCity('Ljubljana'); };

  const submit = async () => {
    const e: { [k: string]: string } = {};
    if (!title) e.title = 'Required';
    if (!description) e.description = 'Required';
    if (!category) e.category = 'Required';
    if (!price || isNaN(Number(price))) e.price = 'Required numeric';
    setErrors(e);
    if (Object.keys(e).length) return;
    try {
      const id = await createItem({
        title,
        description,
        category,
        pricePerDay: Number(price),
        availabilityFrom: fromDate || undefined,
        availabilityTo: toDate || undefined,
        city: city || undefined,
        location: gps,
      });
      Alert.alert('Item published', `ID: ${id}`);
      setTitle(''); setDescription(''); setCategory(''); setPrice(''); setFromDate(''); setToDate(''); setCity(''); setGps({});
    } catch (err: any) {
      console.error(err?.message ?? err);
      if (String(err?.message).includes('email-not-verified')) {
        Alert.alert('Please verify your email before publishing.');
      } else if (String(err?.message).includes('not-signed-in')) {
        Alert.alert('Please sign in to publish items.');
      } else {
        Alert.alert('Failed to publish item');
      }
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Publish item</Text>
        <FormField label="Title" value={title} onChangeText={setTitle} error={errors.title} />
        <FormField label="Description" value={description} onChangeText={setDescription} error={errors.description} />
        <FormField label="Category" value={category} onChangeText={setCategory} error={errors.category} />
        <FormField label="Price/day (€)" value={price} onChangeText={setPrice} error={errors.price} />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <FormField label="From" value={fromDate} onChangeText={setFromDate} placeholder="YYYY-MM-DD" />
          <FormField label="To" value={toDate} onChangeText={setToDate} placeholder="YYYY-MM-DD" />
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <SecondaryButton title="Add image" onPress={mockAddImage} />
        </View>

        <Text style={styles.section}>Location</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <PrimaryButton title="Use GPS" onPress={useGps} />
          <FormField label="City" value={city} onChangeText={setCity} />
        </View>
        <Text style={styles.helper}>{gps.lat ? `GPS set: ${gps.lat.toFixed(4)}, ${gps.lng?.toFixed(4)}` : 'GPS not set'}</Text>

        <PrimaryButton title="Publish" onPress={submit} style={{ marginTop: Spacing.md }} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  container: { flex: 1, paddingHorizontal: Spacing.md, paddingTop: Spacing.md, gap: Spacing.sm },
  title: { fontSize: 18, fontWeight: '700', color: Colors.black },
  section: { fontSize: 14, fontWeight: '600', color: Colors.grayDark, marginTop: Spacing.md },
  helper: { fontSize: 12, color: Colors.grayDark },
});

export default AddItemScreen;
