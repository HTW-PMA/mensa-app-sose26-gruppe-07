import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { Meal } from '../../types/api';
import { DishTag } from './DishTag';

interface SideDishRowProps {
  meal: Meal;
  onAdd?: () => void;
}

function formatPrice(price: number): string {
  return `${price.toFixed(2).replace('.', ',')} €`;
}

export function SideDishRow({ meal, onAdd }: SideDishRowProps) {
  return (
    <View style={styles.row}>
      <Image source={{ uri: meal.imageUrl }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.name}>{meal.name}</Text>
        {meal.description ? (
          <Text style={styles.description}>{meal.description}</Text>
        ) : null}
        {meal.badges?.[0] ? <DishTag label={meal.badges[0]} /> : null}
      </View>
      <Text style={styles.price}>{formatPrice(meal.price)}</Text>
      <Pressable onPress={onAdd} style={styles.addButton}>
        <Ionicons name="add" size={18} color={COLORS.waldgruen} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.borderRadius.sm,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: LAYOUT.borderRadius.sm,
    marginRight: 10,
    backgroundColor: COLORS.creme,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.waldgruen,
  },
  description: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  price: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.waldgruen,
    marginRight: 8,
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.waldgruen,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
