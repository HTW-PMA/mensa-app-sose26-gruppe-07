import { CRITERIA_MAP } from './mockData';
import { Meal } from '../types/api';

export interface ScoredMeal {
  mealId: string;
  meal: Meal;
  score: number;
  maxScore: number;
  matchedLabels: string[];
}

export interface RecommendationProvider {
  scoreMeals(meals: Meal[], criteria: string[]): ScoredMeal[];
}

function normalizeCriteria(criteria: string[]): string[] {
  return criteria.map(
    (label) => CRITERIA_MAP[label] ?? label.toLowerCase(),
  );
}

/**
 * Mock-Implementierung bis Prolog-Backend angebunden ist.
 * Später durch prologRecommendationProvider ersetzen.
 */
export const mockRecommendationProvider: RecommendationProvider = {
  scoreMeals(meals: Meal[], criteria: string[]): ScoredMeal[] {
    const normalized = normalizeCriteria(criteria);
    const maxScore = Math.max(normalized.length, 4);

    return meals
      .map((meal) => {
        const mealCriteria = meal.criteria ?? [];
        const matchedLabels = normalized.filter((criterion) =>
          mealCriteria.includes(criterion) ||
          meal.badges?.some((badge) => badge.toLowerCase().includes(criterion)),
        );

        return {
          mealId: meal.id,
          meal,
          score: matchedLabels.length,
          maxScore,
          matchedLabels,
        };
      })
      .sort((a, b) => b.score - a.score);
  },
};

export function scoreMeals(
  meals: Meal[],
  criteria: string[],
  provider: RecommendationProvider = mockRecommendationProvider,
): ScoredMeal[] {
  return provider.scoreMeals(meals, criteria);
}
