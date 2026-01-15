import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius } from '@src/constants/colors';
import { Booking } from '@src/models';
import StatusChip from '@src/components/StatusChip';
import SegmentedTabs from '@src/components/SegmentedTabs';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@src/services/firebase';

const BookingsTabsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'renter' | 'owner'>('renter');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    // Pridobi rezervacije kjer je uporabnik renter
    const qRenter = query(
      collection(db, 'bookings'),
      where('userUid', '==', user.uid)
    );

    const unsubRenter = onSnapshot(qRenter, (snap) => {
      const renterBookings = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        role: 'renter' as const,
      })) as Booking[];
      
      // Pridobi še rezervacije kjer je uporabnik owner
      const qOwner = query(
        collection(db, 'bookings'),
        where('ownerUid', '==', user.uid)
      );
      
      onSnapshot(qOwner, (snapOwner) => {
        const ownerBookings = snapOwner.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          role: 'owner' as const,
        })) as Booking[];
        
        setBookings([...renterBookings, ...ownerBookings]);
        setLoading(false);
      });
    });

    return () => unsubRenter();
  }, []);

  const filtered = useMemo(() => bookings.filter((b) => (activeTab === 'renter' ? b.role === 'renter' : b.role === 'owner')), [bookings, activeTab]);

  const updateStatus = async (id: string, status: Booking['status']) => {
    try {
      await updateDoc(doc(db, 'bookings', id), { status });
      Alert.alert('Uspeh', 'Status posodobljen');
    } catch (error: any) {
      console.error('Error updating status:', error);
      Alert.alert('Napaka', 'Ni bilo mogoče posodobiti statusa');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <SegmentedTabs tabs={[{ key: 'renter', label: 'My requests' }, { key: 'owner', label: 'Requests for my items' }]} activeKey={activeTab} onChange={(k) => setActiveTab(k as any)} />

        <FlatList
          data={filtered}
          keyExtractor={(b) => b.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.title}>{item.itemTitle}</Text>
                <StatusChip status={item.status} />
              </View>
              <Text style={styles.meta}>{item.fromDate} → {item.toDate}</Text>
              <View style={styles.actions}>
                {activeTab === 'renter' ? (
                  item.status === 'Pending' || item.status === 'Accepted' ? (
                    <Pressable style={[styles.btn, styles.cancel]} onPress={() => updateStatus(item.id, 'Cancelled')}>
                      <Text style={styles.btnText}>Cancel request</Text>
                    </Pressable>
                  ) : null
                ) : (
                  <>
                    {item.status === 'Pending' && (
                      <>
                        <Pressable style={[styles.btn, styles.accept]} onPress={() => updateStatus(item.id, 'Accepted')}><Text style={styles.btnText}>Accept</Text></Pressable>
                        <Pressable style={[styles.btn, styles.reject]} onPress={() => updateStatus(item.id, 'Rejected')}><Text style={styles.btnText}>Reject</Text></Pressable>
                      </>
                    )}
                    {item.status === 'Accepted' && (
                      <Pressable style={[styles.btn, styles.return]} onPress={() => updateStatus(item.id, 'Returned')}><Text style={styles.btnText}>Mark returned</Text></Pressable>
                    )}
                  </>
                )}
              </View>
            </View>
          )}
          ListEmptyComponent={() => <Text style={styles.empty}>No bookings.</Text>}
        />
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
  meta: { fontSize: 12, color: Colors.grayDark },
  actions: { flexDirection: 'row', gap: 8, marginTop: Spacing.sm },
  btn: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: Radius.md },
  btnText: { color: Colors.black, fontWeight: '700' },
  cancel: { backgroundColor: Colors.grayLight },
  accept: { backgroundColor: Colors.teal },
  reject: { backgroundColor: Colors.danger },
  return: { backgroundColor: Colors.primaryLight },
  empty: { color: Colors.grayDark, marginTop: Spacing.md },
});

export default BookingsTabsScreen;
