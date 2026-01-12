import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Pressable, Alert } from 'react-native';
import { Colors, Spacing, Radius } from '@src/constants/colors';
import { bookings } from '@src/constants/mockData';
import { Booking } from '@src/models';
import StatusChip from '@src/components/StatusChip';
import SegmentedTabs from '@src/components/SegmentedTabs';

const BookingsTabsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'renter' | 'owner'>('renter');
  const [state, setState] = useState<Booking[]>(bookings);

  const filtered = useMemo(() => state.filter((b) => (activeTab === 'renter' ? b.role === 'renter' : b.role === 'owner')), [state, activeTab]);

  const updateStatus = (id: string, status: Booking['status']) => {
    setState((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    Alert.alert('Status updated (mock)');
  };

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
