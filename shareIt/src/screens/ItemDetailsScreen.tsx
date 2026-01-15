import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, Alert, ActivityIndicator, Modal, Pressable, Dimensions, Linking, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Radius, Spacing } from '../constants/colors';
import { Item } from '../models/Item';
import { getItemById, getUserProfile } from '../services/items';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import FavoriteButton from '../components/FavoriteButton';
import { User } from '../models/User';
import { Ionicons } from '@expo/vector-icons';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import ItemMap from '../components/ItemMap';
import { createBooking, getItemBookings } from '../services/bookings';
import { auth } from '../services/firebase';
import { deleteItem } from '../services/items';
import { getUserLocation, Coordinates } from '../services/location';

const { width } = Dimensions.get('window');

const ItemDetailsScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [item, setItem] = useState<Item | null>(null);
  const [owner, setOwner] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [travelInfo, setTravelInfo] = useState<{ drive?: { km: string; min: string }; walk?: { km: string; min: string } }>({});
  const [showContact, setShowContact] = useState(false);
  const [contactSubject, setContactSubject] = useState('');
  const [contactBody, setContactBody] = useState('');

  useEffect(() => {
    if (id) {
      const fetchItemAndOwner = async () => {
        setLoading(true);
        try {
          const fetchedItem = await getItemById(id);
          setItem(fetchedItem);

          if (fetchedItem?.ownerUid) {
            const fetchedOwner = await getUserProfile(fetchedItem.ownerUid);
            setOwner(fetchedOwner as User);
          }

          if (fetchedItem?.id) {
            const bookings = await getItemBookings(fetchedItem.id);
            const blocked = bookings
              .filter((b) => b.status === 'pending' || b.status === 'confirmed')
              .flatMap((b) => b.dates || []);
            setBookedDates(blocked);
          }
        } catch (error) {
          console.error('Error fetching item details:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchItemAndOwner();
    }
  }, [id]);

  useEffect(() => {
    const loadRoute = async () => {
      if (!item?.location?.lat || !item?.location?.lng) return;
      try {
        const location = await getUserLocation();
        if (!location) return;
        setUserLocation(location);

        const fetchRoute = async (profile: 'driving' | 'foot') => {
          const url = `https://router.project-osrm.org/route/v1/${profile}/${location.longitude},${location.latitude};${item.location.lng},${item.location.lat}?overview=false`;
          const res = await fetch(url);
          const data = await res.json();
          const route = data?.routes?.[0];
          if (!route) return null;
          return {
            km: (route.distance / 1000).toFixed(1),
            min: Math.round(route.duration / 60).toString(),
          };
        };

        const [drive, walk] = await Promise.all([
          fetchRoute('driving'),
          fetchRoute('foot'),
        ]);
        setTravelInfo({ drive: drive || undefined, walk: walk || undefined });
      } catch (e) {
        console.error('Route fetch failed', e);
      }
    };

    loadRoute();
  }, [item?.location?.lat, item?.location?.lng]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={[styles.container, styles.center]}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!item) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={[styles.container, styles.center]}>
          <Text style={styles.empty}>Predmet ni najden.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusLabel = item.status === 'available'
    ? 'Na voljo'
    : item.status === 'booked'
      ? 'Zasedeno'
      : item.status === 'unavailable'
        ? 'Ni na voljo'
        : item.status;

  const isOwner = auth.currentUser?.uid === item.ownerUid;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container}>
        {item.images && item.images.length > 0 ? (
          <Image source={{ uri: item.images[0] }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder} />
        )}

        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{item.title}</Text>
            <FavoriteButton itemId={item.id} size={32} />
          </View>
          <Text style={styles.meta}>{item.category} - {item.pricePerDay} EUR/dan - {item.city}</Text>
          {item.ratingAvg ? (
            <Text style={styles.meta}>Ocena: {item.ratingAvg.toFixed(1)}{item.ratingCount ? ` (${item.ratingCount})` : ''}</Text>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status</Text>
            <Text style={styles.status}>{statusLabel}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lastnik</Text>
            <Text style={styles.owner}>{owner ? (owner.name || owner.email) : (item.ownerUid || 'Neznano')}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Opis</Text>
            <Text style={styles.desc}>{item.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lokacija</Text>
            {item.location?.lat && item.location?.lng ? (
              <ItemMap lat={item.location.lat} lng={item.location.lng} height={200} radiusMeters={1000} />
            ) : (
              <Text style={styles.meta}>Lokacija ni na voljo.</Text>
            )}
            <Text style={styles.mapCaption}>{item.city}</Text>
            {travelInfo.drive || travelInfo.walk ? (
              <View style={styles.travelInfo}>
                {travelInfo.drive ? (
                  <Text style={styles.meta}>Avto: {travelInfo.drive.km} km, {travelInfo.drive.min} min</Text>
                ) : null}
                {travelInfo.walk ? (
                  <Text style={styles.meta}>Peš: {travelInfo.walk.km} km, {travelInfo.walk.min} min</Text>
                ) : null}
              </View>
            ) : (
              <Text style={styles.meta}>Razdalja/čas ni na voljo.</Text>
            )}
          </View>

          <View style={styles.section}>
            <Pressable style={styles.calendarBtn} onPress={() => setShowCalendar(true)}>
              <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
              <Text style={styles.calendarBtnText}>Poglej razpoložljivost in rezerviraj</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.actions}>
          {isOwner ? (
            <PrimaryButton title="Uredi oglas" onPress={() => router.push(`/item/edit/${item.id}`)} />
          ) : null}
          {isOwner ? (
            <SecondaryButton
              title="Izbriši oglas"
              onPress={() => {
                Alert.alert('Izbriši oglas', 'Si prepričan/a?', [
                  { text: 'Prekliči', style: 'cancel' },
                  {
                    text: 'Izbriši',
                    style: 'destructive',
                    onPress: async () => {
                      await deleteItem(item.id);
                      router.replace('/my-items');
                    },
                  },
                ]);
              }}
            />
          ) : null}
          <SecondaryButton
            title="Kontaktiraj ponudnika"
            onPress={() => {
              setContactSubject(`Povpraševanje: ${item.title}`);
              setContactBody('Pozdravljeni,\n\nzanima me izposoja predmeta.\n');
              setShowContact(true);
            }}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={showCalendar} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Rezerviraj {item.title}</Text>
              <Pressable onPress={() => setShowCalendar(false)}>
                <Ionicons name="close" size={28} color={Colors.black} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalScroll}>
              <AvailabilityCalendar
                pricePerDay={item.pricePerDay}
                bookedDates={bookedDates}
                onBook={async (dates) => {
                  try {
                    const currentUser = auth.currentUser;
                    if (!currentUser) {
                      Alert.alert('Napaka', 'Za rezervacijo se moraš prijaviti.');
                      return;
                    }

                    const bookingData = {
                      itemId: item.id,
                      itemTitle: item.title,
                      itemImage: item.images?.[0] || null,
                      ownerUid: item.ownerUid,
                      renterUid: currentUser.uid,
                      dates: dates.map((d) => d.toISOString().split('T')[0]),
                      pricePerDay: item.pricePerDay,
                      totalPrice: dates.length * item.pricePerDay,
                      status: 'pending' as const,
                    };

                    await createBooking(bookingData);
                    setShowCalendar(false);

                    Alert.alert(
                      'Prošnja poslana',
                      `Zahteval/a si ${dates.length} dan/dni za ${dates.length * item.pricePerDay} EUR. Lastnik bo prošnjo pregledal.`
                    );
                  } catch (error) {
                    console.error('Error creating booking:', error);
                    Alert.alert('Napaka', 'Prošnje ni bilo mogoče poslati.');
                  }
                }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showContact} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Kontaktiraj ponudnika</Text>
              <Pressable onPress={() => setShowContact(false)}>
                <Ionicons name="close" size={28} color={Colors.black} />
              </Pressable>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.sectionTitle}>Zadeva</Text>
              <TextInput
                value={contactSubject}
                onChangeText={setContactSubject}
                placeholder="Zadeva"
                style={styles.input}
              />
              <Text style={styles.sectionTitle}>Sporočilo</Text>
              <TextInput
                value={contactBody}
                onChangeText={setContactBody}
                placeholder="Vpiši sporočilo"
                style={[styles.input, styles.textArea]}
                multiline
              />
              <PrimaryButton
                title="Pošlji"
                onPress={() => {
                  const email = owner?.email;
                  if (!email) {
                    Alert.alert('Ni e-maila lastnika');
                    return;
                  }
                  const subject = encodeURIComponent(contactSubject.trim() || 'Povpraševanje');
                  const body = encodeURIComponent(contactBody.trim());
                  Linking.openURL(`mailto:${email}?subject=${subject}&body=${body}`);
                  setShowContact(false);
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  container: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  empty: { color: Colors.grayDark },
  image: { width: width, height: 300 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  imagePlaceholder: { width: width, height: 300, backgroundColor: Colors.grayLight },
  info: { padding: Spacing.md, gap: Spacing.md },
  title: { fontSize: 22, fontWeight: '700', color: Colors.black, flex: 1 },
  meta: { fontSize: 14, color: Colors.grayDark },

  section: { gap: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: Colors.grayDark },
  status: { fontSize: 15, fontWeight: 'bold', color: Colors.primary },
  owner: { fontSize: 15, color: Colors.black },
  desc: { fontSize: 15, color: Colors.black, lineHeight: 22 },

  mapCaption: { fontSize: 13, color: Colors.grayDark, marginTop: 4, textAlign: 'center' },
  travelInfo: { marginTop: Spacing.sm, gap: 4 },

  calendarBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, backgroundColor: Colors.white, borderWidth: 2, borderColor: Colors.primary, borderRadius: Radius.md },
  calendarBtnText: { fontSize: 16, fontWeight: '600', color: Colors.primary },

  actions: { padding: Spacing.md, gap: Spacing.sm, backgroundColor: Colors.white },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: Spacing.md },
  modalContent: { backgroundColor: Colors.white, borderRadius: Radius.xl, maxHeight: '80%', width: '100%', maxWidth: 600 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.grayLight },
  modalTitle: { fontSize: 20, fontWeight: '700', color: Colors.black, flex: 1 },
  modalScroll: {},
  modalBody: { padding: Spacing.md, gap: Spacing.sm },
  input: { borderWidth: 1, borderColor: Colors.grayLight, borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.sm },
  textArea: { minHeight: 120, textAlignVertical: 'top' },
});

export default ItemDetailsScreen;
