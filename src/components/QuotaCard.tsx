import type { QuotaStatus } from '../api/types';
import { Formatter } from '../domain/Formatter';
import { QuotaView } from '../domain/QuotaView';
import { Card } from './Card';

interface QuotaCardProps {
  status: QuotaStatus;
  onUpgradeClick: () => void;
}

const PERCENT = 100;

export function QuotaCard({ status, onUpgradeClick }: QuotaCardProps) {
  const quota = new QuotaView(status);
  const percentage = Math.floor(quota.usageRatio * PERCENT);
  const tone = quota.level === 'exhausted' ? 'danger' : quota.level === 'warning' ? 'warning' : 'default';

  return (
    <Card title="Cuota mensual de tokens" tone={tone} aside={<span className="card__meta">{status.unlimited ? '∞' : `${percentage}%`}</span>}>
      <div
        className={`progress progress--${quota.level}`}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={PERCENT}
        aria-valuenow={status.unlimited ? PERCENT : percentage}
        aria-label="Tokens usados frente a disponibles"
      >
        <div className="progress__fill" style={{ width: status.unlimited ? '100%' : `${percentage}%` }} />
      </div>

      <dl className="stat-grid">
        <div>
          <dt>Usados</dt>
          <dd>{Formatter.number(status.tokensUsed)}</dd>
        </div>
        <div>
          <dt>Disponibles</dt>
          <dd>{status.tokensRemaining === null ? 'Ilimitados' : Formatter.number(status.tokensRemaining)}</dd>
        </div>
        <div>
          <dt>Límite</dt>
          <dd>{status.tokensLimit === null ? 'Sin límite' : Formatter.number(status.tokensLimit)}</dd>
        </div>
        <div>
          <dt>Reinicio</dt>
          <dd>{Formatter.longDate(status.resetDate)}</dd>
        </div>
      </dl>

      {quota.canUpgrade && (
        <button type="button" className="button button--ghost button--block" onClick={onUpgradeClick}>
          Mejorar a PRO
        </button>
      )}
    </Card>
  );
}
