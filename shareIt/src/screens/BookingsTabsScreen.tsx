import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Pressable, Alert } from 'react-native';
import { Colors, Spacing, Radius } from '@src/constants/colors';
import StatusChip from '@src/components/StatusChip';
import SegmentedTabs from '@src/components/SegmentedTabs';
import { auth } from '@src/services/firebase';
import { Booking, autoCancelExpiredBookings, getOwnerBookingRequests, getUserBookings, updateBookingStatus } from '@src/services/bookings';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';

const BookingsTabsScreen: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'renter' | 'owner'>('renter');
  const [renterBookings, setRenterBookings] = useState<Booking[]>([]);
  const [ownerBookings, setOwnerBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      await autoCancelExpiredBookings({ renterUid: currentUser.uid, ownerUid: currentUser.uid });
      const [renterData, ownerData] = await Promise.all([
        getUserBookings(currentUser.uid),
        getOwnerBookingRequests(currentUser.uid),
      ]);
      setRenterBookings(renterData);
      setOwnerBookings(ownerData);
    } catch (e: any) {
      console.error(e?.message ?? e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const filtered = useMemo(
    () => (activeTab === 'renter' ? renterBookings : ownerBookings),
    [activeTab, renterBookings, ownerBookings]
  );

  const getStatusText = (status: Booking['status']) => {
    switch (status) {
      case 'pending': return 'V obdelavi';
      case 'confirmed': return 'Potrjeno';
      case 'rejected': return 'Zavrnjeno';
      case 'completed': return 'Zaključeno';
      case 'cancelled': return 'Preklicano';
      default: return status;
    }
  };

  const updateStatus = async (id: string, status: Booking['status']) => {
    try {
      await updateBookingStatus(id, status, auth.currentUser?.uid);
      fetchData();
    } catch (e: any) {
      console.error(e?.message ?? e);
      Alert.alert('Failed to update booking');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <SegmentedTabs
          tabs={[{ key: 'renter', label: 'Moje prošnje' }, { key: 'owner', label: 'Prošnje za moje predmete' }]}
          activeKey={activeTab}
          onChange={(k) => setActiveTab(k as any)}
        />

        {loading ? (
          <Text style={styles.empty}>Nalagam...</Text>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(b) => b.id as string}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.rowBetween}>
                  <Text style={styles.title}>{item.itemTitle}</Text>
                  <StatusChip status={item.status} label={getStatusText(item.status)} />
                </View>
                <Text style={styles.meta}>
                  {new Date(item.dates[0]).toLocaleDateString()} - {new Date(item.dates[item.dates.length - 1]).toLocaleDateString()}
                </Text>
                <View style={styles.actions}>
                <Pressable style={[styles.btn, styles.chat]} onPress={() => router.push(`/chat/${item.id}`)}>
                    <Text style={styles.btnText}>Odpri klepet</Text>
                  </Pressable>
                  {activeTab === 'renter' ? (
                    <>
                      {item.status === 'pending' && (
                        <Pressable style={[styles.btn, styles.cancel]} onPress={() => updateStatus(item.id as string, 'cancelled')}>
                          <Text style={styles.btnText}>Prekliči prošnjo</Text>
                        </Pressable>
                      )}
                      {item.status === 'confirmed' && (
                        <Pressable style={[styles.btn, styles.return]} onPress={() => updateStatus(item.id as string, 'completed')}>
                          <Text style={styles.btnText}>Označi kot vrnjeno</Text>
                        </Pressable>
                      )}
                    </>
                  ) : (
                    <>
                      {item.status === 'pending' && (
                        <>
                          <Pressable style={[styles.btn, styles.accept]} onPress={() => updateStatus(item.id as string, 'confirmed')}>
                            <Text style={styles.btnText}>Potrdi</Text>
                          </Pressable>
                          <Pressable style={[styles.btn, styles.reject]} onPress={() => updateStatus(item.id as string, 'rejected')}>
                            <Text style={styles.btnText}>Zavrni</Text>
                          </Pressable>
                        </>
                      )}
                      {item.status === 'confirmed' && (
                        <Pressable style={[styles.btn, styles.return]} onPress={() => updateStatus(item.id as string, 'completed')}>
                          <Text style={styles.btnText}>Označi kot vrnjeno</Text>
                        </Pressable>
                      )}
                    </>
                  )}
                </View>
              </View>
            )}
            ListEmptyComponent={() => <Text style={styles.empty}>Ni izposoj.</Text>}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  container: { flex: 1, paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  card: { backgroundColor: Colors.white, borderRadius: Radius.md, padding: Spacing.md, marginTop: Spacing.sm, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '700', color: Colors.black },
  meta: { fontSize: 12, color: Colors.grayDark, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 8, marginTop: Spacing.sm, flexWrap: 'wrap' },
  btn: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: Radius.md },
  btnText: { color: Colors.black, fontWeight: '700' },
  cancel: { backgroundColor: Colors.grayLight },
  accept: { backgroundColor: Colors.teal },
  reject: { backgroundColor: Colors.danger },
  return: { backgroundColor: Colors.primaryLight },
  chat: { backgroundColor: Colors.grayLight },
  empty: { color: Colors.grayDark, marginTop: Spacing.md },
});

export default BookingsTabsScreen;
