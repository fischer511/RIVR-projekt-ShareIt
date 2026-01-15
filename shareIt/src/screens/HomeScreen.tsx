import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TextInput, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius } from '../constants/colors';
import { FilterModal } from '../components/FilterModal';
import { ItemCard } from '../components/ItemCard';
import { Item } from '../models/Item';
import { queryItemsPage } from '../services/items';
import { getUserLocation, calculateDistance, Coordinates } from '../services/location';

const categoryOptions = [
  { key: 'all', label: 'Vse' },
  { key: 'Orodje', label: 'Orodje' },
  { key: 'Elektronika', label: 'Elektronika' },
  { key: 'Kuhinja', label: 'Kuhinja' },
  { key: 'Šport', label: 'Šport' },
  { key: 'Vrt', label: 'Vrt' },
];
const PAGE_SIZE = 10;

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
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const userLocationRef = useRef<Coordinates | null>(null);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const lastDocRef = useRef<any>(null);

  const fetchPage = useCallback(async (reset = false) => {
    try {
      if (!userLocationRef.current) {
        const location = await getUserLocation();
        setUserLocation(location);
        userLocationRef.current = location;
      }

      const category = activeCategory === 'all' ? undefined : activeCategory;
      const cursor = reset ? null : lastDocRef.current;
      const page = await queryItemsPage({ category }, PAGE_SIZE, cursor);
      setItems((prev) => (reset ? page.items : [...prev, ...page.items]));
      setLastDoc(page.lastDoc);
      lastDocRef.current = page.lastDoc;
      setHasMore(page.hasMore);
    } catch (error) {
      console.error("Error initializing screen:", error);
      setHasMore(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setLastDoc(null);
      lastDocRef.current = null;
      setHasMore(true);
      await fetchPage(true);
      setLoading(false);
    }
    load();
  }, [fetchPage]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setLastDoc(null);
    lastDocRef.current = null;
    setHasMore(true);
    await fetchPage(true);
    setRefreshing(false);
  }, [fetchPage]);

  const onEndReached = useCallback(async () => {
    if (loadingMore || loading || refreshing || !hasMore) return;
    setLoadingMore(true);
    await fetchPage(false);
    setLoadingMore(false);
  }, [fetchPage, loadingMore, loading, refreshing, hasMore]);

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
            placeholder="Išči po ključni besedi ali mestu..."
            placeholderTextColor={Colors.gray}
          />
          <Pressable style={styles.filterBtn} onPress={() => setFilterVisible(true)}>
            <Text style={styles.filterText}>Filtri</Text>
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
            onEndReached={onEndReached}
            onEndReachedThreshold={0.4}
            renderItem={({ item }) => (
              <ItemCard
                id={item.id}
                title={item.title}
                pricePerDay={item.pricePerDay}
                distanceKm={item.distanceKm}
                city={item.city}
                imageUrl={item.images[0]}
                ratingAvg={item.ratingAvg}
                ratingCount={item.ratingCount}
                onPress={() => router.push(`/item/${item.id}`)}
              />
            )}
            ListEmptyComponent={() => (
              <View style={styles.empty}> 
                <Text style={styles.emptyText}>Ni zadetkov za izbrane filtre.</Text>
              </View>
            )}
            ListFooterComponent={() => (
              loadingMore ? (
                <ActivityIndicator style={{ marginVertical: 16 }} size="small" color={Colors.primary} />
              ) : null
            )}
            contentContainerStyle={{ paddingBottom: 24 }}
            style={{ marginTop: 16 }}
          />
        )}
      </View>

      <FilterModal
        visible={filterVisible}
        categories={categoryOptions}
        selectedCategory={activeCategory}
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
