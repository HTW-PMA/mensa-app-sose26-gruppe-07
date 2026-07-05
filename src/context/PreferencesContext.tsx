import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from 'react';

interface PreferencesContextValue {
  selectedFilters: string[];
  dietPreferences: string[];
  toggleFilter: (label: string) => void;
  resetFilters: () => void;
  setDietPreferences: (prefs: string[]) => void;
}

const PreferencesContext = createContext<PreferencesContextValue | undefined>(
  undefined,
);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['Leicht']);
  const [dietPreferences, setDietPreferences] = useState<string[]>([
    'vegetarisch',
  ]);

  const toggleFilter = useCallback((label: string) => {
    setSelectedFilters((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label],
    );
  }, []);

  const resetFilters = useCallback(() => {
    setSelectedFilters([]);
  }, []);

  const value = useMemo(
    () => ({
      selectedFilters,
      dietPreferences,
      toggleFilter,
      resetFilters,
      setDietPreferences,
    }),
    [selectedFilters, dietPreferences, toggleFilter, resetFilters],
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesContextValue {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }
  return context;
}
