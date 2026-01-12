import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing } from '@src/constants/colors';

type Tab = { key: string; label: string };
type Props = { tabs: Tab[]; activeKey: string; onChange: (key: string) => void };

export const SegmentedTabs: React.FC<Props> = ({ tabs, activeKey, onChange }) => {
  return (
    <View style={styles.wrap}>
      {tabs.map((t) => {
        const active = t.key === activeKey;
        return (
          <Pressable key={t.key} style={[styles.tab, active && styles.active]} onPress={() => onChange(t.key)}>
            <Text style={[styles.label, active && styles.activeLabel]}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: Colors.grayLight,
    borderRadius: Radius.lg,
    padding: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  active: { backgroundColor: Colors.white },
  label: { fontSize: 13, color: Colors.grayDark },
  activeLabel: { color: Colors.black, fontWeight: '700' },
});

export default SegmentedTabs;
