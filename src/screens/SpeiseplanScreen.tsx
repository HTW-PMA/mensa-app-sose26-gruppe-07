import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { FilterChip } from '../components/common/FilterChip';
import { SustainabilityBanner } from '../components/common/SustainabilityBanner';
import { DishCard } from '../components/dish/DishCard';
import { SideDishRow } from '../components/dish/SideDishRow';
import { MensaLocationCard } from '../components/mensa/MensaLocationCard';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';
import { useAppState } from '../context/AppContext';
import { useFavorites } from '../context/FavoritesContext';
import { useCanteens } from '../hooks/useCanteens';
import { useMeals } from '../hooks/useMeals';
import { CATEGORY_FILTERS } from '../services/mockData';
import { Meal } from '../types/api';

function getWeekDates(): { day: string; date: string; iso: string }[] {
  const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  const result = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    result.push({
      day: days[d.getDay()],
      date: `${d.getDate()}. ${d.toLocaleString('de-DE', { month: 'short' })}`,
      iso: d.toISOString().split('T')[0],
    });
  }
  return result;
}

function filterMealsByCategory(meals: Meal[], category: string): Meal[] {
  if (category === 'Alle') return meals;
  if (category === 'Vegane Gerichte') {
    return meals.filter((m) => m.badges?.some((b) => b.toLowerCase() === 'vegan'));
  }
  if (category === 'Vegetarische Gerichte') {
    return meals.filter((m) =>
      m.badges?.some((b) => ['vegan', 'vegetarisch'].includes(b.toLowerCase())),
    );
  }
  if (category === 'Fleischgerichte') {
    return meals.filter(
      (m) => !m.badges?.some((b) => ['vegan', 'vegetarisch'].includes(b.toLowerCase())),
    );
  }
  return meals;
}

export function SpeiseplanScreen() {
  const weekDates = useMemo(() => getWeekDates(), []);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('Alle');
  const { selectedCanteenId } = useAppState();
  const { canteens } = useCanteens();
  const { menueSections, loading } = useMeals(
    selectedCanteenId,
    weekDates[selectedDateIndex]?.iso,
  );
  const { apiError } = useAppState();
  const { isCanteenFavorite, isMealFavorite, toggleCanteenFavorite, toggleMealFavorite } =
    useFavorites();

  const selectedCanteen =
    canteens.find((c) => c.id === selectedCanteenId) ?? canteens[0];

  return (
    <ScreenContainer>
      <ScreenHeader title="Speiseplan" showBack={false} />

      {selectedCanteen ? (
        <MensaLocationCard
          canteen={selectedCanteen}
          isFavorite={isCanteenFavorite(selectedCanteen.id)}
          onToggleFavorite={() => toggleCanteenFavorite(selectedCanteen.id)}
        />
      ) : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.dateScroll}
        contentContainerStyle={styles.dateScrollContent}
      >
        {weekDates.map((item, index) => (
          <Pressable
            key={item.iso}
            onPress={() => setSelectedDateIndex(index)}
            style={[styles.dateCard, index === selectedDateIndex && styles.dateCardActive]}
          >
            <Text
              style={[
                styles.dateDay,
                index === selectedDateIndex && styles.dateTextActive,
              ]}
            >
              {item.day}
            </Text>
            <Text
              style={[
                styles.dateLabel,
                index === selectedDateIndex && styles.dateTextActive,
              ]}
            >
              {item.date}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

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

      {apiError ? <Text style={styles.errorText}>{apiError}</Text> : null}

      {loading ? (
        <ActivityIndicator color={COLORS.waldgruen} style={styles.loader} />
      ) : (
        menueSections.map((section) => {
          const filteredMeals = filterMealsByCategory(section.meals, selectedCategory);
          if (filteredMeals.length === 0) return null;

          return (
            <View key={section.id}>
              <Text style={styles.menueTitle}>{section.name}</Text>

              {section.name === 'Menü 2' ? (
                <Pressable style={styles.recommendationCard}>
                  <Ionicons name="sparkles" size={18} color={COLORS.salbeigruen} />
                  <View style={styles.recommendationText}>
                    <Text style={styles.recommendationTitle}>
                      Empfohlen von deinem Mensabär Helfer
                    </Text>
                    <Text style={styles.recommendationSub}>
                      Basierend auf deinen Vorlieben: vegetarisch, wenig Fleisch
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
                </Pressable>
              ) : null}

              {section.name === 'Beilagen'
                ? filteredMeals.map((meal) => (
                    <SideDishRow key={meal.id} meal={meal} />
                  ))
                : filteredMeals.map((meal) => (
                    <DishCard
                      key={meal.id}
                      meal={meal}
                      isFavorite={isMealFavorite(meal.id)}
                      onToggleFavorite={() => toggleMealFavorite(meal.id)}
                    />
                  ))}
            </View>
          );
        })
      )}

      <SustainabilityBanner />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  dateScroll: {
    marginBottom: 12,
  },
  dateScrollContent: {
    gap: 8,
  },
  dateCard: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: LAYOUT.borderRadius.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    minWidth: 72,
  },
  dateCardActive: {
    backgroundColor: COLORS.waldgruen,
    borderColor: COLORS.waldgruen,
  },
  dateDay: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.waldgruen,
  },
  dateLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  dateTextActive: {
    color: COLORS.white,
  },
  filterScroll: {
    marginBottom: 16,
  },
  filterScrollContent: {
    paddingRight: 8,
  },
  menueTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.waldgruen,
    marginBottom: 12,
    marginTop: 8,
  },
  recommendationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.creme,
    borderRadius: LAYOUT.borderRadius.md,
    padding: 14,
    marginBottom: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.salbeigruen,
  },
  recommendationText: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.waldgruen,
  },
  recommendationSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  loader: {
    marginVertical: 24,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    marginBottom: 12,
  },
});
