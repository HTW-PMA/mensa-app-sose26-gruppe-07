import { Platform } from 'react-native';
import { Meal } from '../types/api';
import { CRITERIA_MAP } from './mockData';

export interface ScoredMeal {
  mealId: string;
  meal: Meal;
  score: number;
  maxScore: number;
  matchedLabels: string[];
  inferredTraits: string[];
}

interface PrologRecommendation {
  mealId: string;
  score: number;
  maxScore: number;
  matched: string[];
  inferredTraits: string[];
}

interface PrologResponse {
  recommendations: PrologRecommendation[];
  evaluatedCount: number;
  engine: string;
}

const DEFAULT_PROLOG_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';
const REQUEST_TIMEOUT_MS = 15_000;

export class RecommendationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RecommendationError';
  }
}

function getServiceUrl(): string {
  return (
    process.env.EXPO_PUBLIC_PROLOG_API_URL?.trim().replace(/\/$/, '') ||
    DEFAULT_PROLOG_URL
  );
}

function normalizePreferences(labels: string[]): string[] {
  return labels.map((label) => CRITERIA_MAP[label] ?? label.toLocaleLowerCase('de-DE'));
}

function toPrologMeal(meal: Meal) {
  return {
    id: meal.id,
    name: meal.name,
    category: meal.category ?? '',
    traits: meal.criteria ?? [],
    badges: meal.badges ?? [],
    additives: meal.allergens ?? [],
    price: meal.price,
    co2Balance: meal.co2Balance,
    waterBalance: meal.waterBalance,
  };
}

function isPrologResponse(value: unknown): value is PrologResponse {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<PrologResponse>;
  return (
    candidate.engine === 'swi-prolog' &&
    Array.isArray(candidate.recommendations) &&
    candidate.recommendations.every(
      (item) =>
        typeof item?.mealId === 'string' &&
        typeof item.score === 'number' &&
        typeof item.maxScore === 'number' &&
        Array.isArray(item.matched) &&
        Array.isArray(item.inferredTraits),
    )
  );
}

export async function scoreMeals(
  meals: Meal[],
  criteria: string[],
  externalSignal?: AbortSignal,
): Promise<ScoredMeal[]> {
  if (meals.length === 0) return [];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const abortFromCaller = () => controller.abort();
  externalSignal?.addEventListener('abort', abortFromCaller);

  try {
    const response = await fetch(`${getServiceUrl()}/recommend`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        meals: meals.map(toPrologMeal),
        preferences: normalizePreferences(criteria),
        limit: 20,
      }),
    });

    if (!response.ok) {
      throw new RecommendationError(
        `Der Prolog-Dienst hat die Anfrage abgelehnt (${response.status}).`,
      );
    }

    const payload: unknown = await response.json();
    if (!isPrologResponse(payload)) {
      throw new RecommendationError('Der Prolog-Dienst liefert ein ungültiges Format.');
    }

    const mealsById = new Map(meals.map((meal) => [meal.id, meal]));
    return payload.recommendations.flatMap((recommendation) => {
      const meal = mealsById.get(recommendation.mealId);
      if (!meal) return [];
      return [
        {
          mealId: recommendation.mealId,
          meal,
          score: recommendation.score,
          maxScore: recommendation.maxScore,
          matchedLabels: recommendation.matched,
          inferredTraits: recommendation.inferredTraits,
        },
      ];
    });
  } catch (error) {
    if (error instanceof RecommendationError) throw error;
    if (externalSignal?.aborted) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new RecommendationError('Der Prolog-Dienst antwortet nicht rechtzeitig.');
    }
    throw new RecommendationError(
      'Prolog-Dienst nicht erreichbar. Bitte den lokalen Dienst starten.',
    );
  } finally {
    clearTimeout(timeout);
    externalSignal?.removeEventListener('abort', abortFromCaller);
  }
}
