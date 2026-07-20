import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Button, Text } from 'react-native';
import { FavoritesProvider, useFavorites } from '../FavoritesContext';
import { Meal } from '../../types/api';

jest.mock('@react-native-async-storage/async-storage', () => {
  const { fn } = require('jest-mock');

  return {
    __esModule: true,
    default: { getItem: fn(), setItem: fn() },
  };
});

const storage = jest.mocked(AsyncStorage);
const validMeal: Meal = { id: 'meal-1', name: 'Kartoffelpfanne', price: 3.5 };

function FavoritesProbe() {
  const {
    favoriteCanteenIds,
    favoriteMeals,
    toggleCanteenFavorite,
    toggleMealFavorite,
  } = useFavorites();

  return (
    <>
      <Text testID="canteens">{favoriteCanteenIds.join(',')}</Text>
      <Text testID="meals">{favoriteMeals.map((meal) => meal.id).join(',')}</Text>
      <Button title="Local canteen" onPress={() => toggleCanteenFavorite('local')} />
      <Button title="Local meal" onPress={() => toggleMealFavorite(validMeal)} />
    </>
  );
}

describe('FavoritesProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    storage.getItem.mockResolvedValue(null);
    storage.setItem.mockResolvedValue(undefined);
  });

  it('restores only valid persisted favorite ids and meals after hydration', async () => {
    storage.getItem.mockResolvedValue(JSON.stringify({
      favoriteCanteenIds: ['mensa-west', 42, null],
      favoriteMeals: [validMeal, { id: 'missing-price', name: 'Unvollständig' }, null],
    }));

    const screen = await render(
      <FavoritesProvider><FavoritesProbe /></FavoritesProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('canteens').props.children).toBe('mensa-west');
      expect(screen.getByTestId('meals').props.children).toBe('meal-1');
    });
  });

  it('keeps local favorite changes made before delayed hydration', async () => {
    let resolveStorage!: (value: string | null) => void;
    storage.getItem.mockReturnValue(new Promise((resolve) => { resolveStorage = resolve; }));

    const screen = await render(
      <FavoritesProvider><FavoritesProbe /></FavoritesProvider>,
    );

    await fireEvent.press(screen.getByText('Local canteen'));
    await fireEvent.press(screen.getByText('Local meal'));

    resolveStorage(JSON.stringify({
      favoriteCanteenIds: ['stored'],
      favoriteMeals: [{ id: 'stored-meal', name: 'Stored', price: 4 }],
    }));

    await waitFor(() => {
      expect(screen.getByTestId('canteens').props.children).toBe('local');
      expect(screen.getByTestId('meals').props.children).toBe('meal-1');
    });

    await screen.unmount();
  });

  it('keeps the UI state usable when persisted data is corrupt or saving fails', async () => {
    storage.getItem.mockResolvedValue('{not json');
    storage.setItem.mockRejectedValue(new Error('Storage unavailable'));

    const screen = await render(
      <FavoritesProvider><FavoritesProbe /></FavoritesProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('canteens').props.children).toBe(''));
    await fireEvent.press(screen.getByText('Local canteen'));

    await waitFor(() => {
      expect(screen.getByTestId('canteens').props.children).toBe('local');
    });
  });
});
