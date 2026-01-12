import React from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle, TextInputProps } from 'react-native';
import { Colors, Radius, Spacing } from '@src/constants/colors';

type Props = {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputProps?: TextInputProps;
};

export const FormField: React.FC<Props> = ({ label, value, onChangeText, placeholder, error, containerStyle, inputProps }) => {
  return (
    <View style={[styles.wrap, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.gray}
        {...inputProps}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { fontSize: 13, color: Colors.grayDark },
  input: {
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.black,
  },
  inputError: { borderColor: Colors.danger },
  error: { fontSize: 12, color: Colors.danger },
});

export default FormField;
