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
    <Card
      title="Requests por minuto"
      tone={isLimitReached ? 'warning' : 'default'}
      aside={isLimitReached ? <span className="pill pill--warning">Límite alcanzado</span> : undefined}
    >
      <div className="rate-limit">
        <p className="rate-limit__count">
          <strong>{status.requestsUsedThisMinute}</strong>
          <span>/ {limit === null ? '∞' : limit}</span>
        </p>
        <div className="rate-limit__timer" aria-live="polite">
          <span className="rate-limit__clock">{Formatter.countdown(secondsUntilReset)}</span>
          <span className="rate-limit__caption">para el reinicio</span>
        </div>
      </div>
      {limit !== null && (
        <div className={`progress progress--thin ${isLimitReached ? 'progress--warning' : 'progress--healthy'}`}>
          <div className="progress__fill" style={{ width: `${percentage}%` }} />
        </div>
      )}
    </Card>
  );
}
