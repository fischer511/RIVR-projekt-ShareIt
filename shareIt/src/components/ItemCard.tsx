import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { Colors, Radius, Spacing } from '@src/constants/colors';
import FavoriteButton from './FavoriteButton';

type Props = {
  id: string;
  title: string;
  pricePerDay: number;
  distanceKm?: number;
  city: string;
  imageUrl: string;
  ratingAvg?: number;
  ratingCount?: number;
  onPress?: () => void;
};

export const ItemCard: React.FC<Props> = ({ id, title, pricePerDay, distanceKm, city, imageUrl, ratingAvg, ratingCount, onPress }) => {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
        <FavoriteButton itemId={id} style={styles.favoriteBtn} />
      </View>
      <View style={styles.info}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.row}>
          <Text style={styles.price}>{pricePerDay} EUR/dan</Text>
          <Text style={styles.meta}>
            {distanceKm !== undefined ? `${distanceKm.toFixed(1)} km - ` : ''}{city}
          </Text>
        </View>
        {ratingAvg ? (
          <Text style={styles.rating}>Ocena: {ratingAvg.toFixed(1)}{ratingCount ? ` (${ratingCount})` : ''}</Text>
        ) : null}
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
  imageWrap: { height: 170, backgroundColor: Colors.grayLight, position: 'relative' },
  image: { width: '100%', height: '100%' },
  favoriteBtn: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 20 },
  info: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, gap: 6 },
  title: { fontSize: 16, fontWeight: '700', color: Colors.black },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 14, fontWeight: '700', color: Colors.black },
  meta: { fontSize: 12, color: Colors.grayDark },
  rating: { fontSize: 12, color: Colors.grayDark },
});

export default ItemCard;
