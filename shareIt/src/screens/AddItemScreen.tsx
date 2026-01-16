import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Colors, Spacing, Radius } from '@src/constants/colors';
import FormField from '@src/components/FormField';
import PrimaryButton from '@src/components/PrimaryButton';
import SecondaryButton from '@src/components/SecondaryButton';
import { createItem } from '@src/services/items';
import { imagesToBase64 } from '@src/services/storage';
import { Category } from '@src/models';

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'tools', label: 'Orodje' },
  { value: 'sports', label: 'Šport' },
  { value: 'appliances', label: 'Gospodinjstvo' },
  { value: 'gardening', label: 'Vrt' },
  { value: 'diy', label: 'DIY' },
  { value: 'other', label: 'Drugo' },
];

const AddItemScreen: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [price, setPrice] = useState('');
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [gps, setGps] = useState<{ lat?: number; lng?: number }>({});
  const [images, setImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Izbira slike iz galerije
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Dovoljenje zavrnjeno', 'Potrebujemo dostop do galerije.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets) {
      const newUris = result.assets.map((a) => a.uri);
      setImages((prev) => [...prev, ...newUris].slice(0, 5)); // max 5 slik
    }
  };

  // Zajem slike s kamero
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Dovoljenje zavrnjeno', 'Potrebujemo dostop do kamere.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled && result.assets) {
      setImages((prev) => [...prev, result.assets[0].uri].slice(0, 5));
    }
  };

  // Odstrani sliko
  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Pridobi GPS lokacijo
  const getGpsLocation = async () => {
    setGpsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Dovoljenje zavrnjeno', 'Potrebujemo dostop do lokacije.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setGps({ lat: loc.coords.latitude, lng: loc.coords.longitude });

      // Reverse geocode za mesto
      const [place] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      if (place) {
        setCity(place.city || place.subregion || '');
        setAddress(place.street ? `${place.street} ${place.streetNumber || ''}`.trim() : '');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Napaka', 'Ni bilo mogoče pridobiti lokacije.');
    } finally {
      setGpsLoading(false);
    }
  };

  // Validacija in objava
  const submit = async () => {
    const e: { [k: string]: string } = {};
    if (!title.trim()) e.title = 'Obvezno polje';
    if (!description.trim()) e.description = 'Obvezno polje';
    if (!category) e.category = 'Izberite kategorijo';
    if (!price || isNaN(Number(price)) || Number(price) <= 0) e.price = 'Vnesite veljavno ceno';
    if (images.length === 0) e.images = 'Dodajte vsaj eno sliko';
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      // Pretvori slike v Base64 (kompresija za manjšo velikost)
      console.log('[AddItem] local image URIs =', images);
      const photoUrls = await imagesToBase64(images);
      console.log('[AddItem] converted photoUrls count=', photoUrls.length);
      if (photoUrls.length) console.log('[AddItem] sample photo length=', (photoUrls[0] || '').length);

      // Ustvari predmet v Firestore
      const id = await createItem({
        title: title.trim(),
        description: description.trim(),
        category: category as Category,
        pricePerDay: Number(price),
        photos: photoUrls,
        images: photoUrls, // ensure images written too
        availabilityFrom: fromDate ? fromDate.toISOString().split('T')[0] : undefined,
        availabilityTo: toDate ? toDate.toISOString().split('T')[0] : undefined,
        city: city || undefined,
        location: gps.lat ? { lat: gps.lat, lng: gps.lng, address: address || undefined } : undefined,
      });

      Alert.alert('Uspešno objavljeno!', `Vaš predmet je zdaj viden drugim uporabnikom.`);
      
      // Ponastavi obrazec
      setTitle('');
      setDescription('');
      setCategory('');
      setPrice('');
      setFromDate(null);
      setToDate(null);
      setCity('');
      setAddress('');
      setGps({});
      setImages([]);
      setErrors({});
    } catch (err: any) {
      console.error(err?.message ?? err);
      if (String(err?.message).includes('email-not-verified')) {
        Alert.alert('Napaka', 'Pred objavo potrdite svoj e-poštni naslov.');
      } else if (String(err?.message).includes('not-signed-in')) {
        Alert.alert('Napaka', 'Za objavo se morate prijaviti.');
      } else {
        Alert.alert('Napaka', 'Objava ni uspela. Poskusite znova.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Objavi predmet</Text>

        {/* Naslov */}
        <FormField
          label="Naziv *"
          value={title}
          onChangeText={setTitle}
          error={errors.title}
          placeholder="Vnesite naziv"
        />

        {/* Opis */}
        <FormField
          label="Opis *"
          value={description}
          onChangeText={setDescription}
          error={errors.description}
          placeholder="Opišite predmet"
          inputProps={{ multiline: true, numberOfLines: 4, textAlignVertical: 'top' }}
          containerStyle={{ minHeight: 100 }}
        />

        {/* Kategorija */}
        <View style={styles.fieldWrap}>
          <Text style={styles.label}>Kategorija *</Text>
          <View style={styles.categoryRow}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[styles.categoryChip, category === cat.value && styles.categoryChipActive]}
                onPress={() => setCategory(cat.value)}
              >
                <Text style={[styles.categoryText, category === cat.value && styles.categoryTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.category && <Text style={styles.error}>{errors.category}</Text>}
        </View>

        {/* Cena */}
        <FormField
          label="Cena na dan (€) *"
          value={price}
          onChangeText={setPrice}
          error={errors.price}
          placeholder=""
          inputProps={{ keyboardType: 'numeric' }}
        />

        {/* Razpoložljivost */}
        <Text style={styles.section}>Razpoložljivost</Text>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Od</Text>
            <TouchableOpacity style={styles.dateBtn} onPress={() => setShowFromPicker(true)}>
              <Text style={styles.dateBtnText}>
                {fromDate ? fromDate.toLocaleDateString('sl-SI') : 'Izberi datum'}
              </Text>
            </TouchableOpacity>
            {showFromPicker && (
              <DateTimePicker
                value={fromDate || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event: DateTimePickerEvent, date?: Date) => {
                  setShowFromPicker(Platform.OS === 'ios');
                  if (date) setFromDate(date);
                }}
                minimumDate={new Date()}
              />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Do</Text>
            <TouchableOpacity style={styles.dateBtn} onPress={() => setShowToPicker(true)}>
              <Text style={styles.dateBtnText}>
                {toDate ? toDate.toLocaleDateString('sl-SI') : 'Izberi datum'}
              </Text>
            </TouchableOpacity>
            {showToPicker && (
              <DateTimePicker
                value={toDate || fromDate || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event: DateTimePickerEvent, date?: Date) => {
                  setShowToPicker(Platform.OS === 'ios');
                  if (date) setToDate(date);
                }}
                minimumDate={fromDate || new Date()}
              />
            )}
          </View>
        </View>

        {/* Slike */}
        <Text style={styles.section}>Slike *</Text>
        <View style={styles.row}>
          <SecondaryButton title="📷 Kamera" onPress={takePhoto} />
          <SecondaryButton title="🖼️ Galerija" onPress={pickImage} />
        </View>
        {images.length > 0 && (
          <View style={styles.imageRow}>
            {images.map((uri, idx) => (
              <TouchableOpacity key={idx} onPress={() => removeImage(idx)} style={styles.imageWrap}>
                <Image source={{ uri }} style={styles.thumbnail} />
                <View style={styles.removeBtn}>
                  <Text style={styles.removeTxt}>✕</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {errors.images && <Text style={styles.error}>{errors.images}</Text>}
        <Text style={styles.helper}>Dodajte do 5 slik. Tapnite za odstranitev.</Text>

        {/* Lokacija */}
        <Text style={styles.section}>Lokacija</Text>
        <View style={styles.row}>
          <PrimaryButton
            title={gpsLoading ? 'Pridobivam...' : '📍 Uporabi GPS'}
            onPress={getGpsLocation}
            disabled={gpsLoading}
          />
        </View>
        {gps.lat && (
          <Text style={styles.helper}>
            GPS: {gps.lat.toFixed(4)}, {gps.lng?.toFixed(4)}
          </Text>
        )}
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <FormField label="Mesto" value={city} onChangeText={setCity} placeholder="npr. Ljubljana" />
          </View>
          <View style={{ flex: 1 }}>
            <FormField label="Naslov" value={address} onChangeText={setAddress} placeholder="npr. Slovenska 1" />
          </View>
        </View>

        {/* Objavi */}
        <PrimaryButton
          title={loading ? 'Objavljam...' : 'Objavi predmet'}
          onPress={submit}
          disabled={loading}
          style={{ marginTop: Spacing.lg, marginBottom: Spacing.xl }}
        />
        {loading && <ActivityIndicator size="large" color={Colors.primary} />}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  container: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md, gap: Spacing.sm },
  title: { fontSize: 20, fontWeight: '700', color: Colors.black, marginBottom: Spacing.sm },
  section: { fontSize: 14, fontWeight: '600', color: Colors.grayDark, marginTop: Spacing.md },
  label: { fontSize: 13, color: Colors.grayDark, marginBottom: 6 },
  fieldWrap: { gap: 6 },
  row: { flexDirection: 'row', gap: 8 },
  helper: { fontSize: 12, color: Colors.grayDark },
  error: { fontSize: 12, color: Colors.danger },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.lg,
    backgroundColor: Colors.grayLight,
  },
  categoryChipActive: { backgroundColor: Colors.primary },
  categoryText: { fontSize: 13, color: Colors.grayDark },
  categoryTextActive: { color: Colors.white, fontWeight: '600' },
  dateBtn: {
    backgroundColor: Colors.grayLight,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  dateBtnText: { fontSize: 14, color: Colors.black },
  imageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  imageWrap: { position: 'relative' },
  thumbnail: { width: 72, height: 72, borderRadius: Radius.md },
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: Colors.danger,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeTxt: { color: Colors.white, fontSize: 12, fontWeight: '700' },
});

export default AddItemScreen;