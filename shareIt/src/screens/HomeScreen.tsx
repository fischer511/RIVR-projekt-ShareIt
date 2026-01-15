import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius } from '../constants/colors';
import { FilterModal } from '../components/FilterModal';
import { ItemCard } from '../components/ItemCard';
import { Item } from '../models/Item';
import { queryItems } from '../services/items';
import { getUserLocation, calculateDistance, Coordinates } from '../services/location';

const categoryOptions = ['all', 'tools', 'appliances', 'sports', 'gardening', 'diy'];

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [filterVisible, setFilterVisible] = useState(false);
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');
  const [distance, setDistance] = useState<number>(50);

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);

  const fetchAllData = useCallback(async () => {
    try {
      const location = await getUserLocation();
      setUserLocation(location);

      const category = activeCategory === 'all' ? undefined : activeCategory;
      const fetchedItems = await queryItems({ category });
      console.log('[HomeScreen] fetchedItems count=', fetchedItems.length);
      console.log('[HomeScreen] sample item photos=', (fetchedItems[0] as any)?.photos?.slice?.(0,2));
      setItems(fetchedItems);
    } catch (error) {
      console.error("Error initializing screen:", error);
    }
  }, [activeCategory]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchAllData();
      setLoading(false);
    }
    load();
  }, [fetchAllData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  }, [fetchAllData]);

  const itemsWithDistance = useMemo(() => {
    if (!userLocation) return items.map(item => ({ ...item, distanceKm: undefined }));

    return items.map(item => {
      const itemCoords = { latitude: item.location?.lat, longitude: item.location?.lng };
      if (itemCoords.latitude && itemCoords.longitude) {
        const dist = calculateDistance(userLocation, itemCoords as Coordinates);
        return { ...item, distanceKm: dist };
      }
      return { ...item, distanceKm: undefined };
    });
  }, [items, userLocation]);

  const filteredItems = useMemo(() => {
    const q = query.toLowerCase();
    
    return itemsWithDistance.filter((it) => {
      const matchQuery = !q || 
        it.title.toLowerCase().includes(q) || 
        (it.city && it.city.toLowerCase().includes(q));

      const matchPriceMin = !priceMin || it.pricePerDay >= Number(priceMin);
      const matchPriceMax = !priceMax || it.pricePerDay <= Number(priceMax);
      
      const matchDistance = it.distanceKm === undefined || it.distanceKm <= distance;

      return matchQuery && matchPriceMin && matchPriceMax && matchDistance;
    });
  }, [query, itemsWithDistance, priceMin, priceMax, distance]);


  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TextInput
            style={styles.search}
            value={query}
            onChangeText={setQuery}
            placeholder="Search by keyword or city..."
            placeholderTextColor={Colors.gray}
          />
          <Pressable style={styles.filterBtn} onPress={() => setFilterVisible(true)}>
            <Text style={styles.filterText}>Filters</Text>
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 20 }} size="large" color={Colors.primary} />
        ) : (
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={({ item }) => (
              <ItemCard
                title={item.title}
                pricePerDay={item.pricePerDay}
                distanceKm={item.distanceKm}
                city={item.city}
                imageUrl={(item as any).photos && (item as any).photos.length ? (item as any).photos[0] : undefined}
                onPress={() => router.push(`/item/${item.id}`)}
              />
            )}
            ListEmptyComponent={() => (
              <View style={styles.empty}> 
                <Text style={styles.emptyText}>No items match your filters.</Text>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 24 }}
            style={{ marginTop: 16 }}
          />
        )}
      </View>

      <FilterModal
        visible={filterVisible}
        categories={categoryOptions}
        selectedCategory={activeCategory === 'all' ? undefined : activeCategory}
        onSelectCategory={(c) => setActiveCategory(c || 'all')}
        priceMin={priceMin}
        priceMax={priceMax}
        onChangePriceMin={setPriceMin}
        onChangePriceMax={setPriceMax}
        distance={distance}
        onChangeDistance={setDistance}
        onApply={() => setFilterVisible(false)}
        onClose={() => setFilterVisible(false)}
        onReset={() => { 
          setActiveCategory('all'); 
          setPriceMin(''); 
          setPriceMax('');
          setDistance(50);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  container: { flex: 1, paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  search: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.black,
  },
  filterBtn: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.md },
  filterText: { color: Colors.black, fontWeight: '700' },
  empty: { paddingVertical: Spacing.lg, alignItems: 'center' },
  emptyText: { color: Colors.grayDark },
});

export default HomeScreen;
