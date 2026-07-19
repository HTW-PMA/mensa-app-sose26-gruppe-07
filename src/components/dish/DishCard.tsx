import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { Meal } from '../../types/api';
import { DishTag } from './DishTag';
import { MealInfo } from './MealInfo';

interface DishCardProps {
  meal: Meal;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  compact?: boolean;
}

function formatPrice(price: number): string {
  return `${price.toFixed(2).replace('.', ',')} €`;
}

export function DishCard({
  meal,
  isFavorite,
  onToggleFavorite,
  compact = false,
}: DishCardProps) {
  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <View style={styles.mainRow}>
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.name} numberOfLines={compact ? 2 : 1}>
              {meal.name}
            </Text>
            <Text style={styles.price}>{formatPrice(meal.price)}</Text>
          </View>

          {meal.canteenName ? (
            <Text style={styles.meta}>
              {meal.canteenName}
              {meal.menueName ? ` • ${meal.menueName}` : ''}
            </Text>
          ) : null}

          {meal.description ? (
            <Text style={styles.description} numberOfLines={2}>
              {meal.description}
            </Text>
          ) : null}

          {meal.badges && meal.badges.length > 0 ? (
            <View style={styles.tags}>
              {meal.badges.map((badge) => (
                <DishTag key={badge} label={badge} />
              ))}
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.mealInfoContainer}>
          <MealInfo meal={meal} compact={compact} />
        </View>
        {onToggleFavorite ? (
          <Pressable
            onPress={onToggleFavorite}
            style={styles.heartButton}
            accessibilityRole="button"
            accessibilityLabel={
              isFavorite ? 'Gericht aus Favoriten entfernen' : 'Gericht favorisieren'
            }
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={COLORS.waldgruen}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.borderRadius.md,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.salbeigruen,
  },
  cardCompact: {
    padding: 10,
  },
  mainRow: {
    flexDirection: 'row',
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.waldgruen,
    marginRight: 8,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.waldgruen,
  },
  meta: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  mealInfoContainer: {
    flex: 1,
    marginRight: 8,
  },
  heartButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.creme,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
