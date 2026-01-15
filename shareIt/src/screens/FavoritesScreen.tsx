import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing } from '../constants/colors';
import { ItemCard } from '../components/ItemCard';
import { Item } from '../models/Item';
import { getFavorites } from '../services/favorites';
import { auth } from '../services/firebase';

const FavoritesScreen: React.FC = () => {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(auth.currentUser);

  const fetchFavorites = useCallback(async () => {
    try {
      const favorites = await getFavorites();
      setItems(favorites);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchFavorites();
      setLoading(false);
    };

    if (user) {
      load();
    } else {
      setLoading(false);
    }
  }, [fetchFavorites, user]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      if (u) {
        fetchFavorites();
      } else {
        setItems([]);
      }
    });
    return () => unsubscribe();
  }, [fetchFavorites]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchFavorites();
    setRefreshing(false);
  }, [fetchFavorites]);

  if (!user) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Nisi prijavljen/a</Text>
          <Text style={styles.emptyText}>Za ogled priljubljenih se prijavi</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.header}>Moji priljubljeni</Text>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 20 }} size="large" color={Colors.primary} />
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={({ item }) => (
              <ItemCard
                id={item.id}
                title={item.title}
                pricePerDay={item.pricePerDay}
                city={item.city}
                imageUrl={item.images[0]}
                ratingAvg={item.ratingAvg}
                ratingCount={item.ratingCount}
                onPress={() => router.push(`/item/${item.id}`)}
              />
            )}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>Brez priljubljenih</Text>
                <Text style={styles.emptyText}>Dodaj predmete med priljubljene s klikom na srček</Text>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 24 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  container: { flex: 1, paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  header: { fontSize: 24, fontWeight: '700', marginBottom: Spacing.md, color: Colors.black },
  emptyContainer: { paddingVertical: Spacing.xl, alignItems: 'center', paddingHorizontal: Spacing.xl },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.black, marginBottom: Spacing.sm },
  emptyText: { color: Colors.grayDark, textAlign: 'center' },
});

export default FavoritesScreen;
