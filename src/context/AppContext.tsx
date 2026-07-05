import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from 'react';

interface AppContextValue {
  selectedCanteenId: string | null;
  setSelectedCanteenId: (id: string) => void;
  apiError: string | null;
  setApiError: (error: string | null) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [selectedCanteenId, setSelectedCanteenIdState] = useState<string | null>(
    'canteen-1',
  );
  const [apiError, setApiError] = useState<string | null>(null);

  const setSelectedCanteenId = useCallback((id: string) => {
    setSelectedCanteenIdState(id);
  }, []);

  const value = useMemo(
    () => ({
      selectedCanteenId,
      setSelectedCanteenId,
      apiError,
      setApiError,
    }),
    [selectedCanteenId, setSelectedCanteenId, apiError],
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
