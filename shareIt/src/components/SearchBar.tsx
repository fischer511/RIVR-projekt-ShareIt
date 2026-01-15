import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

type Props = {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
};

export const SearchBar: React.FC<Props> = ({ value, onChangeText, placeholder = 'Išči...' }) => {
  return (
    <View style={styles.container}>
      <IconSymbol name="magnifyingglass" size={18} color="#888" />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
      />
      <IconSymbol name="slider.horizontal.3" size={18} color="#888" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  input: { flex: 1, fontSize: 14 },
});

export default SearchBar;
