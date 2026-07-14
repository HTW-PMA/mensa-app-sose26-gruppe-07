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

interface AppContextValue {
  selectedCanteenId: string | null;
  setSelectedCanteenId: (id: string | null) => void;
}

const STORAGE_KEY = '@mensabaer/app-state/v1';
const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [selectedCanteenId, setSelectedCanteenIdState] = useState<string | null>(
    null,
  );
  const [hasHydrated, setHasHydrated] = useState(false);
  const hasLocalChanges = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (value && !hasLocalChanges.current) setSelectedCanteenIdState(value);
      })
      .finally(() => setHasHydrated(true));
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    if (selectedCanteenId) {
      AsyncStorage.setItem(STORAGE_KEY, selectedCanteenId).catch(() => undefined);
    } else {
      AsyncStorage.removeItem(STORAGE_KEY).catch(() => undefined);
    }
  }, [hasHydrated, selectedCanteenId]);

  const setSelectedCanteenId = useCallback((id: string | null) => {
    hasLocalChanges.current = true;
    setSelectedCanteenIdState(id);
  }, []);

  const value = useMemo(
    () => ({ selectedCanteenId, setSelectedCanteenId }),
    [selectedCanteenId, setSelectedCanteenId],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
}
