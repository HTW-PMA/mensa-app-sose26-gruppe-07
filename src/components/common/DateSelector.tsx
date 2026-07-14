import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { UpcomingDate } from '../../utils/dates';

interface DateSelectorProps {
  dates: UpcomingDate[];
  selectedIso: string;
  onSelect: (date: UpcomingDate) => void;
}

export function DateSelector({ dates, selectedIso, onSelect }: DateSelectorProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.content}
    >
      {dates.map((date) => {
        const active = date.iso === selectedIso;
        return (
          <Pressable
            key={date.iso}
            onPress={() => onSelect(date)}
            style={[styles.dateCard, active && styles.dateCardActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`${date.fullLabel} auswählen`}
          >
            <Text style={[styles.day, active && styles.textActive]}>
              {date.dayLabel}
            </Text>
            <Text style={[styles.date, active && styles.textActive]}>
              {date.dateLabel}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    marginBottom: 16,
  },
  content: {
    gap: 8,
    paddingRight: 8,
  },
  dateCard: {
    minWidth: 76,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: LAYOUT.borderRadius.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  dateCardActive: {
    backgroundColor: COLORS.waldgruen,
    borderColor: COLORS.waldgruen,
  },
  day: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.waldgruen,
  },
  date: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  textActive: {
    color: COLORS.white,
  },
});
