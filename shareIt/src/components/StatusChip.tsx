import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing } from '@src/constants/colors';
type Props = { status: string; label?: string };

export const StatusChip: React.FC<Props> = ({ status, label }) => {
  const { bg, fg } = getColors(status);
  return (
    <View style={[styles.chip, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: fg }]}>{label ?? status}</Text>
    </View>
  );
};

function getColors(status: string) {
  switch (status) {
    case 'pending':
    case 'Pending':
      return { bg: Colors.grayLight, fg: Colors.black };
    case 'confirmed':
    case 'Confirmed':
    case 'Accepted':
      return { bg: Colors.teal, fg: Colors.black };
    case 'rejected':
    case 'Rejected':
      return { bg: Colors.danger, fg: Colors.white };
    case 'completed':
    case 'Completed':
    case 'Returned':
      return { bg: Colors.primaryLight, fg: Colors.black };
    case 'cancelled':
    case 'Cancelled':
      return { bg: Colors.gray, fg: Colors.white };
    default:
      return { bg: Colors.grayLight, fg: Colors.black };
  }
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 12, fontWeight: '700' },
});

export default StatusChip;
