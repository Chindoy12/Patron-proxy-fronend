import type { QuotaStatus } from '../api/types';
import { Formatter } from '../domain/Formatter';
import { QuotaView } from '../domain/QuotaView';
import { Card } from './Card';

interface RateLimitCardProps {
  status: QuotaStatus;
  secondsUntilReset: number;
}

const PERCENT = 100;

export function RateLimitCard({ status, secondsUntilReset }: RateLimitCardProps) {
  const isLimitReached = new QuotaView(status).isRequestLimitReached;
  const limit = status.requestsPerMinute;
  const percentage = limit === null ? 0 : Math.min(PERCENT, Math.round((status.requestsUsedThisMinute / limit) * PERCENT));

  return (
    <Card id="rate-limit" eyebrow="Requests por minuto" tone={isLimitReached ? 'warning' : 'default'}>
      <div className="split">
        <div>
          <p className="split__title">{isLimitReached ? 'Límite alcanzado' : 'Ventana actual'}</p>
          <p className="split__caption" aria-live="polite">
            Reinicio en <span className="mono">{Formatter.countdown(secondsUntilReset)}</span>
          </p>
        </div>
        <p className="split__value">
          {status.requestsUsedThisMinute}
          <span>/{limit === null ? '∞' : limit}</span>
        </p>
      </div>
      {limit !== null && (
        <div className={`progress progress--thin ${isLimitReached ? 'progress--warning' : 'progress--healthy'}`}>
          <div className="progress__fill" style={{ width: `${percentage}%` }} />
        </div>
      )}
    </Card>
  );
}
