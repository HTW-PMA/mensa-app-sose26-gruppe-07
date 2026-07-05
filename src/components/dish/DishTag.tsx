import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';

interface DishTagProps {
  label: string;
}

function getTagColor(label: string): string {
  const lower = label.toLowerCase();
  if (lower.includes('vegan') || lower.includes('vegetarisch')) {
    return COLORS.tagVegan;
  }
  if (lower.includes('bio')) {
    return COLORS.tagBio;
  }
  if (lower.includes('co2')) {
    return COLORS.tagCo2;
  }
  return COLORS.creme;
}

export function DishTag({ label }: DishTagProps) {
  return (
    <View style={[styles.tag, { backgroundColor: getTagColor(label) }]}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: LAYOUT.borderRadius.sm,
    marginRight: 6,
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.waldgruen,
  },
});
