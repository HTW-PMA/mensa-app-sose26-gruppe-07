import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { Meal } from '../../types/api';
import { DishTag } from './DishTag';

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
      <Image
        source={{ uri: meal.imageUrl }}
        style={[styles.image, compact && styles.imageCompact]}
      />
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>
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

        {meal.allergens && meal.allergens.length > 0 ? (
          <Text style={styles.allergens}>
            Allergene: {meal.allergens.join(', ')}
          </Text>
        ) : null}
      </View>

      {onToggleFavorite ? (
        <Pressable onPress={onToggleFavorite} style={styles.heartButton}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={22}
            color={COLORS.waldgruen}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.borderRadius.md,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  cardCompact: {
    padding: 10,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: LAYOUT.borderRadius.sm,
    marginRight: 12,
    backgroundColor: COLORS.creme,
  },
  imageCompact: {
    width: 64,
    height: 64,
  },
  content: {
    flex: 1,
    paddingRight: 28,
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
  allergens: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  heartButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
});
