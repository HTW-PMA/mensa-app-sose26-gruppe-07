import { Platform } from 'react-native';

const DEFAULT_BACKEND_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';

export function getBackendUrl(): string {
  return (
    process.env.EXPO_PUBLIC_APP_API_URL?.trim().replace(/\/$/, '') ||
    DEFAULT_BACKEND_URL
  );
}
