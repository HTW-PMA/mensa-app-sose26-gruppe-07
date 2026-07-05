import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { SegmentedControl } from '../components/common/SegmentedControl';
import { SustainabilityBanner } from '../components/common/SustainabilityBanner';
import { DishCard } from '../components/dish/DishCard';
import { MensaCard } from '../components/mensa/MensaCard';
import { COLORS } from '../constants/colors';
import { useFavorites } from '../context/FavoritesContext';
import { useCanteens } from '../hooks/useCanteens';
import { useMeals } from '../hooks/useMeals';
import { useAppState } from '../context/AppContext';

export function FavoritenScreen() {
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const { canteens } = useCanteens();
  const { selectedCanteenId } = useAppState();
  const { meals } = useMeals(selectedCanteenId);
  const {
    favoriteCanteenIds,
    favoriteMealIds,
    isCanteenFavorite,
    isMealFavorite,
    toggleCanteenFavorite,
    toggleMealFavorite,
  } = useFavorites();

  const favoriteCanteens = useMemo(
    () => canteens.filter((c) => favoriteCanteenIds.includes(c.id)),
    [canteens, favoriteCanteenIds],
  );

  const favoriteMeals = useMemo(
    () => meals.filter((m) => favoriteMealIds.includes(m.id)),
    [meals, favoriteMealIds],
  );

  return (
    <ScreenContainer>
      <ScreenHeader title="Favoriten" showBack={false} />

      <SegmentedControl
        options={[
          { label: 'Meine Mensen', icon: 'heart' },
          { label: 'Meine Gerichte', icon: 'restaurant' },
        ]}
        selectedIndex={segmentIndex}
        onSelect={setSegmentIndex}
      />

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            {segmentIndex === 0 ? 'Lieblingsmensen' : 'Lieblingsgerichte'}
          </Text>
          <Text style={styles.sectionSub}>
            {segmentIndex === 0
              ? 'Deine favorisierten Mensen'
              : 'Deine favorisierten Gerichte'}
          </Text>
        </View>
        <Pressable
          style={styles.editButton}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Ionicons name="pencil" size={14} color={COLORS.waldgruen} />
          <Text style={styles.editText}>Bearbeiten</Text>
        </Pressable>
      </View>

      {segmentIndex === 0 ? (
        favoriteCanteens.length > 0 ? (
          favoriteCanteens.map((canteen) => (
            <MensaCard
              key={canteen.id}
              canteen={canteen}
              isFavorite={isCanteenFavorite(canteen.id)}
              onToggleFavorite={() => toggleCanteenFavorite(canteen.id)}
            />
          ))
        ) : (
          <Text style={styles.emptyText}>
            Noch keine Lieblingsmensen. Tippe auf das Herz bei einer Mensa.
          </Text>
        )
      ) : favoriteMeals.length > 0 ? (
        favoriteMeals.map((meal) => (
          <DishCard
            key={meal.id}
            meal={meal}
            isFavorite={isMealFavorite(meal.id)}
            onToggleFavorite={() => toggleMealFavorite(meal.id)}
          />
        ))
      ) : (
        <Text style={styles.emptyText}>
          Noch keine Lieblingsgerichte. Tippe auf das Herz bei einem Gericht.
        </Text>
      )}

      {segmentIndex === 0 && favoriteMeals.length > 0 ? (
        <>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Lieblingsgerichte</Text>
              <Text style={styles.sectionSub}>Deine favorisierten Gerichte</Text>
            </View>
            <Pressable style={styles.editButton}>
              <Ionicons name="pencil" size={14} color={COLORS.waldgruen} />
              <Text style={styles.editText}>Bearbeiten</Text>
            </Pressable>
          </View>
          {favoriteMeals.map((meal) => (
            <DishCard
              key={meal.id}
              meal={meal}
              isFavorite={isMealFavorite(meal.id)}
              onToggleFavorite={() => toggleMealFavorite(meal.id)}
            />
          ))}
        </>
      ) : null}

      <SustainabilityBanner />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.waldgruen,
  },
  sectionSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editText: {
    fontSize: 13,
    color: COLORS.waldgruen,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginVertical: 24,
    lineHeight: 22,
  },
});
