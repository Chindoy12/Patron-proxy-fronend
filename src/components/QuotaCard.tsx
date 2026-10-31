import type { QuotaStatus } from '../api/types';
import { Formatter } from '../domain/Formatter';
import { QuotaView } from '../domain/QuotaView';
import { Card } from './Card';
import { CheckIcon } from './icons';

interface QuotaCardProps {
  status: QuotaStatus;
}

const PERCENT = 100;

export function QuotaCard({ status }: QuotaCardProps) {
  const quota = new QuotaView(status);
  const percentage = Math.floor(quota.usageRatio * PERCENT);
  const tone = quota.level === 'exhausted' ? 'danger' : quota.level === 'warning' ? 'warning' : 'default';

  return (
    <Card id="quota" eyebrow="Cuota mensual de tokens" tone={tone}>
      <p className="big-number">
        {status.unlimited ? '∞' : percentage}
        {!status.unlimited && <span className="big-number__unit">%</span>}
      </p>

      <div
        className={`progress progress--${quota.level}`}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={PERCENT}
        aria-valuenow={status.unlimited ? PERCENT : percentage}
        aria-label="Tokens usados frente a disponibles"
      >
        <div className="progress__fill" style={{ width: status.unlimited ? '100%' : `${Math.max(percentage, 1)}%` }} />
      </div>

      <ul className="meta-row">
        <li>
          <CheckIcon width={13} height={13} />
          {Formatter.number(status.tokensUsed)}
          {status.tokensLimit !== null && ` / ${Formatter.compact(status.tokensLimit)}`} usados
        </li>
        <li>{status.tokensRemaining === null ? 'Ilimitados' : `${Formatter.number(status.tokensRemaining)} disponibles`}</li>
        <li>Reinicia {Formatter.dayMonth(status.resetDate)}</li>
      </ul>
    </Card>
  );
}
