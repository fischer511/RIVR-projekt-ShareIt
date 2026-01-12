import React from 'react';
import { View, Text, Modal, Pressable, StyleSheet, FlatList } from 'react-native';
import { Colors, Radius, Spacing } from '@src/constants/colors';

type Props = {
  visible: boolean;
  categories: string[];
  selectedCategory?: string;
  onSelectCategory: (c?: string) => void;
  priceMin?: string;
  priceMax?: string;
  onChangePriceMin: (v: string) => void;
  onChangePriceMax: (v: string) => void;
  distanceStep: number; // e.g., 1, 5, 10
  onIncreaseDistance: () => void;
  onDecreaseDistance: () => void;
  onReset: () => void;
  onApply: () => void;
  onClose: () => void;
};

export const FilterModal: React.FC<Props> = ({ visible, categories, selectedCategory, onSelectCategory, priceMin, priceMax, onChangePriceMin, onChangePriceMax, distanceStep, onIncreaseDistance, onDecreaseDistance, onReset, onApply, onClose }) => {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Filters</Text>

          <Text style={styles.section}>Category</Text>
          <FlatList
            data={categories}
            keyExtractor={(c) => c}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
            renderItem={({ item }) => {
              const active = item === selectedCategory;
              return (
                <Pressable onPress={() => onSelectCategory(active ? undefined : item)} style={[styles.chip, active && styles.chipActive]}>
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
                </Pressable>
              );
            }}
          />

          <Text style={styles.section}>Price range (€)</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable style={styles.inputLike}>
              <Text style={styles.inputText} onPress={() => {}}>{priceMin || 'Min'}</Text>
            </Pressable>
            <Pressable style={styles.inputLike}>
              <Text style={styles.inputText} onPress={() => {}}>{priceMax || 'Max'}</Text>
            </Pressable>
          </View>

          <Text style={styles.section}>Distance</Text>
          <View style={styles.rowCenter}>
            <Pressable style={[styles.pill, styles.muted]} onPress={onDecreaseDistance}><Text style={styles.pillText}>-</Text></Pressable>
            <Text style={styles.distText}>{distanceStep} km</Text>
            <Pressable style={styles.pill} onPress={onIncreaseDistance}><Text style={styles.pillText}>+</Text></Pressable>
          </View>

          <View style={styles.actions}>
            <Pressable style={[styles.btn, styles.reset]} onPress={onReset}><Text style={styles.btnText}>Reset</Text></Pressable>
            <Pressable style={[styles.btn, styles.apply]} onPress={onApply}><Text style={[styles.btnText, styles.applyText]}>Apply</Text></Pressable>
          </View>

          <Pressable style={styles.close} onPress={onClose}><Text style={styles.closeText}>Close</Text></Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors.white, borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg, padding: Spacing.lg, gap: Spacing.md },
  title: { fontSize: 18, fontWeight: '700', color: Colors.black },
  section: { fontSize: 14, fontWeight: '600', color: Colors.grayDark },
  chip: { backgroundColor: Colors.grayLight, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.md },
  chipActive: { backgroundColor: Colors.primaryLight },
  chipText: { color: Colors.grayDark },
  chipTextActive: { color: Colors.black, fontWeight: '700' },
  inputLike: { flex: 1, borderWidth: 1, borderColor: Colors.gray, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  inputText: { color: Colors.black },
  rowCenter: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  distText: { fontSize: 14, color: Colors.black },
  pill: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.md },
  pillText: { fontSize: 16, fontWeight: '700', color: Colors.black },
  muted: { backgroundColor: Colors.grayLight },
  actions: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  btn: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md, borderRadius: Radius.md },
  reset: { backgroundColor: Colors.grayLight },
  apply: { backgroundColor: Colors.primary },
  btnText: { fontSize: 14, color: Colors.black, fontWeight: '700' },
  applyText: { color: Colors.black },
  close: { alignSelf: 'center', marginTop: Spacing.md },
  closeText: { color: Colors.grayDark },
});

export default FilterModal;
