import type { QuotaStatus } from '../api/types';
import { Formatter } from '../domain/Formatter';
import { Card } from './Card';

interface PlanLimitsCardProps {
  status: QuotaStatus;
}

const UNLIMITED_LABEL = 'Ilimitado';

export function PlanLimitsCard({ status }: PlanLimitsCardProps) {
  const limits = [
    { label: 'Requests por minuto', value: status.requestsPerMinute === null ? UNLIMITED_LABEL : Formatter.number(status.requestsPerMinute) },
    { label: 'Tokens por mes', value: status.tokensLimit === null ? UNLIMITED_LABEL : Formatter.number(status.tokensLimit) },
  ];

  return (
    <Card eyebrow={`Límites del plan ${status.plan}`}>
      <dl className="limits">
        {limits.map((limit) => (
          <div key={limit.label} className="limits__row">
            <dt>{limit.label}</dt>
            <dd>{limit.value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
