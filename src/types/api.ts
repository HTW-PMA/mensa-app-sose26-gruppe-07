export interface Canteen {
  id: string;
  name: string;
  address?: string;
  distance?: string;
  isOpen?: boolean;
  openingHours?: string;
  imageUrl?: string;
}

export interface Badge {
  id: string;
  name: string;
  color?: string;
}

export interface Additive {
  id: string;
  name: string;
  type?: string;
}

export interface Meal {
  id: string;
  name: string;
  description?: string;
  price: number;
  canteenId?: string;
  canteenName?: string;
  menueName?: string;
  badges?: string[];
  allergens?: string[];
  imageUrl?: string;
  tags?: string[];
  criteria?: string[];
}

export interface MenueSection {
  id: string;
  name: string;
  meals: Meal[];
}

export interface ApiCanteen {
  id: string;
  name: string;
  address?: { street?: string; city?: string };
  openingHours?: Array<{ day?: string; open?: string; close?: string }>;
}

export interface ApiMeal {
  id: string;
  name: string;
  description?: string;
  price?: number;
  canteenId?: string;
  badges?: string[];
  additives?: string[];
}

export interface ApiMenue {
  id: string;
  name: string;
  meals?: string[];
  canteenId?: string;
}
