import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Image, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Radius, Spacing } from '../constants/colors';
import { Item } from '../models/Item';
import { getItemById, getUserProfile } from '../services/items';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import { User } from '../models/User';

const ItemDetailsScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [item, setItem] = useState<Item | null>(null);
  const [owner, setOwner] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchItemAndOwner = async () => {
        setLoading(true);
        try {
          const fetchedItem = await getItemById(id);
          setItem(fetchedItem);

          if (fetchedItem?.ownerUid) {
            const fetchedOwner = await getUserProfile(fetchedItem.ownerUid);
            setOwner(fetchedOwner as User);
          }
        } catch (error) {
          console.error("Error fetching item details:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchItemAndOwner();
    }
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={[styles.container, styles.center]}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

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
        {item.images && item.images.length > 0 ? (
          <FlatList
            data={item.images}
            keyExtractor={(url, idx) => `${url}-${idx}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            renderItem={({ item: url }) => (
              <Image source={{ uri: url }} style={styles.image} />
            )}
            style={styles.carousel}
          />
        ) : (
          <View style={styles.imagePlaceholder} />
        )}
        <View style={styles.info}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.meta}>{item.category} • €{item.pricePerDay}/day • {item.city}</Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status</Text>
            <Text style={styles.status}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Owner</Text>
            <Text style={styles.owner}>{owner ? owner.email : 'Loading...'}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.desc}>{item.description}</Text>
          </View>
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
  carousel: { height: 240, borderBottomWidth: 1, borderBottomColor: Colors.grayLight },
  image: { width: Spacing.screenWidth, height: 240, backgroundColor: Colors.grayLight },
  imagePlaceholder: { height: 240, backgroundColor: Colors.grayLight, borderBottomWidth: 1, borderBottomColor: Colors.grayLight },
  info: { padding: Spacing.md, gap: Spacing.md, flex: 1 },
  title: { fontSize: 22, fontWeight: '700', color: Colors.black },
  meta: { fontSize: 14, color: Colors.grayDark },
  
  section: { gap: 4 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: Colors.grayDark },
  status: { fontSize: 15, fontWeight: 'bold', color: Colors.primary },
  owner: { fontSize: 15, color: Colors.black },
  desc: { fontSize: 15, color: Colors.black, lineHeight: 22 },

  actions: { padding: Spacing.md, gap: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.grayLight },
});

export default ItemDetailsScreen;
