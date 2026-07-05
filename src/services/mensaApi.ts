import { apiGet, hasApiKey } from './apiClient';
import {
  MOCK_ADDITIVES,
  MOCK_BADGES,
  MOCK_CANTEENS,
  MOCK_MEALS,
  MOCK_MENUE_SECTIONS,
} from './mockData';
import {
  Additive,
  ApiCanteen,
  ApiMeal,
  ApiMenue,
  Badge,
  Canteen,
  Meal,
  MenueSection,
} from '../types/api';

function mapCanteen(api: ApiCanteen, index: number): Canteen {
  const hours = api.openingHours?.[0];
  const openTime = hours?.open ?? '08:00';
  const closeTime = hours?.close ?? '14:30';

  return {
    id: api.id,
    name: api.name,
    address: api.address
      ? `${api.address.street ?? ''}, ${api.address.city ?? 'Berlin'}`.trim()
      : undefined,
    distance: `${(0.6 + index * 0.8).toFixed(1).replace('.', ',')} km`,
    isOpen: true,
    openingHours: `${openTime} – ${closeTime} Uhr`,
    imageUrl: `https://picsum.photos/seed/${api.id}/200/120`,
  };
}

function mapMeal(api: ApiMeal, canteenName?: string): Meal {
  return {
    id: api.id,
    name: api.name,
    description: api.description,
    price: api.price ?? 0,
    canteenId: api.canteenId,
    canteenName,
    badges: api.badges ?? [],
    allergens: api.additives ?? [],
    imageUrl: `https://picsum.photos/seed/${api.id}/120/120`,
    criteria: [],
  };
}

export async function getCanteens(): Promise<Canteen[]> {
  if (!hasApiKey()) {
    return MOCK_CANTEENS;
  }

  const data = await apiGet<ApiCanteen[]>('/canteen', { loadingtype: 'lazy' });
  return data.map(mapCanteen);
}

export async function getMeals(canteenId?: string): Promise<Meal[]> {
  if (!hasApiKey()) {
    if (canteenId) {
      return MOCK_MEALS.filter((meal) => meal.canteenId === canteenId);
    }
    return MOCK_MEALS;
  }

  const params: Record<string, string> = { loadingtype: 'lazy' };
  if (canteenId) {
    params.canteenid = canteenId;
  }

  const data = await apiGet<ApiMeal[]>('/meal', params);
  return data.map((meal) => mapMeal(meal));
}

export async function getMenues(
  canteenId: string,
  _date?: string,
): Promise<MenueSection[]> {
  if (!hasApiKey()) {
    return MOCK_MENUE_SECTIONS;
  }

  const params: Record<string, string> = {
    loadingtype: 'lazy',
    canteenid: canteenId,
  };

  const [menues, meals] = await Promise.all([
    apiGet<ApiMenue[]>('/menue', params),
    getMeals(canteenId),
  ]);

  const mealMap = new Map(meals.map((meal) => [meal.id, meal]));

  return menues.map((menue) => ({
    id: menue.id,
    name: menue.name,
    meals: (menue.meals ?? [])
      .map((mealId) => mealMap.get(mealId))
      .filter((meal): meal is Meal => Boolean(meal)),
  }));
}

export async function getBadges(): Promise<Badge[]> {
  if (!hasApiKey()) {
    return MOCK_BADGES;
  }

  return apiGet<Badge[]>('/badge');
}

export async function getAdditives(): Promise<Additive[]> {
  if (!hasApiKey()) {
    return MOCK_ADDITIVES;
  }

  return apiGet<Additive[]>('/additive');
}
