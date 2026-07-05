import React, { ReactNode } from 'react';
import { AppStateProvider } from './AppContext';
import { FavoritesProvider } from './FavoritesContext';
import { PreferencesProvider } from './PreferencesContext';

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <AppStateProvider>
      <FavoritesProvider>
        <PreferencesProvider>{children}</PreferencesProvider>
      </FavoritesProvider>
    </AppStateProvider>
  );
}
