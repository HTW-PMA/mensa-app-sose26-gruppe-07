import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from 'react';

interface FavoritesContextValue {
  favoriteCanteenIds: string[];
  favoriteMealIds: string[];
  toggleCanteenFavorite: (id: string) => void;
  toggleMealFavorite: (id: string) => void;
  isCanteenFavorite: (id: string) => boolean;
  isMealFavorite: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(
  undefined,
);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteCanteenIds, setFavoriteCanteenIds] = useState<string[]>([
    'canteen-1',
  ]);
  const [favoriteMealIds, setFavoriteMealIds] = useState<string[]>([
    'meal-1',
    'meal-2',
  ]);

  const toggleCanteenFavorite = useCallback((id: string) => {
    setFavoriteCanteenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }, []);

  const toggleMealFavorite = useCallback((id: string) => {
    setFavoriteMealIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
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
      toggleCanteenFavorite,
      toggleMealFavorite,
      isCanteenFavorite,
      isMealFavorite,
    }),
    [
      favoriteCanteenIds,
      favoriteMealIds,
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
