import React, { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { FilterChip } from '../components/common/FilterChip';
import { ScoreBar } from '../components/common/ScoreBar';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';
import { useAppState } from '../context/AppContext';
import { usePreferences } from '../context/PreferencesContext';
import { useMeals } from '../hooks/useMeals';
import { KI_FILTER_OPTIONS } from '../services/mockData';
import { scoreMeals } from '../services/recommendationService';

export function GerichtefinderScreen() {
  const { selectedCanteenId } = useAppState();
  const { meals } = useMeals(selectedCanteenId);
  const { selectedFilters, toggleFilter, resetFilters } = usePreferences();
  const [appliedFilters, setAppliedFilters] = useState<string[]>(selectedFilters);

  const scoredMeals = useMemo(
    () => scoreMeals(meals, appliedFilters),
    [meals, appliedFilters],
  );

  const maxScore = Math.max(appliedFilters.length, 4);
  const topScore = scoredMeals[0]?.score ?? 0;

  return (
    <ScreenContainer>
      <ScreenHeader title="Gerichtefinder" showBack={false} />

      <View style={styles.heroCard}>
        <Text style={styles.heroEmoji}>🐻‍🍳</Text>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>
            Ich helfe dir,{' '}
            <Text style={styles.heroHighlight}>das Richtige zu finden!</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            Lass dir passende Gerichte empfehlen: basierend auf deinen
            Vorlieben und Allergien.
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>KI Auswahl</Text>
      <Text style={styles.sectionSub}>
        Worauf hast du heute Lust? Klicke alles an, was zu deinem Gericht passt.
        Die KI berechnet das bestmögliche Match.
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
        <Text style={styles.prologText}>PROLOG BERECHNET SCORE</Text>
        <Ionicons name="sparkles" size={12} color={COLORS.textMuted} />
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>EMPFEHLUNGEN HEUTE</Text>
        <Text style={styles.resultsScoreLabel}>SCORE</Text>
      </View>

      {scoredMeals.map((item) => {
        const isRecommended = item.score === topScore && item.score > 0;
        const criteriaText =
          item.score === 0
            ? 'Keine Kriterien treffen zu'
            : `${item.score} von ${maxScore} Kriterien erfüllt`;

        return (
          <View
            key={item.mealId}
            style={[
              styles.resultCard,
              isRecommended && styles.resultCardRecommended,
            ]}
          >
            {isRecommended ? <View style={styles.accentBar} /> : null}
            <Image
              source={{ uri: item.meal.imageUrl }}
              style={styles.resultImage}
            />
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
                  {item.meal.name} passt heute besser zu deiner Auswahl.
                </Text>
              ) : null}
            </View>
            <ScoreBar score={item.score} maxScore={maxScore} />
          </View>
        );
      })}

      <Pressable
        style={styles.primaryButton}
        onPress={() => setAppliedFilters([...selectedFilters])}
      >
        <Ionicons name="filter" size={18} color={COLORS.white} />
        <Text style={styles.primaryButtonText}>Filter anwenden</Text>
      </Pressable>

      <Pressable
        style={styles.secondaryButton}
        onPress={() => {
          resetFilters();
          setAppliedFilters([]);
        }}
      >
        <Ionicons name="refresh" size={18} color={COLORS.waldgruen} />
        <Text style={styles.secondaryButtonText}>Filter zurücksetzen</Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.creme,
    borderRadius: LAYOUT.borderRadius.lg,
    padding: 16,
    marginBottom: 20,
    gap: 12,
    alignItems: 'center',
  },
  heroEmoji: {
    fontSize: 56,
  },
  heroContent: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.waldgruen,
    marginBottom: 6,
  },
  heroHighlight: {
    color: COLORS.salbeigruen,
  },
  heroSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 18,
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
  resultsScoreLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.waldgruen,
    letterSpacing: 0.5,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: COLORS.waldgruen,
  },
  resultImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    marginLeft: 4,
    backgroundColor: COLORS.creme,
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
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.waldgruen,
    borderRadius: LAYOUT.borderRadius.md,
    paddingVertical: 14,
    marginTop: 16,
    gap: 8,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.creme,
    borderRadius: LAYOUT.borderRadius.md,
    paddingVertical: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  secondaryButtonText: {
    color: COLORS.waldgruen,
    fontSize: 15,
    fontWeight: '600',
  },
});
