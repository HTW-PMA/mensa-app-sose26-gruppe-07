import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { DateSelector } from '../components/common/DateSelector';
import { FilterChip } from '../components/common/FilterChip';
import { ScoreBar } from '../components/common/ScoreBar';
import { MealInfo } from '../components/dish/MealInfo';
import { CanteenSelector } from '../components/mensa/CanteenSelector';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';
import { useAppState } from '../context/AppContext';
import { usePreferences } from '../context/PreferencesContext';
import { useCanteens } from '../hooks/useCanteens';
import { useMeals } from '../hooks/useMeals';
import { KI_FILTER_OPTIONS } from '../services/mockData';
import { ScoredMeal, scoreMeals } from '../services/recommendationService';
import { getUpcomingDates } from '../utils/dates';

export function GerichtefinderScreen() {
  const planningDates = useMemo(() => getUpcomingDates(), []);
  const [selectedDateIso, setSelectedDateIso] = useState(planningDates[0].iso);
  const { selectedCanteenId, hasHydrated: hasAppStateHydrated, setSelectedCanteenId } =
    useAppState();
  const {
    canteens,
    loading: canteensLoading,
    error: canteensError,
    reload: reloadCanteens,
  } = useCanteens();
  const selectedCanteen = hasAppStateHydrated
    ? canteens.find((canteen) => canteen.id === selectedCanteenId) ?? canteens[0]
    : undefined;
  const selectedDate =
    planningDates.find((date) => date.iso === selectedDateIso) ?? planningDates[0];
  const {
    meals,
    loading: mealsLoading,
    error: mealsError,
    reload: reloadMeals,
  } = useMeals(
    hasAppStateHydrated ? selectedCanteen?.id ?? null : null,
    selectedDate.iso,
  );
  const { selectedFilters, hasHydrated, toggleFilter, resetFilters } = usePreferences();
  const [scoredMeals, setScoredMeals] = useState<ScoredMeal[]>([]);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const topScore = scoredMeals[0]?.score ?? 0;

  useEffect(() => {
    if (
      hasAppStateHydrated &&
      selectedCanteen &&
      selectedCanteen.id !== selectedCanteenId
    ) {
      setSelectedCanteenId(selectedCanteen.id);
    }
  }, [
    hasAppStateHydrated,
    selectedCanteen,
    selectedCanteenId,
    setSelectedCanteenId,
  ]);

  useEffect(() => {
    if (!hasHydrated || mealsLoading || mealsError || meals.length === 0) {
      setScoredMeals([]);
      setRecommendationError(null);
      setRecommendationLoading(false);
      return;
    }

    const controller = new AbortController();
    setRecommendationLoading(true);
    setRecommendationError(null);

    scoreMeals(meals, selectedFilters, controller.signal)
      .then(setScoredMeals)
      .catch((loadError: unknown) => {
        if (controller.signal.aborted) return;
        setScoredMeals([]);
        setRecommendationError(
          loadError instanceof Error
            ? loadError.message
            : 'Empfehlungen konnten nicht berechnet werden.',
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setRecommendationLoading(false);
      });

    return () => controller.abort();
  }, [hasHydrated, meals, mealsError, mealsLoading, retryCount, selectedFilters]);

  const loading =
    !hasAppStateHydrated ||
    canteensLoading ||
    mealsLoading ||
    recommendationLoading;
  const error = canteensError ?? mealsError ?? recommendationError;

  const retry = () => {
    if (canteensError) reloadCanteens(true);
    if (mealsError) reloadMeals(true);
    if (recommendationError) setRetryCount((count) => count + 1);
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="Gerichtefinder" showBack={false} />

      <View style={styles.planningSection}>
        <Text style={styles.planningTitle}>Plane dein Mensaessen</Text>
        <Text style={styles.planningSubtitle}>
          Mensa und Tag bestimmen, welche Gerichte bewertet werden.
        </Text>
        <CanteenSelector
          canteens={canteens}
          selectedCanteen={selectedCanteen}
          loading={canteensLoading}
          onSelect={(canteen) => setSelectedCanteenId(canteen.id)}
        />
        <Text style={styles.controlLabel}>TAG AUSWÄHLEN</Text>
        <DateSelector
          dates={planningDates}
          selectedIso={selectedDate.iso}
          onSelect={(date) => setSelectedDateIso(date.iso)}
        />
      </View>

      <Text style={styles.sectionTitle}>KI Auswahl</Text>
      <Text style={styles.sectionSub}>
        Worauf hast du Lust? Klicke alles an, was zu deinem Gericht passt.
        Die Empfehlungen aktualisieren sich automatisch.
      </Text>

      <View style={styles.filterGrid}>
        {KI_FILTER_OPTIONS.map((option) => (
          <FilterChip
            key={option.label}
            label={option.label}
            icon={option.icon}
            active={selectedFilters.includes(option.label)}
            onPress={() => toggleFilter(option.label)}
          />
        ))}
      </View>

      <View style={styles.prologDivider}>
        <View style={styles.dividerLine} />
        <Ionicons name="sparkles" size={12} color={COLORS.textMuted} />
        <Text style={styles.prologText}>SWI-PROLOG BERECHNET SCORE</Text>
        <Ionicons name="sparkles" size={12} color={COLORS.textMuted} />
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.resultsHeader}>
        <View>
          <Text style={styles.resultsTitle}>EMPFEHLUNGEN</Text>
          <Text style={styles.resultsDate}>{selectedDate.fullLabel}</Text>
        </View>
        <Text style={styles.resultsScoreLabel}>SCORE</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.waldgruen} style={styles.loader} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={retry}>
            <Text style={styles.retryText}>Erneut laden</Text>
          </Pressable>
        </View>
      ) : scoredMeals.length === 0 ? (
        <Text style={styles.emptyText}>
          {meals.length === 0
            ? `Für ${selectedDate.fullLabel} sind keine Gerichte verfügbar.`
            : 'Kein Gericht erfüllt die gewählten Ernährungsbedingungen.'}
        </Text>
      ) : scoredMeals.map((item) => {
        const isRecommended = item.score === topScore && item.score > 0;
        const criteriaText =
          item.score === 0
            ? 'Keine Kriterien treffen zu'
            : `${item.score} von ${item.maxScore} ausgewählten Kriterien erfüllt`;

        return (
          <View
            key={item.mealId}
            style={[
              styles.resultCard,
              isRecommended && styles.resultCardRecommended,
            ]}
          >
            {isRecommended ? <View style={styles.accentBar} /> : null}
            <View style={styles.resultMainRow}>
              <View style={styles.resultContent}>
                <View style={styles.resultTitleRow}>
                  <Text
                    style={[
                      styles.resultName,
                      isRecommended && styles.resultNameActive,
                    ]}
                  >
                    {item.meal.name}
                  </Text>
                  {isRecommended ? (
                    <View style={styles.recommendedBadge}>
                      <Text style={styles.recommendedText}>EMPFOHLEN</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.resultCriteria}>{criteriaText}</Text>
                {isRecommended ? (
                  <Text style={styles.resultNote}>
                    {item.meal.name} passt besonders gut zu deiner Auswahl.
                  </Text>
                ) : null}
              </View>
              <ScoreBar score={item.score} maxScore={item.maxScore} />
            </View>
            <View style={styles.resultDetails}>
              <MealInfo meal={item.meal} compact />
            </View>
          </View>
        );
      })}

      <Pressable
        style={styles.secondaryButton}
        onPress={resetFilters}
      >
        <Ionicons name="refresh" size={18} color={COLORS.waldgruen} />
        <Text style={styles.secondaryButtonText}>Filter zurücksetzen</Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  planningSection: {
    backgroundColor: COLORS.creme,
    borderRadius: LAYOUT.borderRadius.lg,
    padding: 14,
    marginBottom: 16,
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
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.waldgruen,
    marginBottom: 6,
  },
  sectionSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 20,
    marginBottom: 16,
  },
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  prologDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  prologText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  resultsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.waldgruen,
    letterSpacing: 0.5,
  },
  resultsDate: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  resultsScoreLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.waldgruen,
    letterSpacing: 0.5,
  },
  resultCard: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.borderRadius.md,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
    overflow: 'hidden',
  },
  resultCardRecommended: {
    borderColor: COLORS.waldgruen,
  },
  resultMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: COLORS.waldgruen,
  },
  resultContent: {
    flex: 1,
    paddingRight: 8,
  },
  resultTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  resultName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  resultNameActive: {
    color: COLORS.waldgruen,
    fontWeight: '700',
  },
  recommendedBadge: {
    backgroundColor: COLORS.waldgruen,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  recommendedText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  resultCriteria: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  resultNote: {
    fontSize: 11,
    color: COLORS.salbeigruen,
    marginTop: 4,
    fontStyle: 'italic',
  },
  resultDetails: {
    marginTop: 8,
    marginLeft: 4,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.creme,
    borderRadius: LAYOUT.borderRadius.md,
    paddingVertical: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  secondaryButtonText: {
    color: COLORS.waldgruen,
    fontSize: 15,
    fontWeight: '600',
  },
  loader: {
    marginVertical: 24,
  },
  errorText: {
    color: COLORS.error,
    textAlign: 'center',
  },
  errorContainer: {
    marginVertical: 20,
    alignItems: 'center',
    gap: 8,
  },
  retryText: {
    color: COLORS.waldgruen,
    fontWeight: '700',
  },
  emptyText: {
    color: COLORS.textMuted,
    textAlign: 'center',
    marginVertical: 20,
  },
});
