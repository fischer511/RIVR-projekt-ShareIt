import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Radius, Spacing } from '@src/constants/colors';
import { items } from '@src/constants/mockData';
import PrimaryButton from '@src/components/PrimaryButton';
import SecondaryButton from '@src/components/SecondaryButton';

const ItemDetailsScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const item = items.find((i) => i.id === id);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!item) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={[styles.container, styles.center]}>
          <Text style={styles.empty}>Item not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <FlatList
          data={item.photos}
          keyExtractor={(u, idx) => `${u}-${idx}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          renderItem={({ item: url, index }) => (
            <Image source={{ uri: url }} style={styles.image} onLoad={() => setActiveIndex(index)} />
          )}
          style={styles.carousel}
        />
        <View style={styles.info}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.meta}>{item.category} • €{item.pricePerDay}/day • {(item.distanceKm ?? 0).toFixed(1)} km • {item.city ?? ''}</Text>
          <Text style={styles.desc}>{item.description}</Text>
          {item.availability && (
            <Text style={styles.avail}>Available: {item.availability.fromDate} → {item.availability.toDate}</Text>
          )}
        </View>

        <View style={styles.actions}>
          <PrimaryButton title="Request booking" onPress={() => router.push(`/request/${id}`)} />
          <SecondaryButton title="Message owner" onPress={() => Alert.alert('Message', 'This would open chat (mock).')} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  container: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  empty: { color: Colors.grayDark },
  carousel: { height: 240 },
  image: { width: 320, height: 240, marginRight: 8, backgroundColor: Colors.grayLight, borderRadius: Radius.md },
  info: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, gap: 6 },
  title: { fontSize: 20, fontWeight: '700', color: Colors.black },
  meta: { fontSize: 12, color: Colors.grayDark },
  desc: { fontSize: 13, color: Colors.black },
  avail: { fontSize: 12, color: Colors.grayDark },
  actions: { paddingHorizontal: Spacing.md, gap: Spacing.sm },
});

export default ItemDetailsScreen;
