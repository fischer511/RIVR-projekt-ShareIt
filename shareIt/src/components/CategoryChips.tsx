import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export type Category = { key: string; label: string; icon: string };

type Props = {
  categories: Category[];
  activeKey?: string;
  onSelect?: (key: string) => void;
};

export const CategoryChips: React.FC<Props> = ({ categories, activeKey, onSelect }) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {categories.map((c) => {
        const active = c.key === activeKey;
        return (
          <View key={c.key} style={[styles.chip, active && styles.chipActive]}>
            <Text style={[styles.label, active && styles.labelActive]}>{c.label}</Text>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  row: { gap: 10, paddingHorizontal: 2 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f2f2f2', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  chipActive: { backgroundColor: '#ff6b6b' },
  label: { fontSize: 12, color: '#555' },
  labelActive: { color: '#fff', fontWeight: '600' },
});

export default CategoryChips;
