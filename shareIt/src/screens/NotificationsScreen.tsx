import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, RefreshControl } from 'react-native';
import { Colors, Spacing, Radius } from '@src/constants/colors';
import { auth } from '@src/services/firebase';
import { getUserNotifications, NotificationItem } from '@src/services/notifications';

const NotificationsScreen: React.FC = () => {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) {
      setItems([]);
      return;
    }
    const data = await getUserNotifications(user.uid);
    setItems(data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Obvestila</Text>
        <FlatList
          data={items}
          keyExtractor={(i) => i.id as string}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardBody}>{item.body}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>Ni obvestil.</Text>}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  container: { flex: 1, paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  title: { fontSize: 20, fontWeight: '700', color: Colors.black, marginBottom: Spacing.md },
  card: { backgroundColor: Colors.white, padding: Spacing.md, borderRadius: Radius.md, marginBottom: Spacing.sm, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: Colors.black },
  cardBody: { fontSize: 13, color: Colors.grayDark, marginTop: 4 },
  empty: { color: Colors.grayDark },
});

export default NotificationsScreen;
