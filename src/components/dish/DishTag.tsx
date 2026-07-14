import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';

interface DishTagProps {
  label: string;
}

function getTagStyle(label: string) {
  const lower = label.toLowerCase();
  if (lower.includes('vegan') || lower.includes('vegetarisch')) {
    return styles.tagVegan;
  }
  if (lower.includes('bio')) {
    return styles.tagBio;
  }
  if (lower.includes('co2') || lower.includes('co₂')) {
    return styles.tagCo2;
  }
  return styles.tagDefault;
}

export function DishTag({ label }: DishTagProps) {
  return (
    <View style={[styles.tag, getTagStyle(label)]}>
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
  tagVegan: {
    backgroundColor: COLORS.tagVegan,
  },
  tagBio: {
    backgroundColor: COLORS.tagBio,
  },
  tagCo2: {
    backgroundColor: COLORS.tagCo2,
  },
  tagDefault: {
    backgroundColor: COLORS.creme,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.waldgruen,
  },
});
