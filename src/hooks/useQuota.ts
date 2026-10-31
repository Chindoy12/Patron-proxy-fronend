import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../api/ApiError';
import type { PlatformApiClient } from '../api/PlatformApiClient';
import type { QuotaStatus, UsageHistory } from '../api/types';

const LOAD_ERROR_MESSAGE = 'No fue posible cargar el estado de tu cuota.';

export function useQuota(client: PlatformApiClient) {
  const [status, setStatus] = useState<QuotaStatus | null>(null);
  const [history, setHistory] = useState<UsageHistory | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setStatus(await client.getQuotaStatus());
      setHistory(await client.getUsageHistory());
      setError(null);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : LOAD_ERROR_MESSAGE);
    }
  }, [client]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { status, history, error, refresh };
}
