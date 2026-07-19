import { Additive, Badge, Canteen, Meal, MenueSection } from '../types/api';

export const MOCK_CANTEENS: Canteen[] = [
  {
    id: 'canteen-1',
    name: 'HTW Treskowallee',
    distance: '0,6 km',
    isOpen: true,
    openingHours: '08:00 – 14:30 Uhr',
    imageUrl: 'https://picsum.photos/seed/htw/200/120',
  },
  {
    id: 'canteen-2',
    name: 'TU Hardenbergstraße',
    distance: '1,2 km',
    isOpen: true,
    openingHours: '10:00 – 15:00 Uhr',
    imageUrl: 'https://picsum.photos/seed/tu/200/120',
  },
  {
    id: 'canteen-3',
    name: 'HU Nord',
    distance: '2,4 km',
    isOpen: false,
    openingHours: '11:00 – 14:00 Uhr',
    imageUrl: 'https://picsum.photos/seed/hu/200/120',
  },
];

export const MOCK_MEALS: Meal[] = [
  {
    id: 'meal-1',
    name: 'Pasta Arrabbiata',
    description: 'mit Tomatensauce und Rucola',
    price: 3.2,
    canteenId: 'canteen-1',
    canteenName: 'HTW Treskowallee',
    menueName: 'Menü 1',
    badges: ['Vegan', 'Bio', 'CO2-arm'],
    allergens: ['Weizen', 'Sellerie'],
    imageUrl: 'https://picsum.photos/seed/pasta/120/120',
  },
  {
    id: 'meal-2',
    name: 'Kartoffel-Gemüse-Bowl',
    description: 'mit saisonalem Gemüse',
    price: 3.5,
    canteenId: 'canteen-1',
    canteenName: 'HTW Treskowallee',
    menueName: 'Menü 2',
    badges: ['Vegan', 'CO2-arm'],
    allergens: [],
    imageUrl: 'https://picsum.photos/seed/bowl/120/120',
  },
  {
    id: 'meal-3',
    name: 'Linsen-Kokos-Curry',
    description: 'mit Basmatireis',
    price: 3.8,
    canteenId: 'canteen-1',
    canteenName: 'HTW Treskowallee',
    menueName: 'Menü 2',
    badges: ['Vegan'],
    allergens: ['Senf'],
    imageUrl: 'https://picsum.photos/seed/curry/120/120',
  },
  {
    id: 'meal-4',
    name: 'Gemüsepfanne',
    description: 'mit Kräutern',
    price: 3.4,
    canteenId: 'canteen-1',
    canteenName: 'HTW Treskowallee',
    menueName: 'Menü 3',
    badges: ['Vegetarisch', 'Bio'],
    allergens: ['Sellerie'],
    imageUrl: 'https://picsum.photos/seed/gemuese/120/120',
  },
  {
    id: 'meal-5',
    name: 'Kartoffelsalat',
    description: 'hausgemacht',
    price: 1.2,
    canteenId: 'canteen-1',
    canteenName: 'HTW Treskowallee',
    menueName: 'Beilagen',
    badges: ['Vegetarisch'],
    allergens: ['Ei'],
    imageUrl: 'https://picsum.photos/seed/salat/80/80',
  },
];

export const MOCK_MENUE_SECTIONS: MenueSection[] = [
  {
    id: 'menue-1',
    name: 'Menü 1',
    meals: [MOCK_MEALS[0]],
  },
  {
    id: 'menue-2',
    name: 'Menü 2',
    meals: [MOCK_MEALS[1], MOCK_MEALS[2]],
  },
  {
    id: 'menue-3',
    name: 'Menü 3',
    meals: [MOCK_MEALS[3]],
  },
  {
    id: 'menue-sides',
    name: 'Beilagen',
    meals: [MOCK_MEALS[4]],
  },
];

export const MOCK_BADGES: Badge[] = [
  { id: 'badge-1', name: 'Vegan', color: '#D4E8C8' },
  { id: 'badge-2', name: 'Vegetarisch', color: '#D4E8C8' },
  { id: 'badge-3', name: 'Bio', color: '#F5E6B8' },
  { id: 'badge-4', name: 'CO2-arm', color: '#C8E0F0' },
];

export const MOCK_ADDITIVES: Additive[] = [
  { id: 'add-1', name: 'Weizen' },
  { id: 'add-2', name: 'Sellerie' },
  { id: 'add-3', name: 'Senf' },
  { id: 'add-4', name: 'Ei' },
];

export const KI_FILTER_OPTIONS = [
  { label: 'Warm', icon: 'flame-outline' as const },
  { label: 'Leicht', icon: 'leaf-outline' as const },
  { label: 'Vegetarisch', icon: 'leaf-outline' as const },
  { label: 'Deftig', icon: 'restaurant-outline' as const },
  { label: 'Vegan', icon: 'leaf-outline' as const },
  { label: 'Sättigend', icon: 'pizza-outline' as const },
  { label: 'Fleisch', icon: 'nutrition-outline' as const },
  { label: 'Bunt', icon: 'color-palette-outline' as const },
  { label: 'Preiswert', icon: 'cash-outline' as const },
];

export const CATEGORY_FILTERS = [
  { label: 'Alle', icon: undefined },
  { label: 'Vegane Gerichte', icon: 'leaf-outline' as const },
  { label: 'Vegetarische Gerichte', icon: 'leaf-outline' as const },
  { label: 'Fleischgerichte', icon: 'nutrition-outline' as const },
];

export const CRITERIA_MAP: Record<string, string> = {
  Warm: 'warm',
  Leicht: 'leicht',
  Vegetarisch: 'vegetarisch',
  Deftig: 'deftig',
  Vegan: 'vegan',
  Sättigend: 'saettigend',
  Fleisch: 'fleisch',
  Bunt: 'bunt',
  Preiswert: 'preiswert',
};
