import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert, ActivityIndicator, Image, ScrollView, Pressable } from 'react-native';
import { Colors, Spacing } from '../constants/colors';
import FormField from '../components/FormField';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import { createItem } from '../services/items';
import { getUserLocation, getCityFromCoordinates, Coordinates } from '../services/location';
import * as ImagePicker from 'expo-image-picker';
import { auth, storage } from '../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const AddItemScreen: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [city, setCity] = useState('');
  const [gps, setGps] = useState<Coordinates | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const pickImages = async () => {
    if (images.length >= 5) {
      Alert.alert('Največ 5 slik');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [ImagePicker.MediaType.Images],
      allowsMultipleSelection: true,
      selectionLimit: 5 - images.length,
      quality: 0.8,
    });
    if (result.canceled) return;
    const selected = result.assets.map((a) => a.uri).filter(Boolean);
    setImages((prev) => [...prev, ...selected].slice(0, 5));
  };

  const removeImage = (uri: string) => {
    setImages((prev) => prev.filter((u) => u !== uri));
  };

  const uploadImageAsync = async (uri: string, ownerUid: string) => {
    // Za web - uporabi base64 data URL direktno (CORS workaround)
    if (uri.startsWith('data:')) {
      return uri; // Že je data URL
    }
    
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Za web - pretvori v base64 namesto uploada v Storage
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image:', error);
      // Fallback - uporabi picsum placeholder
      return `https://picsum.photos/seed/${Date.now()}/800/600`;
    }
  };

  const handleUseGps = async () => {
    setIsGettingLocation(true);
    try {
      const location = await getUserLocation();
      if (location) {
        setGps(location);
        const cityName = await getCityFromCoordinates(location);
        if (cityName) {
          setCity(cityName);
          Alert.alert('Uspeh', 'GPS lokacija in mesto sta nastavljena.');
        } else {
          Alert.alert('Opozorilo', 'GPS lokacija je nastavljena, mesto pa ni bilo najdeno.');
        }
      } else {
        Alert.alert('Napaka', 'Lokacije ni bilo mogoče pridobiti. Preveri dovoljenja.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Napaka', 'Prišlo je do napake pri pridobivanju lokacije.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const submit = async () => {
    const e: { [k: string]: string } = {};
    if (!title) e.title = 'Obvezno';
    if (!description) e.description = 'Obvezno';
    if (!category) e.category = 'Obvezno';
    if (!price || isNaN(Number(price))) e.price = 'Vnesi številko';
    if (!city) e.city = 'Obvezno';
    setErrors(e);
    if (Object.keys(e).length) return;
    try {
      setIsUploading(true);
      const ownerUid = auth.currentUser?.uid;
      
      // Upload/convert slike
      let imageUrls: string[] = [];
      if (images.length > 0 && ownerUid) {
        imageUrls = await Promise.all(images.map((uri) => uploadImageAsync(uri, ownerUid)));
      }
      
      const id = await createItem({
        title,
        description,
        category,
        pricePerDay: Number(price),
        availabilityFrom: fromDate || undefined,
        availabilityTo: toDate || undefined,
        city: city,
        location: gps ? { lat: gps.latitude, lng: gps.longitude } : undefined,
        images: imageUrls.length > 0 ? imageUrls : undefined,
      });
      Alert.alert('Ponudba objavljena', `ID: ${id}`);
      setTitle(''); setDescription(''); setCategory(''); setPrice(''); setFromDate(''); setToDate(''); setCity(''); setGps(null); setImages([]);
    } catch (err: any) {
      console.error(err?.message ?? err);
      if (String(err?.message).includes('email-not-verified')) {
        Alert.alert('Pred objavo potrdi svoj e-mail.');
      } else if (String(err?.message).includes('not-signed-in')) {
        Alert.alert('Za objavo se prijavi.');
      } else {
        Alert.alert('Objava ni uspela');
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Objavi predmet</Text>
        <FormField label="Naslov" value={title} onChangeText={setTitle} error={errors.title} />
        <FormField label="Opis" value={description} onChangeText={setDescription} error={errors.description} />
        <FormField label="Kategorija" value={category} onChangeText={setCategory} error={errors.category} />
        <FormField label="Cena/dan (EUR)" value={price} onChangeText={setPrice} error={errors.price} />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <FormField label="Razpoložljivo od" value={fromDate} onChangeText={setFromDate} placeholder="YYYY-MM-DD" />
          <FormField label="Razpoložljivo do" value={toDate} onChangeText={setToDate} placeholder="YYYY-MM-DD" />
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <SecondaryButton title="Dodaj sliko" onPress={pickImages} />
        </View>
        <Text style={styles.helper}>Slike bodo shranjene kot base64 (za web)</Text>
        {images.length > 0 ? (
          <View style={styles.imageGrid}>
            {images.map((uri) => (
              <Pressable key={uri} onPress={() => removeImage(uri)} style={styles.imageWrap}>
                <Image source={{ uri }} style={styles.image} />
                <Text style={styles.removeText}>Odstrani</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <Text style={styles.section}>Lokacija</Text>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <PrimaryButton title="Uporabi GPS" onPress={handleUseGps} disabled={isGettingLocation} />
          {isGettingLocation && <ActivityIndicator />}
          <FormField label="Mesto" value={city} onChangeText={setCity} error={errors.city} />
        </View>
        <Text style={styles.helper}>{gps ? `GPS nastavljen: ${gps.latitude.toFixed(4)}, ${gps.longitude?.toFixed(4)}` : 'GPS ni nastavljen'}</Text>

        <PrimaryButton title={isUploading ? 'Nalagam...' : 'Objavi'} onPress={submit} style={{ marginTop: Spacing.md }} disabled={isUploading} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  container: { flex: 1, paddingHorizontal: Spacing.md, paddingTop: Spacing.md, gap: Spacing.sm },
  title: { fontSize: 18, fontWeight: '700', color: Colors.black },
  section: { fontSize: 14, fontWeight: '600', color: Colors.grayDark, marginTop: Spacing.md },
  helper: { fontSize: 12, color: Colors.grayDark },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  imageWrap: { width: 90, alignItems: 'center', gap: 4 },
  image: { width: 90, height: 90, borderRadius: 8, backgroundColor: Colors.grayLight },
  removeText: { fontSize: 10, color: Colors.grayDark },
});

export default AddItemScreen;
