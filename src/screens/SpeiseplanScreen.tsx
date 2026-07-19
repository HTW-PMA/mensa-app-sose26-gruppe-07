import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { DateSelector } from '../components/common/DateSelector';
import { FilterChip } from '../components/common/FilterChip';
import { SustainabilityBanner } from '../components/common/SustainabilityBanner';
import { DishCard } from '../components/dish/DishCard';
import { SideDishRow } from '../components/dish/SideDishRow';
import { CanteenSelector } from '../components/mensa/CanteenSelector';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';
import { useAppState } from '../context/AppContext';
import { useFavorites } from '../context/FavoritesContext';
import { useCanteens } from '../hooks/useCanteens';
import { useMeals } from '../hooks/useMeals';
import { CATEGORY_FILTERS } from '../services/mockData';
import { Meal } from '../types/api';
import { getUpcomingDates } from '../utils/dates';

function filterMealsByCategory(meals: Meal[], category: string): Meal[] {
  if (category === 'Alle') return meals;
  if (category === 'Vegane Gerichte') {
    return meals.filter((meal) =>
      meal.badges?.some((badge) => badge.toLowerCase() === 'vegan'),
    );
  }
  if (category === 'Vegetarische Gerichte') {
    return meals.filter((meal) =>
      meal.badges?.some((badge) =>
        ['vegan', 'vegetarisch'].includes(badge.toLowerCase()),
      ),
    );
  }
  if (category === 'Fleischgerichte') {
    return meals.filter(
      (meal) =>
        !meal.badges?.some((badge) =>
          ['vegan', 'vegetarisch'].includes(badge.toLowerCase()),
        ),
    );
  }
  return meals;
}

export function SpeiseplanScreen() {
  const weekDates = useMemo(() => getUpcomingDates(), []);
  const [selectedDateIso, setSelectedDateIso] = useState(weekDates[0].iso);
  const [selectedCategory, setSelectedCategory] = useState('Alle');
  const { selectedCanteenId, hasHydrated, setSelectedCanteenId } = useAppState();
  const {
    canteens,
    loading: canteensLoading,
    error: canteensError,
    reload: reloadCanteens,
  } = useCanteens();
  const selectedCanteen = hasHydrated
    ? canteens.find((canteen) => canteen.id === selectedCanteenId) ?? canteens[0]
    : undefined;
  const selectedDate =
    weekDates.find((date) => date.iso === selectedDateIso) ?? weekDates[0];
  const {
    menueSections,
    loading: mealsLoading,
    error: mealsError,
    reload: reloadMeals,
  } = useMeals(hasHydrated ? selectedCanteen?.id ?? null : null, selectedDate.iso);
  const {
    isCanteenFavorite,
    isMealFavorite,
    toggleCanteenFavorite,
    toggleMealFavorite,
  } = useFavorites();

  useEffect(() => {
    if (
      hasHydrated &&
      selectedCanteen &&
      selectedCanteen.id !== selectedCanteenId
    ) {
      setSelectedCanteenId(selectedCanteen.id);
    }
  }, [hasHydrated, selectedCanteen, selectedCanteenId, setSelectedCanteenId]);

  const visibleSections = menueSections
    .map((section) => ({
      ...section,
      meals: filterMealsByCategory(section.meals, selectedCategory),
    }))
    .filter((section) => section.meals.length > 0);
  const error = canteensError ?? mealsError;
  const loading =
    !hasHydrated ||
    canteensLoading ||
    (Boolean(selectedCanteen) && mealsLoading);

  return (
    <ScreenContainer>
      <ScreenHeader title="Speiseplan" showBack={false} />

      <View style={styles.planningSection}>
        <Text style={styles.planningTitle}>Dein Mensaplan</Text>
        <Text style={styles.planningSubtitle}>
          Wähle Mensa und Tag – der Speiseplan wird direkt aktualisiert.
        </Text>
        <CanteenSelector
          canteens={canteens}
          selectedCanteen={selectedCanteen}
          loading={canteensLoading}
          onSelect={(canteen) => setSelectedCanteenId(canteen.id)}
          isFavorite={selectedCanteen ? isCanteenFavorite(selectedCanteen.id) : false}
          onToggleFavorite={
            selectedCanteen
              ? () => toggleCanteenFavorite(selectedCanteen.id)
              : undefined
          }
        />
        <Text style={styles.controlLabel}>TAG AUSWÄHLEN</Text>
        <DateSelector
          dates={weekDates}
          selectedIso={selectedDate.iso}
          onSelect={(date) => setSelectedDateIso(date.iso)}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterScrollContent}
      >
        {CATEGORY_FILTERS.map((filter) => (
          <FilterChip
            key={filter.label}
            label={filter.label}
            icon={filter.icon}
            active={selectedCategory === filter.label}
            onPress={() => setSelectedCategory(filter.label)}
            variant="primary"
          />
        ))}
      </ScrollView>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            onPress={() => {
              if (canteensError) reloadCanteens(true);
              if (mealsError) reloadMeals(true);
            }}
          >
            <Text style={styles.retryText}>Erneut laden</Text>
          </Pressable>
        </View>
      ) : null}

      {loading ? (
        <ActivityIndicator color={COLORS.waldgruen} style={styles.loader} />
      ) : visibleSections.length === 0 && !error ? (
        <Text style={styles.emptyText}>
          Für diesen Tag und Filter sind keine Gerichte verfügbar.
        </Text>
      ) : (
        visibleSections.map((section) => (
          <View key={section.id}>
            <Text style={styles.menueTitle}>{section.name}</Text>
            {section.name.toLowerCase().includes('beilage')
              ? section.meals.map((meal) => <SideDishRow key={meal.id} meal={meal} />)
              : section.meals.map((meal) => (
                  <DishCard
                    key={meal.id}
                    meal={meal}
                    isFavorite={isMealFavorite(meal.id)}
                    onToggleFavorite={() => toggleMealFavorite(meal)}
                  />
                ))}
          </View>
        ))
      )}

      <SustainabilityBanner />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  planningSection: {
    backgroundColor: COLORS.creme,
    borderRadius: LAYOUT.borderRadius.lg,
    padding: 14,
    marginBottom: 14,
  },
  planningTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.waldgruen,
  },
  planningSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 17,
    marginTop: 3,
    marginBottom: 12,
  },
  controlLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1.1,
    marginBottom: 6,
  },
  filterScroll: { marginBottom: 16 },
  filterScrollContent: { paddingRight: 8 },
  menueTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.waldgruen,
    marginBottom: 12,
    marginTop: 8,
  },
  loader: { marginVertical: 24 },
  errorContainer: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.error,
    borderWidth: 1,
    borderRadius: LAYOUT.borderRadius.sm,
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  errorText: { color: COLORS.error, fontSize: 13 },
  retryText: { color: COLORS.waldgruen, fontSize: 13, fontWeight: '700' },
  emptyText: {
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginVertical: 24,
  },
});
