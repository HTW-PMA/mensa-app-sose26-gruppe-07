import { useCallback, useEffect, useState } from 'react';
import { getCanteens } from '../services/mensaApi';
import { useAppState } from '../context/AppContext';
import { Canteen } from '../types/api';

export function useCanteens() {
  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [loading, setLoading] = useState(true);
  const { setApiError } = useAppState();

  const loadCanteens = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCanteens();
      setCanteens(data);
      setApiError(null);
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : 'Mensen konnten nicht geladen werden.',
      );
    } finally {
      setLoading(false);
    }
  }, [setApiError]);

  useEffect(() => {
    loadCanteens();
  }, [loadCanteens]);

  return { canteens, loading, reload: loadCanteens };
}
