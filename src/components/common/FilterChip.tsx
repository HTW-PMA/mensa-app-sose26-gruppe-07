import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';

interface FilterChipProps {
  label: string;
  active?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
}

export function FilterChip({
  label,
  active,
  icon,
  onPress,
  variant = 'secondary',
}: FilterChipProps) {
  const activeStyle =
    variant === 'primary' ? styles.chipActivePrimary : styles.chipActiveSecondary;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && activeStyle]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={14}
          color={active ? COLORS.white : COLORS.waldgruen}
          style={styles.icon}
        />
      ) : null}
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: LAYOUT.borderRadius.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    marginRight: 8,
    marginBottom: 8,
  },
  chipActivePrimary: {
    backgroundColor: COLORS.waldgruen,
    borderColor: COLORS.waldgruen,
  },
  chipActiveSecondary: {
    backgroundColor: COLORS.salbeigruen,
    borderColor: COLORS.salbeigruen,
  },
  icon: {
    marginRight: 4,
  },
  label: {
    fontSize: 13,
    color: COLORS.waldgruen,
    fontWeight: '500',
  },
  labelActive: {
    color: COLORS.white,
  },
});
