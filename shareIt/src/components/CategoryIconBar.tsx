import React from 'react';
import { View, StyleSheet } from 'react-native';

type IconItem = { key: string; name: string };

type Props = {
  items: IconItem[];
};

export const CategoryIconBar: React.FC<Props> = ({ items }) => {
  return (
    <View style={styles.row}>
      {items.map((it) => (
        <View key={it.key} style={styles.circle} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CategoryIconBar;
