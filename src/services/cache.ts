import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheEntry<T> {
  storedAt: number;
  data: T;
}

interface CachedLoadOptions<T> {
  key: string;
  ttlMs: number;
  loader: () => Promise<T>;
  forceRefresh?: boolean;
  maxStaleMs?: number;
}

const STORAGE_PREFIX = '@mensabaer/api-cache/v2/';
const memoryCache = new Map<string, CacheEntry<unknown>>();
const inFlightRequests = new Map<string, Promise<unknown>>();

async function readEntry<T>(key: string): Promise<CacheEntry<T> | null> {
  const memoryEntry = memoryCache.get(key) as CacheEntry<T> | undefined;
  if (memoryEntry) {
    return memoryEntry;
  }

  try {
    const serialized = await AsyncStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!serialized) {
      return null;
    }

    const entry = JSON.parse(serialized) as CacheEntry<T>;
    if (typeof entry.storedAt !== 'number' || entry.data === undefined) {
      return null;
    }

    memoryCache.set(key, entry);
    return entry;
  } catch {
    return null;
  }
}

async function writeEntry<T>(key: string, data: T): Promise<void> {
  const entry: CacheEntry<T> = { storedAt: Date.now(), data };
  memoryCache.set(key, entry);

  try {
    await AsyncStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(entry));
  } catch {
    // A successful network response remains usable even if persistence fails.
  }
}

export async function loadCached<T>({
  key,
  ttlMs,
  loader,
  forceRefresh = false,
  maxStaleMs = 7 * 24 * 60 * 60 * 1000,
}: CachedLoadOptions<T>): Promise<T> {
  const cachedEntry = await readEntry<T>(key);
  const isFresh = cachedEntry && Date.now() - cachedEntry.storedAt < ttlMs;

  if (isFresh && !forceRefresh) {
    return cachedEntry.data;
  }

  const existingRequest = inFlightRequests.get(key) as Promise<T> | undefined;
  if (existingRequest) {
    return existingRequest;
  }

  const request = loader()
    .then(async (data) => {
      await writeEntry(key, data);
      return data;
    })
    .catch((error: unknown) => {
      const isAcceptablyStale =
        cachedEntry && Date.now() - cachedEntry.storedAt < maxStaleMs;
      if (isAcceptablyStale && !forceRefresh) {
        return cachedEntry.data;
      }
      throw error;
    })
    .finally(() => {
      inFlightRequests.delete(key);
    });

  inFlightRequests.set(key, request);
  return request;
}
