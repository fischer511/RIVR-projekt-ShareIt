import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

export type ListingCardProps = {
  title: string;
  location?: string;
  pricePerDay?: number;
  bedrooms?: number;
  cars?: number;
  baths?: number;
  rating?: number;
  imageUrl: string;
  distanceKm?: number;
  onPress?: () => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
};

export const ListingCard: React.FC<ListingCardProps> = ({
  title,
  location,
  pricePerDay,
  bedrooms,
  cars,
  baths,
  rating,
  imageUrl,
  distanceKm,
  onPress,
  onToggleFavorite,
  isFavorite,
}) => {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        <Pressable style={styles.heart} onPress={onToggleFavorite}>
          <IconSymbol name={isFavorite ? 'heart.fill' : 'heart'} size={20} color={isFavorite ? '#ff4d4f' : '#fff'} />
        </Pressable>
      </View>
      <View style={styles.info}>
        <Text style={styles.title}>{title}</Text>
        {location ? (
          <Text style={styles.location}>
            {location}
            {distanceKm != null ? ` • ${distanceKm.toFixed(1)} km away` : ''}
          </Text>
        ) : null}
        <View style={styles.metaRow}>
          {bedrooms != null && (
            <View style={styles.metaItem}>
              <IconSymbol name="bed.double" size={16} color="#777" />
              <Text style={styles.metaText}>{bedrooms} bed</Text>
            </View>
          )}
          {cars != null && (
            <View style={styles.metaItem}>
              <IconSymbol name="car" size={16} color="#777" />
              <Text style={styles.metaText}>{cars} car</Text>
            </View>
          )}
          {baths != null && (
            <View style={styles.metaItem}>
              <IconSymbol name="figure.wave.circle" size={16} color="#777" />
              <Text style={styles.metaText}>{baths} bath</Text>
            </View>
          )}
        </View>
        <View style={styles.bottomRow}>
          {pricePerDay != null && (
            <Text style={styles.price}>€{pricePerDay}/day</Text>
          )}
          {rating != null && (
            <View style={styles.rating}>
              <IconSymbol name="star.fill" size={14} color="#f59e0b" />
              <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    backgroundColor: '#fff',
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  imageWrap: {
    position: 'relative',
    height: 170,
    backgroundColor: '#eee',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  heart: {
    position: 'absolute',
    right: 10,
    top: 10,
    backgroundColor: 'rgba(0,0,0,0.35)',
    padding: 6,
    borderRadius: 14,
  },
  info: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },
  title: { fontSize: 16, fontWeight: '600' },
  location: { fontSize: 12, color: '#666' },
  metaRow: { flexDirection: 'row', gap: 12 },
  metaItem: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  metaText: { fontSize: 12, color: '#555' },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 14, fontWeight: '700' },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 12, color: '#444' },
});

export default ListingCard;
