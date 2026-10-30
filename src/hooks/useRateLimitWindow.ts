import { useCallback, useEffect, useState } from 'react';
import type { QuotaStatus } from '../api/types';
import { useCountdown } from './useCountdown';

const MILLIS_PER_SECOND = 1000;

export function useRateLimitWindow(status: QuotaStatus | null, onWindowReset: () => Promise<void>) {
  const [deadline, setDeadline] = useState<number | null>(null);
  const secondsUntilReset = useCountdown(deadline);

  useEffect(() => {
    if (status) {
      setDeadline(Date.now() + status.rateLimitResetInSeconds * MILLIS_PER_SECOND);
    }
  }, [status]);

  useEffect(() => {
    if (deadline !== null && secondsUntilReset === 0) {
      void onWindowReset();
    }
  }, [deadline, secondsUntilReset, onWindowReset]);

  const applyRetryAfter = useCallback((seconds: number) => {
    setDeadline(Date.now() + seconds * MILLIS_PER_SECOND);
  }, []);

  return { secondsUntilReset, applyRetryAfter };
}
