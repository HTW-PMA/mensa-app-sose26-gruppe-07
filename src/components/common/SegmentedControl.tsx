import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';

interface SegmentedControlProps {
  options: { label: string; icon: keyof typeof Ionicons.glyphMap }[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function SegmentedControl({
  options,
  selectedIndex,
  onSelect,
}: SegmentedControlProps) {
  return (
    <View style={styles.container}>
      {options.map((option, index) => {
        const active = index === selectedIndex;
        return (
          <Pressable
            key={option.label}
            onPress={() => onSelect(index)}
            style={[styles.option, active && styles.optionActive]}
          >
            <Ionicons
              name={option.icon}
              size={16}
              color={active ? COLORS.white : COLORS.waldgruen}
            />
            <Text style={[styles.label, active && styles.labelActive]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.creme,
    borderRadius: LAYOUT.borderRadius.md,
    padding: 4,
    marginBottom: 16,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: LAYOUT.borderRadius.sm,
    gap: 6,
  },
  optionActive: {
    backgroundColor: COLORS.waldgruen,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.waldgruen,
  },
  labelActive: {
    color: COLORS.white,
  },
});
