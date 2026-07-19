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

interface PersistedPreferences {
  selectedFilters: string[];
  dietPreferences: string[];
}

interface PreferencesContextValue {
  selectedFilters: string[];
  dietPreferences: string[];
  hasHydrated: boolean;
  toggleFilter: (label: string) => void;
  resetFilters: () => void;
  setDietPreferences: (prefs: string[]) => void;
}

const STORAGE_KEY = '@mensabaer/preferences/v1';
const PreferencesContext = createContext<PreferencesContextValue | undefined>(
  undefined,
);

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [dietPreferences, setDietPreferencesState] = useState<string[]>([]);
  const [hasHydrated, setHasHydrated] = useState(false);
  const hasFilterChanges = useRef(false);
  const hasDietChanges = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((serialized) => {
        if (!serialized) return;
        const stored = JSON.parse(serialized) as Partial<PersistedPreferences>;
        if (!hasFilterChanges.current && Array.isArray(stored.selectedFilters)) {
          setSelectedFilters(stored.selectedFilters.filter(isString));
        }
        if (!hasDietChanges.current && Array.isArray(stored.dietPreferences)) {
          setDietPreferencesState(stored.dietPreferences.filter(isString));
        }
      })
      .catch(() => undefined)
      .finally(() => setHasHydrated(true));
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    const value: PersistedPreferences = { selectedFilters, dietPreferences };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(value)).catch(() => undefined);
  }, [dietPreferences, hasHydrated, selectedFilters]);

  const toggleFilter = useCallback((label: string) => {
    hasFilterChanges.current = true;
    setSelectedFilters((current) =>
      current.includes(label)
        ? current.filter((item) => item !== label)
        : [...current, label],
    );
  }, []);

  const resetFilters = useCallback(() => {
    hasFilterChanges.current = true;
    setSelectedFilters([]);
  }, []);

  const setDietPreferences = useCallback((preferences: string[]) => {
    hasDietChanges.current = true;
    setDietPreferencesState(preferences);
  }, []);

  const value = useMemo(
    () => ({
      selectedFilters,
      dietPreferences,
      hasHydrated,
      toggleFilter,
      resetFilters,
      setDietPreferences,
    }),
    [
      selectedFilters,
      dietPreferences,
      hasHydrated,
      toggleFilter,
      resetFilters,
      setDietPreferences,
    ],
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
