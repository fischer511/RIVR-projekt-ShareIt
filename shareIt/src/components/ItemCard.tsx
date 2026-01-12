import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { Colors, Radius, Spacing } from '@src/constants/colors';

type Props = {
  title: string;
  pricePerDay: number;
  distanceKm: number;
  city: string;
  imageUrl: string;
  onPress?: () => void;
};

export const ItemCard: React.FC<Props> = ({ title, pricePerDay, distanceKm, city, imageUrl, onPress }) => {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
      </View>
      <View style={styles.info}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.row}>
          <Text style={styles.price}>€{pricePerDay}/day</Text>
          <Text style={styles.meta}>{distanceKm.toFixed(1)} km • {city}</Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    backgroundColor: Colors.white,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  imageWrap: { height: 170, backgroundColor: Colors.grayLight },
  image: { width: '100%', height: '100%' },
  info: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, gap: 6 },
  title: { fontSize: 16, fontWeight: '700', color: Colors.black },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 14, fontWeight: '700', color: Colors.black },
  meta: { fontSize: 12, color: Colors.grayDark },
});

export default ItemCard;
