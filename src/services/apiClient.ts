const BASE_URL = 'https://mensa.gregorflachs.de/api/v1';

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function getApiKey(): string | undefined {
  return process.env.EXPO_PUBLIC_MENSA_API_KEY?.trim();
}

export function hasApiKey(): boolean {
  const key = getApiKey();
  return Boolean(
    key && !['api-key-hier', 'dein-api-key-hier'].includes(key.toLowerCase()),
  );
}

function getErrorMessage(status: number, body?: string): string {
  switch (status) {
    case 401:
      return 'API-Key fehlt. Bitte in der .env-Datei konfigurieren.';
    case 403:
      return 'Ungültiger API-Key.';
    case 404:
      return 'Die angeforderten Daten wurden nicht gefunden.';
    case 429:
      return 'Zu viele Anfragen. Bitte später erneut versuchen.';
    default:
      return body || 'Ein unbekannter Fehler ist aufgetreten.';
  }
}

export async function apiGet<T>(
  endpoint: string,
  params?: Record<string, string>,
): Promise<T> {
  const apiKey = getApiKey();

  if (!hasApiKey() || !apiKey) {
    throw new ApiError(
      'Kein Mensa-API-Key konfiguriert. Bitte EXPO_PUBLIC_MENSA_API_KEY in .env setzen.',
    );
  }

  const url = new URL(`${BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.append(key, value);
      }
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'X-API-KEY': apiKey,
        Accept: 'application/json',
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Die Mensa-API antwortet nicht. Bitte erneut versuchen.');
    }
    throw new ApiError('Netzwerkfehler. Bitte Internetverbindung prüfen.');
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const body = await response.text();
    throw new ApiError(getErrorMessage(response.status, body), response.status);
  }

  return response.json() as Promise<T>;
}
