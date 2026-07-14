import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { Meal } from '../types/api';

interface PersistedFavorites {
  favoriteCanteenIds: string[];
  favoriteMeals: Meal[];
}

interface FavoritesContextValue {
  favoriteCanteenIds: string[];
  favoriteMealIds: string[];
  favoriteMeals: Meal[];
  toggleCanteenFavorite: (id: string) => void;
  toggleMealFavorite: (meal: Meal) => void;
  isCanteenFavorite: (id: string) => boolean;
  isMealFavorite: (id: string) => boolean;
}

const STORAGE_KEY = '@mensabaer/favorites/v2';
const FavoritesContext = createContext<FavoritesContextValue | undefined>(
  undefined,
);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteCanteenIds, setFavoriteCanteenIds] = useState<string[]>([]);
  const [favoriteMeals, setFavoriteMeals] = useState<Meal[]>([]);
  const [hasHydrated, setHasHydrated] = useState(false);
  const hasCanteenChanges = useRef(false);
  const hasMealChanges = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((serialized) => {
        if (!serialized) return;
        const stored = JSON.parse(serialized) as Partial<PersistedFavorites>;
        if (!hasCanteenChanges.current && Array.isArray(stored.favoriteCanteenIds)) {
          setFavoriteCanteenIds(stored.favoriteCanteenIds);
        }
        if (!hasMealChanges.current && Array.isArray(stored.favoriteMeals)) {
          setFavoriteMeals(stored.favoriteMeals);
        }
      })
      .catch(() => undefined)
      .finally(() => setHasHydrated(true));
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    const value: PersistedFavorites = { favoriteCanteenIds, favoriteMeals };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(value)).catch(() => undefined);
  }, [favoriteCanteenIds, favoriteMeals, hasHydrated]);

  const favoriteMealIds = useMemo(
    () => favoriteMeals.map((meal) => meal.id),
    [favoriteMeals],
  );

  const toggleCanteenFavorite = useCallback((id: string) => {
    hasCanteenChanges.current = true;
    setFavoriteCanteenIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }, []);

  const toggleMealFavorite = useCallback((meal: Meal) => {
    hasMealChanges.current = true;
    setFavoriteMeals((current) =>
      current.some((item) => item.id === meal.id)
        ? current.filter((item) => item.id !== meal.id)
        : [...current, meal],
    );
  }, []);

  const isCanteenFavorite = useCallback(
    (id: string) => favoriteCanteenIds.includes(id),
    [favoriteCanteenIds],
  );

  const isMealFavorite = useCallback(
    (id: string) => favoriteMealIds.includes(id),
    [favoriteMealIds],
  );

  const value = useMemo(
    () => ({
      favoriteCanteenIds,
      favoriteMealIds,
      favoriteMeals,
      toggleCanteenFavorite,
      toggleMealFavorite,
      isCanteenFavorite,
      isMealFavorite,
    }),
    [
      favoriteCanteenIds,
      favoriteMealIds,
      favoriteMeals,
      toggleCanteenFavorite,
      toggleMealFavorite,
      isCanteenFavorite,
      isMealFavorite,
    ],
  );

  return (
    <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
}
