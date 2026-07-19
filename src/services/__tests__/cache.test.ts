import AsyncStorage from '@react-native-async-storage/async-storage';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

import { loadCached } from '../cache';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: (() => {
    const { fn } = require('jest-mock');

    return {
      getItem: fn(),
      setItem: fn(),
    };
  })(),
}));

const storage = jest.mocked(AsyncStorage);

const now = new Date('2026-07-19T10:00:00.000Z').getTime();
const oneSecond = 1_000;
const sevenDays = 7 * 24 * 60 * 60 * 1_000;

function cached(data: unknown, storedAt: number): string {
  return JSON.stringify({ data, storedAt });
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });

  return { promise, resolve };
}

function resolvingLoader(value: string) {
  return jest.fn<() => Promise<string>>().mockResolvedValue(value);
}

function rejectingLoader(error: Error) {
  return jest.fn<() => Promise<string>>().mockRejectedValue(error);
}

describe('loadCached', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(now);
    storage.getItem.mockReset();
    storage.setItem.mockReset();
    storage.getItem.mockResolvedValue(null);
    storage.setItem.mockResolvedValue();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns a fresh cached value without calling the loader', async () => {
    storage.getItem.mockResolvedValueOnce(cached('from-cache', now - oneSecond));
    const loader = resolvingLoader('from-network');

    await expect(
      loadCached({ key: 'fresh-cache', ttlMs: oneSecond + 1, loader }),
    ).resolves.toBe('from-cache');

    expect(loader).not.toHaveBeenCalled();
  });

  it('loads a new value when the cached value has expired', async () => {
    storage.getItem.mockResolvedValueOnce(cached('old-value', now - oneSecond));
    const loader = resolvingLoader('from-network');

    await expect(
      loadCached({ key: 'expired-cache', ttlMs: oneSecond, loader }),
    ).resolves.toBe('from-network');

    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('uses an acceptably stale cache value when a refresh fails', async () => {
    storage.getItem.mockResolvedValueOnce(cached('stale-value', now - 2 * oneSecond));
    const loader = rejectingLoader(new Error('offline'));

    await expect(
      loadCached({ key: 'stale-fallback', ttlMs: oneSecond, loader }),
    ).resolves.toBe('stale-value');
  });

  it('throws a refresh failure when the cached value is older than maxStaleMs', async () => {
    storage.getItem.mockResolvedValueOnce(cached('too-old', now - sevenDays - oneSecond));
    const loader = rejectingLoader(new Error('offline'));

    await expect(
      loadCached({ key: 'expired-stale-cache', ttlMs: oneSecond, loader }),
    ).rejects.toThrow('offline');
  });

  it('does not return stale data when forceRefresh fails', async () => {
    storage.getItem.mockResolvedValueOnce(cached('cached-value', now - 2 * oneSecond));
    const loader = rejectingLoader(new Error('offline'));

    await expect(
      loadCached({ key: 'forced-refresh', ttlMs: oneSecond, loader, forceRefresh: true }),
    ).rejects.toThrow('offline');
  });

  it('coalesces parallel requests for the same key', async () => {
    const pending = deferred<string>();
    const loader = jest.fn<() => Promise<string>>().mockReturnValue(pending.promise);

    const first = loadCached({ key: 'coalesced-request', ttlMs: oneSecond, loader });
    const second = loadCached({ key: 'coalesced-request', ttlMs: oneSecond, loader });
    await jest.advanceTimersByTimeAsync(0);

    expect(loader).toHaveBeenCalledTimes(1);
    pending.resolve('from-network');

    await expect(Promise.all([first, second])).resolves.toEqual([
      'from-network',
      'from-network',
    ]);
  });

  it('treats corrupt persisted data as a cache miss', async () => {
    storage.getItem.mockResolvedValueOnce('{not valid JSON');
    const loader = resolvingLoader('from-network');

    await expect(
      loadCached({ key: 'corrupt-cache', ttlMs: oneSecond, loader }),
    ).resolves.toBe('from-network');

    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('keeps a successful network value usable when persistence fails', async () => {
    storage.setItem.mockRejectedValueOnce(new Error('storage is full'));
    const firstLoader = resolvingLoader('from-network');

    await expect(
      loadCached({ key: 'write-failure', ttlMs: oneSecond, loader: firstLoader }),
    ).resolves.toBe('from-network');

    const secondLoader = resolvingLoader('unexpected');
    await expect(
      loadCached({ key: 'write-failure', ttlMs: oneSecond, loader: secondLoader }),
    ).resolves.toBe('from-network');
    expect(secondLoader).not.toHaveBeenCalled();
  });
});
