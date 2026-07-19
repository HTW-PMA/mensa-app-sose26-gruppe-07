export interface Canteen {
  id: string;
  name: string;
  address?: string;
  distance?: string;
  isOpen?: boolean;
  openingHours?: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
}

export interface Badge {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

export interface Additive {
  id: string;
  name: string;
  referenceId?: string;
}

export interface MealPrice {
  type: string;
  value: number;
}

export interface Meal {
  id: string;
  name: string;
  description?: string;
  price: number;
  prices?: MealPrice[];
  category?: string;
  canteenId?: string;
  canteenName?: string;
  menueName?: string;
  badges?: string[];
  allergens?: string[];
  imageUrl?: string;
  tags?: string[];
  waterBalance?: number;
  co2Balance?: number;
}

export interface MenueSection {
  id: string;
  name: string;
  meals: Meal[];
}

export interface ApiGeoLocation {
  latitude?: number;
  longitude?: number;
}

export interface ApiBusinessHour {
  openAt?: string;
  closeAt?: string;
  businessHourType?: string;
}

export interface ApiBusinessDay {
  day?: string;
  businessHours?: ApiBusinessHour[];
  businesshours?: ApiBusinessHour[];
}

export interface ApiCanteen {
  id?: string;
  ID?: string;
  name: string;
  address?: {
    street?: string;
    city?: string;
    zipcode?: string;
    district?: string;
    geoLocation?: ApiGeoLocation;
    geolocation?: ApiGeoLocation;
  };
  businessDays?: ApiBusinessDay[];
  url?: string;
  lastUpdated?: string;
}

export interface ApiBadge {
  id?: string;
  ID?: string;
  name: string;
  description?: string;
}

export interface ApiAdditive {
  id?: string;
  ID?: string;
  text: string;
  referenceid?: string;
}

export interface ApiMealPrice {
  price: number;
  priceType: string;
}

export interface ApiMeal {
  id?: string;
  ID?: string;
  name: string;
  prices?: ApiMealPrice[];
  category?: string;
  additives?: ApiAdditive[];
  badges?: ApiBadge[];
  waterBilanz?: number;
  co2Bilanz?: number;
}

export interface ApiMenue {
  date: string;
  canteenId?: string;
  canteeenId?: string;
  meals?: ApiMeal[];
}
