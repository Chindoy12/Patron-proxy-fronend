import { useEffect, useState } from 'react';

const TICK_INTERVAL_MS = 250;
const MILLIS_PER_SECOND = 1000;

export function useCountdown(deadline: number | null): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (deadline === null) {
      return undefined;
    }
    setNow(Date.now());
    const intervalId = window.setInterval(() => setNow(Date.now()), TICK_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [deadline]);

  return deadline === null ? 0 : Math.max(0, Math.ceil((deadline - now) / MILLIS_PER_SECOND));
}
