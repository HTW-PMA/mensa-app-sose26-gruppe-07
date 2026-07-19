import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { apiGet } from '../apiClient';

describe('apiGet', () => {
  const originalBackendUrl = process.env.EXPO_PUBLIC_APP_API_URL;
  const originalMensaApiKey = process.env.EXPO_PUBLIC_MENSA_API_KEY;

  afterEach(() => {
    jest.restoreAllMocks();
    if (originalBackendUrl === undefined) {
      delete process.env.EXPO_PUBLIC_APP_API_URL;
    } else {
      process.env.EXPO_PUBLIC_APP_API_URL = originalBackendUrl;
    }
    if (originalMensaApiKey === undefined) {
      delete process.env.EXPO_PUBLIC_MENSA_API_KEY;
    } else {
      process.env.EXPO_PUBLIC_MENSA_API_KEY = originalMensaApiKey;
    }
  });

  it('uses the app backend without exposing a Mensa API key', async () => {
    process.env.EXPO_PUBLIC_APP_API_URL = 'https://mensabaer.example/';
    process.env.EXPO_PUBLIC_MENSA_API_KEY = 'must-not-leave-the-app';
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([{ id: 'canteen-1' }]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await apiGet('/canteen', { loadingtype: 'lazy' });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://mensabaer.example/api/canteen?loadingtype=lazy',
      expect.objectContaining({
        method: 'GET',
        headers: { Accept: 'application/json' },
      }),
    );
  });
});
