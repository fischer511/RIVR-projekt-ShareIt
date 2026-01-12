import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius, Spacing } from '@src/constants/colors';

type Props = { title: string; onPress?: () => void; style?: ViewStyle };

export const SecondaryButton: React.FC<Props> = ({ title, onPress, style }) => (
  <Pressable style={[styles.btn, style]} onPress={onPress}>
    <Text style={styles.text}>{title}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  btn: {
    backgroundColor: Colors.teal,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  text: { fontSize: 16, fontWeight: '700', color: Colors.black },
});

export default SecondaryButton;
