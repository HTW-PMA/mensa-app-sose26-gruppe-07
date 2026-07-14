import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { Meal } from '../../types/api';

interface MealInfoProps {
  meal: Meal;
  compact?: boolean;
}

function formatPrice(price: number): string {
  return `${price.toFixed(2).replace('.', ',')} €`;
}

function formatMetric(value: number | undefined, unit: string): string {
  return value === undefined ? 'Keine Angabe' : `${value.toLocaleString('de-DE')} ${unit}`;
}

export function MealInfo({ meal, compact = false }: MealInfoProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.infoButton, compact && styles.infoButtonCompact]}
        onPress={() => setExpanded((current) => !current)}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`Informationen zu ${meal.name}`}
      >
        <Ionicons name="information-circle-outline" size={17} color={COLORS.waldgruen} />
        <Text style={styles.infoButtonText}>{expanded ? 'Weniger' : 'Infos'}</Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={COLORS.waldgruen}
        />
      </Pressable>

      {expanded ? (
        <View style={styles.detailsPanel}>
          <Text style={styles.detailsTitle}>Gerichtdetails</Text>
          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>KATEGORIE</Text>
              <Text style={styles.detailValue}>{meal.category ?? 'Keine Angabe'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>PREIS</Text>
              <Text style={styles.detailValue}>{formatPrice(meal.price)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>CO₂-BILANZ</Text>
              <Text style={styles.detailValue}>
                {formatMetric(meal.co2Balance, 'g')}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>WASSER</Text>
              <Text style={styles.detailValue}>
                {formatMetric(meal.waterBalance, 'l')}
              </Text>
            </View>
          </View>
          <View style={styles.divider} />
          <Text style={styles.allergenLabel}>ZUSATZSTOFFE & ALLERGENE</Text>
          <Text style={styles.allergenText}>
            {meal.allergens && meal.allergens.length > 0
              ? meal.allergens.join(', ')
              : 'Für dieses Gericht sind keine Angaben hinterlegt.'}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  infoButton: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.creme,
    borderRadius: LAYOUT.borderRadius.sm,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 5,
  },
  infoButtonCompact: {
    minHeight: 30,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  infoButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.waldgruen,
  },
  detailsPanel: {
    width: '100%',
    backgroundColor: COLORS.creme,
    borderRadius: LAYOUT.borderRadius.sm,
    padding: 12,
    marginTop: 8,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.waldgruen,
    marginBottom: 10,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  detailItem: {
    width: '47%',
  },
  detailLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.7,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.waldgruen,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  allergenLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.7,
    marginBottom: 4,
  },
  allergenText: {
    fontSize: 11,
    color: COLORS.waldgruen,
    lineHeight: 16,
  },
});
