import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius, Spacing } from '@src/constants/colors';

type Props = { title: string; onPress?: () => void; style?: ViewStyle; disabled?: boolean };

export const PrimaryButton: React.FC<Props> = ({ title, onPress, style, disabled }) => (
  <Pressable style={[styles.btn, disabled && styles.disabled, style]} onPress={onPress} disabled={disabled}>
    <Text style={styles.text}>{title}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  btn: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  text: { fontSize: 16, fontWeight: '700', color: Colors.black },
  disabled: { opacity: 0.6 },
});

export default PrimaryButton;
