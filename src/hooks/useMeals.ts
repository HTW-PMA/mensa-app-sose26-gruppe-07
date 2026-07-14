import { useCallback, useEffect, useRef, useState } from 'react';
import { getMenues } from '../services/mensaApi';
import { Meal, MenueSection } from '../types/api';

export function useMeals(canteenId: string | null, date?: string) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [menueSections, setMenueSections] = useState<MenueSection[]>([]);
  const [loading, setLoading] = useState(Boolean(canteenId));
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const loadMeals = useCallback(
    async (forceRefresh = false) => {
      const activeRequest = ++requestId.current;
      if (!canteenId) {
        setMeals([]);
        setMenueSections([]);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      try {
        const sections = await getMenues(canteenId, date, forceRefresh);
        if (activeRequest !== requestId.current) return;
        setMenueSections(sections);
        setMeals(sections.flatMap((section) => section.meals));
        setError(null);
      } catch (loadError) {
        if (activeRequest !== requestId.current) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Speiseplan konnte nicht geladen werden.',
        );
      } finally {
        if (activeRequest === requestId.current) setLoading(false);
      }
    },
    [canteenId, date],
  );

  useEffect(() => {
    loadMeals();
    return () => {
      requestId.current += 1;
    };
  }, [loadMeals]);

  return { meals, menueSections, loading, error, reload: loadMeals };
}
