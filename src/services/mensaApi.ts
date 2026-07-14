import { apiGet } from './apiClient';
import { loadCached } from './cache';
import {
  ApiBusinessHour,
  ApiCanteen,
  ApiMeal,
  ApiMenue,
  Canteen,
  Meal,
  MenueSection,
} from '../types/api';

const CANTEEN_CACHE_TTL = 15 * 60 * 1000;
const MENUE_CACHE_TTL = 30 * 60 * 1000;
const DAY_NAMES = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

function requireId(value: { id?: string; ID?: string }, label: string): string {
  const id = value.id ?? value.ID;
  if (!id) {
    throw new Error(`${label} enthält keine ID.`);
  }
  return id;
}

function toMinutes(time?: string): number | null {
  if (!time) return null;
  const [hours, minutes] = time.split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
}

function getCurrentBusinessHour(api: ApiCanteen): ApiBusinessHour | undefined {
  const currentDay = DAY_NAMES[new Date().getDay()];
  const day = api.businessDays?.find((item) => item.day === currentDay);
  const hours = day?.businessHours ?? day?.businesshours ?? [];
  return hours.find((item) => item.businessHourType === 'Mensa') ?? hours[0];
}

function mapCanteen(api: ApiCanteen): Canteen {
  const businessHour = getCurrentBusinessHour(api);
  const openAt = toMinutes(businessHour?.openAt);
  const closeAt = toMinutes(businessHour?.closeAt);
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const geoLocation = api.address?.geoLocation ?? api.address?.geolocation;
  const addressParts = [
    api.address?.street,
    [api.address?.zipcode, api.address?.city].filter(Boolean).join(' '),
  ].filter(Boolean);

  return {
    id: requireId(api, 'Mensa'),
    name: api.name,
    address: addressParts.length > 0 ? addressParts.join(', ') : undefined,
    isOpen:
      openAt !== null && closeAt !== null
        ? currentMinutes >= openAt && currentMinutes <= closeAt
        : false,
    openingHours:
      businessHour?.openAt && businessHour.closeAt
        ? `${businessHour.openAt} – ${businessHour.closeAt} Uhr`
        : undefined,
    latitude: geoLocation?.latitude,
    longitude: geoLocation?.longitude,
  };
}

function mapBadgeName(name: string): string {
  const badgeNames: Record<string, string> = {
    CO2_bewertung_A: 'CO₂-arm',
    CO2_bewertung_B: 'CO₂-mittel',
    CO2_bewertung_C: 'CO₂-intensiv',
    H2O_bewertung_A: 'Wasserarm',
    H2O_bewertung_B: 'Wasserverbrauch mittel',
    H2O_bewertung_C: 'Wasserintensiv',
    'Grüner Ampelpunkt': 'Gute Wahl',
    'Gelber Ampelpunkt': 'Gelegentlich',
    'Roter Ampelpunkt': 'Selten wählen',
  };
  return badgeNames[name] ?? name;
}

function selectStudentPrice(api: ApiMeal): number {
  const studentPrice = api.prices?.find((item) =>
    item.priceType.toLocaleLowerCase('de-DE').startsWith('stud'),
  );
  return studentPrice?.price ?? api.prices?.[0]?.price ?? 0;
}

function buildCriteria(api: ApiMeal, price: number): string[] {
  const criteria = new Set<string>();
  const badgeNames = (api.badges ?? []).map((badge) => badge.name.toLowerCase());
  const category = api.category?.toLowerCase() ?? '';

  if (badgeNames.includes('vegan')) {
    criteria.add('vegan');
    criteria.add('vegetarisch');
  } else if (badgeNames.includes('vegetarisch')) {
    criteria.add('vegetarisch');
  }
  if (price > 0 && price <= 3) criteria.add('preiswert');
  if (category.includes('salat')) {
    criteria.add('leicht');
    criteria.add('bunt');
  }
  if (!category.includes('salat') && !category.includes('dessert')) {
    criteria.add('warm');
  }

  return [...criteria];
}

function mapMeal(
  api: ApiMeal,
  canteenId: string,
  canteenName: string | undefined,
): Meal {
  const price = selectStudentPrice(api);
  const category = api.category ?? 'Speisen';

  return {
    id: requireId(api, 'Gericht'),
    name: api.name,
    price,
    prices: api.prices?.map((item) => ({
      type: item.priceType,
      value: item.price,
    })),
    category,
    canteenId,
    canteenName,
    menueName: category,
    badges: (api.badges ?? []).map((badge) => mapBadgeName(badge.name)),
    allergens: (api.additives ?? []).map((additive) => additive.text),
    criteria: buildCriteria(api, price),
    waterBalance: api.waterBilanz,
    co2Balance: api.co2Bilanz,
  };
}

function groupMenues(
  apiMenues: ApiMenue[],
  requestedCanteenId: string,
  canteenName?: string,
): MenueSection[] {
  const sections = new Map<string, Meal[]>();

  apiMenues.forEach((menue) => {
    const canteenId = menue.canteenId ?? menue.canteeenId ?? requestedCanteenId;
    (menue.meals ?? []).forEach((apiMeal) => {
      const meal = mapMeal(apiMeal, canteenId, canteenName);
      const category = meal.category ?? 'Speisen';
      sections.set(category, [...(sections.get(category) ?? []), meal]);
    });
  });

  return [...sections.entries()].map(([name, meals]) => ({
    id: `${requestedCanteenId}:${name}`,
    name,
    meals,
  }));
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function getCanteens(forceRefresh = false): Promise<Canteen[]> {
  return loadCached({
    key: 'canteens',
    ttlMs: CANTEEN_CACHE_TTL,
    forceRefresh,
    loader: async () => {
      const data = await apiGet<ApiCanteen[]>('/canteen', {
        loadingtype: 'lazy',
      });
      return data.map(mapCanteen).sort((a, b) => a.name.localeCompare(b.name, 'de'));
    },
  });
}

export async function getMenues(
  canteenId: string,
  date = formatLocalDate(new Date()),
  forceRefresh = false,
): Promise<MenueSection[]> {
  return loadCached({
    key: `menues:${canteenId}:${date}`,
    ttlMs: MENUE_CACHE_TTL,
    forceRefresh,
    loader: async () => {
      const data = await apiGet<ApiMenue[]>('/menue', {
        loadingtype: 'complete',
        canteenId,
        startdate: date,
        enddate: date,
      });
      const canteens = await getCanteens().catch(() => []);
      const canteenName = canteens.find((canteen) => canteen.id === canteenId)?.name;
      return groupMenues(data, canteenId, canteenName);
    },
  });
}

export async function getMeals(
  canteenId: string,
  date?: string,
  forceRefresh = false,
): Promise<Meal[]> {
  const sections = await getMenues(canteenId, date, forceRefresh);
  return sections.flatMap((section) => section.meals);
}
