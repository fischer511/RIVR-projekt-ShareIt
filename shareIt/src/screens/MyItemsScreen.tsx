import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Alert } from 'react-native';
import { Colors, Spacing, Radius } from '@src/constants/colors';
import { auth } from '@src/services/firebase';
import { getItemsByOwner, deleteItem } from '@src/services/items';
import { Item } from '@src/models/Item';
import SecondaryButton from '@src/components/SecondaryButton';
import PrimaryButton from '@src/components/PrimaryButton';
import { useRouter } from 'expo-router';

const MyItemsScreen: React.FC = () => {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);

  const load = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;
    const data = await getItemsByOwner(user.uid);
    setItems(data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Moji predmeti</Text>
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.meta}>{item.pricePerDay} EUR/dan - {item.city}</Text>
              <View style={styles.actions}>
                <PrimaryButton title="Uredi" onPress={() => router.push(`/item/edit/${item.id}`)} />
                <SecondaryButton
                  title="Izbriši"
                  onPress={() => {
                    Alert.alert('Izbriši oglas', 'Si prepričan/a?', [
                      { text: 'Prekliči', style: 'cancel' },
                      {
                        text: 'Izbriši',
                        style: 'destructive',
                        onPress: async () => {
                          await deleteItem(item.id);
                          load();
                        },
                      },
                    ]);
                  }}
                />
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>Nimaš objavljenih predmetov.</Text>}
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
  itemTitle: { fontSize: 16, fontWeight: '700', color: Colors.black },
  meta: { fontSize: 12, color: Colors.grayDark, marginTop: 4 },
  actions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  empty: { color: Colors.grayDark },
});

export default MyItemsScreen;
