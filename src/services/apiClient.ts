import { getBackendUrl } from './backendUrl';

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function getErrorMessage(status: number, body?: string): string {
  switch (status) {
    case 401:
      return 'Der App-Dienst ist nicht für die Mensa-API konfiguriert.';
    case 403:
      return 'Der Zugriff auf die Mensa-API wurde abgelehnt.';
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
  const url = new URL(`${getBackendUrl()}/api${endpoint}`);
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
