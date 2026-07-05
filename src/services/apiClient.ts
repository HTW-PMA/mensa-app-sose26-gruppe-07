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
  return process.env.EXPO_PUBLIC_MENSA_API_KEY;
}

export function hasApiKey(): boolean {
  const key = getApiKey();
  return Boolean(key && key !== 'dein-api-key-hier');
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

  if (!apiKey || apiKey === 'dein-api-key-hier') {
    throw new ApiError('Kein API-Key konfiguriert');
  }

  const url = new URL(`${BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.append(key, value);
      }
    });
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-API-KEY': apiKey,
        Accept: 'application/json',
      },
    });
  } catch {
    throw new ApiError('Netzwerkfehler. Bitte Internetverbindung prüfen.');
  }

  if (!response.ok) {
    const body = await response.text();
    throw new ApiError(getErrorMessage(response.status, body), response.status);
  }

  return response.json() as Promise<T>;
}
