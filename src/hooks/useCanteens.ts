import { useCallback, useEffect, useRef, useState } from 'react';
import { getCanteens } from '../services/mensaApi';
import { Canteen } from '../types/api';

export function useCanteens() {
  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const loadCanteens = useCallback(async (forceRefresh = false) => {
    const activeRequest = ++requestId.current;
    setLoading(true);
    try {
      const data = await getCanteens(forceRefresh);
      if (activeRequest !== requestId.current) return;
      setCanteens(data);
      setError(null);
    } catch (loadError) {
      if (activeRequest !== requestId.current) return;
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Mensen konnten nicht geladen werden.',
      );
    } finally {
      if (activeRequest === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCanteens();
    return () => {
      requestId.current += 1;
    };
  }, [loadCanteens]);

  return { canteens, loading, error, reload: loadCanteens };
}
