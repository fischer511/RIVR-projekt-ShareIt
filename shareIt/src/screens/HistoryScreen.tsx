import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Pressable, Alert } from 'react-native';
import { Colors, Spacing, Radius } from '@src/constants/colors';
import { bookings } from '@src/constants/mockData';
import { Booking } from '@src/models';
import StatusChip from '@src/components/StatusChip';
import SegmentedTabs from '@src/components/SegmentedTabs';

const HistoryScreen: React.FC = () => {
  const [activeStatus, setActiveStatus] = useState<'All' | 'Active' | 'Accepted' | 'Completed'>('All');
  const [role, setRole] = useState<'renter' | 'owner'>('renter');
  const [state, setState] = useState<Booking[]>(bookings);

  const filtered = useMemo(() => state.filter((b) => b.role === role).filter((b) => {
    if (activeStatus === 'All') return true;
    if (activeStatus === 'Active') return b.status === 'Pending' || b.status === 'Accepted';
    if (activeStatus === 'Accepted') return b.status === 'Accepted';
    return (b.status as any) === 'Completed';
  }), [state, role, activeStatus]);

  const updateStatus = (id: string, status: Booking['status']) => {
    setState((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    Alert.alert('Status posodobljen (demo)');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Zgodovina</Text>
        <SegmentedTabs tabs={[{ key: 'renter', label: 'Najemnik' }, { key: 'owner', label: 'Lastnik' }]} activeKey={role} onChange={(k) => setRole(k as any)} />
        <View style={{ height: Spacing.sm }} />
        <SegmentedTabs tabs={[{ key: 'All', label: 'Vse' }, { key: 'Active', label: 'Aktivno' }, { key: 'Accepted', label: 'Potrjeno' }, { key: 'Completed', label: 'Zaključeno' }]} activeKey={activeStatus} onChange={(k) => setActiveStatus(k as any)} />

        <FlatList
          data={filtered}
          keyExtractor={(b) => b.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.itemTitle}>{item.itemTitle}</Text>
                <StatusChip status={item.status} />
              </View>
              <Text style={styles.meta}>{item.fromDate} - {item.toDate}</Text>
              <View style={styles.actions}>
                {role === 'renter' ? (
                  <>
                    {(item.status === 'Pending' || item.status === 'Accepted') && (
                      <Pressable style={[styles.btn, styles.cancel]} onPress={() => updateStatus(item.id, 'Cancelled')}><Text style={styles.btnText}>Prekliči</Text></Pressable>
                    )}
                    {item.status === 'Accepted' && (
                      <Pressable style={[styles.btn, styles.return]} onPress={() => updateStatus(item.id, 'Returned')}><Text style={styles.btnText}>Označi kot vrnjeno</Text></Pressable>
                    )}
                  </>
                ) : (
                  <>
                    {item.status === 'Accepted' && (
                      <Pressable style={[styles.btn, styles.return]} onPress={() => updateStatus(item.id, 'Returned')}><Text style={styles.btnText}>Označi kot vrnjeno</Text></Pressable>
                    )}
                  </>
                )}
              </View>
            </View>
          )}
          ListEmptyComponent={() => <Text style={styles.empty}>Ni zgodovine.</Text>}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  container: { flex: 1, paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  title: { fontSize: 18, fontWeight: '700', color: Colors.black, marginBottom: Spacing.sm },
  card: { backgroundColor: Colors.white, borderRadius: Radius.md, padding: Spacing.md, marginTop: Spacing.sm, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemTitle: { fontSize: 16, fontWeight: '700', color: Colors.black },
  meta: { fontSize: 12, color: Colors.grayDark },
  actions: { flexDirection: 'row', gap: 8, marginTop: Spacing.sm },
  btn: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: Radius.md },
  btnText: { color: Colors.black, fontWeight: '700' },
  cancel: { backgroundColor: Colors.grayLight },
  return: { backgroundColor: Colors.primaryLight },
  empty: { color: Colors.grayDark, marginTop: Spacing.md },
});

export default HistoryScreen;
