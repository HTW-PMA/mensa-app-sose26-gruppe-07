import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, render, waitFor } from '@testing-library/react-native';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Text } from 'react-native';
import { AppStateProvider, useAppState } from '../AppContext';

jest.mock('@react-native-async-storage/async-storage', () => {
  const { fn } = require('jest-mock');

  return {
    __esModule: true,
    default: {
      getItem: fn(),
      setItem: fn(),
      removeItem: fn(),
    },
  };
});

const storage = jest.mocked(AsyncStorage);

function AppStateProbe() {
  const { hasHydrated, selectedCanteenId } = useAppState();

  return (
    <Text>{`${hasHydrated ? 'ready' : 'pending'}:${selectedCanteenId ?? 'none'}`}</Text>
  );
}

describe('AppStateProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    storage.getItem.mockResolvedValue(null);
    storage.setItem.mockResolvedValue(undefined);
    storage.removeItem.mockResolvedValue(undefined);
  });

  it('restores the persisted canteen before reporting hydration complete', async () => {
    let resolveStoredCanteen!: (value: string | null) => void;
    storage.getItem.mockReturnValue(
      new Promise<string | null>((resolve) => {
        resolveStoredCanteen = resolve;
      }),
    );

    const { getByText } = await render(
      <AppStateProvider>
        <AppStateProbe />
      </AppStateProvider>,
    );

    expect(getByText('pending:none')).toBeTruthy();

    await act(async () => {
      resolveStoredCanteen('mensa-adenauerring');
    });

    await waitFor(() => {
      expect(getByText('ready:mensa-adenauerring')).toBeTruthy();
    });
  });

  it('finishes hydration when reading persisted state fails', async () => {
    storage.getItem.mockRejectedValue(new Error('Storage is unavailable'));

    const { getByText } = await render(
      <AppStateProvider>
        <AppStateProbe />
      </AppStateProvider>,
    );

    await waitFor(() => {
      expect(getByText('ready:none')).toBeTruthy();
    });
  });
});
