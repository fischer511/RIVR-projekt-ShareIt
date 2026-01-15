import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { addToFavorites, removeFromFavorites, isFavorite } from '../services/favorites';
import { Colors } from '../constants/colors';

type Props = {
  itemId: string;
  size?: number;
  style?: any;
};

export const FavoriteButton: React.FC<Props> = ({ itemId, size = 28, style }) => {
  const [favorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkFavorite = async () => {
      const isFav = await isFavorite(itemId);
      setFavorite(isFav);
    };
    checkFavorite();
  }, [itemId]);

  const toggleFavorite = async () => {
    if (loading) return;
    
    setLoading(true);
    if (favorite) {
      const success = await removeFromFavorites(itemId);
      if (success) setFavorite(false);
    } else {
      const success = await addToFavorites(itemId);
      if (success) setFavorite(true);
    }
    setLoading(false);
  };

  return (
    <Pressable 
      onPress={toggleFavorite} 
      style={[styles.button, style]}
      disabled={loading}
    >
      <Ionicons 
        name={favorite ? 'heart' : 'heart-outline'} 
        size={size} 
        color={favorite ? Colors.danger : Colors.grayDark} 
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
});

export default FavoriteButton;
