import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius } from '@src/constants/colors';
import { FilterModal } from '@src/components/FilterModal';
import { ItemCard } from '@src/components/ItemCard';
import { items } from '@src/constants/mockData';

const categoryOptions = ['all', 'tools', 'appliances', 'sports', 'gardening', 'diy'];

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [filterVisible, setFilterVisible] = useState(false);
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');
  const [distanceStep, setDistanceStep] = useState<number>(5);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter((it) => {
      const matchQuery = !q || it.title.toLowerCase().includes(q) || (it.city?.toLowerCase().includes(q) ?? false);
      const matchCategory = activeCategory === 'all' || it.category === activeCategory;
      const matchPriceMin = !priceMin || it.pricePerDay >= Number(priceMin);
      const matchPriceMax = !priceMax || it.pricePerDay <= Number(priceMax);
      const matchDistance = (it.distanceKm ?? 0) <= distanceStep * 5; // simple scaling for demo
      return matchQuery && matchCategory && matchPriceMin && matchPriceMax && matchDistance;
    });
  }, [query, activeCategory, priceMin, priceMax, distanceStep]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TextInput
            style={styles.search}
            value={query}
            onChangeText={setQuery}
            placeholder="Search items..."
            placeholderTextColor={Colors.gray}
          />
          <Pressable style={styles.filterBtn} onPress={() => setFilterVisible(true)}>
            <Text style={styles.filterText}>Filters</Text>
          </Pressable>
        </View>

        <View style={{ marginTop: 16 }}>
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ItemCard
                title={item.title}
                pricePerDay={item.pricePerDay}
                distanceKm={item.distanceKm ?? 0}
                city={item.city ?? ''}
                imageUrl={item.photos[0] ?? ''}
                onPress={() => router.push(`/item/${item.id}`)}
              />
            )}
            ListEmptyComponent={() => (
              <View style={styles.empty}> 
                <Text style={styles.emptyText}>No items match your filters.</Text>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 24 }}
          />
        </View>
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
        distanceStep={distanceStep}
        onIncreaseDistance={() => setDistanceStep((d) => d + 1)}
        onDecreaseDistance={() => setDistanceStep((d) => Math.max(1, d - 1))}
        onReset={() => { setActiveCategory('all'); setPriceMin(''); setPriceMax(''); setDistanceStep(5); }}
        onApply={() => setFilterVisible(false)}
        onClose={() => setFilterVisible(false)}
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
