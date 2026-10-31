import type { QuotaStatus } from '../api/types';
import { Formatter } from '../domain/Formatter';
import { ChatIcon, PlayIcon, SendIcon } from './icons';

interface PlanCardProps {
  status: QuotaStatus;
  onUpgradeClick: () => void;
}

export function PlanCard({ status, onUpgradeClick }: PlanCardProps) {
  if (status.plan === 'FREE') {
    return (
      <button id="plan" type="button" className="callout" onClick={onUpgradeClick}>
        <span className="callout__icon">
          <PlayIcon />
        </span>
        <span className="callout__body">
          <span className="callout__title">Mejora a PRO</span>
          <span className="callout__text">60 requests/min y 500.000 tokens al mes</span>
        </span>
        <span className="callout__arrow">
          <SendIcon width={16} height={16} />
        </span>
      </button>
    );
  }

  return (
    <section id="plan" className="card">
      <div className="split">
        <div>
          <p className="split__title">Plan {status.plan} activo</p>
          <p className="split__caption">
            {status.unlimited ? 'Sin límites de uso' : `${Formatter.number(status.requestsPerMinute ?? 0)} requests por minuto`}
          </p>
        </div>
        <span className="soft-icon">
          <ChatIcon />
        </span>
      </div>
    </section>
  );
}
