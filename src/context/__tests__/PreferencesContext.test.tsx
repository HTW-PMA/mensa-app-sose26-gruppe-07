import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Button, Text } from 'react-native';
import { PreferencesProvider, usePreferences } from '../PreferencesContext';

jest.mock('@react-native-async-storage/async-storage', () => {
  const { fn } = require('jest-mock');

  return {
    __esModule: true,
    default: { getItem: fn(), setItem: fn() },
  };
});

const storage = jest.mocked(AsyncStorage);

function PreferencesProbe() {
  const { selectedFilters, dietPreferences, toggleFilter, setDietPreferences } = usePreferences();

  return (
    <>
      <Text testID="filters">{selectedFilters.join(',')}</Text>
      <Text testID="diet">{dietPreferences.join(',')}</Text>
      <Button title="Local filter" onPress={() => toggleFilter('local')} />
      <Button title="Local diet" onPress={() => setDietPreferences(['vegan'])} />
    </>
  );
}

describe('PreferencesProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    storage.getItem.mockResolvedValue(null);
    storage.setItem.mockResolvedValue(undefined);
  });

  it('restores only string filters and diet preferences after hydration', async () => {
    storage.getItem.mockResolvedValue(JSON.stringify({
      selectedFilters: ['Warm', false, 1],
      dietPreferences: ['vegetarisch', {}, null],
    }));

    const screen = await render(
      <PreferencesProvider><PreferencesProbe /></PreferencesProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('filters').props.children).toBe('Warm');
      expect(screen.getByTestId('diet').props.children).toBe('vegetarisch');
    });
  });

  it('keeps local preferences made before delayed hydration', async () => {
    let resolveStorage!: (value: string | null) => void;
    storage.getItem.mockReturnValue(new Promise((resolve) => { resolveStorage = resolve; }));

    const screen = await render(
      <PreferencesProvider><PreferencesProbe /></PreferencesProvider>,
    );

    await fireEvent.press(screen.getByText('Local filter'));
    await fireEvent.press(screen.getByText('Local diet'));

    resolveStorage(JSON.stringify({
      selectedFilters: ['stored'], dietPreferences: ['stored'],
    }));

    await waitFor(() => {
      expect(screen.getByTestId('filters').props.children).toBe('local');
      expect(screen.getByTestId('diet').props.children).toBe('vegan');
    });

    await screen.unmount();
  });

  it('uses defaults for corrupt storage and remains usable if saving fails', async () => {
    storage.getItem.mockResolvedValue('{not json');
    storage.setItem.mockRejectedValue(new Error('Storage unavailable'));

    const screen = await render(
      <PreferencesProvider><PreferencesProbe /></PreferencesProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('filters').props.children).toBe(''));
    await fireEvent.press(screen.getByText('Local filter'));

    await waitFor(() => {
      expect(screen.getByTestId('filters').props.children).toBe('local');
    });
  });
});
