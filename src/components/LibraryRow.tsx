import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

interface Props {
  icon: string;
  label: string;
  onPress: () => void;
  isLast?: boolean;
}

/** Red-icon navigation row used on the Library home screen. */
export function LibraryRow({ icon, label, onPress, isLast }: Props) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.secondaryBackground }]}>
      <Text style={styles.icon}>{icon}</Text>
      <View style={[styles.inner, !isLast && styles.border]}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.chevron}>›</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingLeft: 20, backgroundColor: colors.background },
  icon: { fontSize: 20, color: colors.accent, width: 32 },
  inner: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, paddingRight: 20,
  },
  border: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.separator },
  label: { fontSize: 20, color: colors.label },
  chevron: { fontSize: 22, color: colors.tertiaryLabel, fontWeight: '600' },
});
