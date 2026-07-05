import { useCallback, useEffect, useState } from 'react';
import { getMeals, getMenues } from '../services/mensaApi';
import { useAppState } from '../context/AppContext';
import { Meal, MenueSection } from '../types/api';

export function useMeals(canteenId: string | null, date?: string) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [menueSections, setMenueSections] = useState<MenueSection[]>([]);
  const [loading, setLoading] = useState(true);
  const { setApiError } = useAppState();

  const loadMeals = useCallback(async () => {
    if (!canteenId) {
      setMeals([]);
      setMenueSections([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [mealData, menueData] = await Promise.all([
        getMeals(canteenId),
        getMenues(canteenId, date),
      ]);
      setMeals(mealData);
      setMenueSections(menueData);
      setApiError(null);
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : 'Speiseplan konnte nicht geladen werden.',
      );
    } finally {
      setLoading(false);
    }
  }, [canteenId, date, setApiError]);

  useEffect(() => {
    loadMeals();
  }, [loadMeals]);

  return { meals, menueSections, loading, reload: loadMeals };
}
