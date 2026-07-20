import { scoreMeals } from '../recommendationService';
import { Meal } from '../../types/api';
import { afterEach, describe, expect, it, jest } from '@jest/globals';

const meal: Meal = {
  id: 'meal-1',
  name: 'Gemüse-Bowl',
  category: 'Salate',
  price: 2.95,
  badges: ['Vegan'],
  allergens: ['Sellerie'],
  co2Balance: 1,
  waterBalance: 2,
};

describe('scoreMeals', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('sends only observable meal facts to the recommendation service', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          recommendations: [
            {
              mealId: 'meal-1',
              score: 1,
              maxScore: 1,
              matched: ['vegan'],
              inferredTraits: ['vegan', 'vegetarisch', 'preiswert'],
            },
          ],
          evaluatedCount: 1,
          engine: 'swi-prolog',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    await scoreMeals([meal], ['Vegan']);

    const request = fetchMock.mock.calls[0]?.[1];
    const body = JSON.parse(String(request?.body)) as {
      meals: Array<Record<string, unknown>>;
      preferences: string[];
    };

    expect(body.preferences).toEqual(['vegan']);
    expect(body.meals).toEqual([
      {
        id: 'meal-1',
        name: 'Gemüse-Bowl',
        category: 'Salate',
        badges: ['Vegan'],
        additives: ['Sellerie'],
        price: 2.95,
        co2Balance: 1,
        waterBalance: 2,
      },
    ]);
  });
});
