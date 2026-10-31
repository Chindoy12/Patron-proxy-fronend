import type { PlanName } from '../api/types';

interface PlanBadgeProps {
  plan: PlanName;
}

export function PlanBadge({ plan }: PlanBadgeProps) {
  return (
    <span className={`plan-badge plan-badge--${plan.toLowerCase()}`} aria-label={`Plan actual ${plan}`}>
      <span className="plan-badge__dot" aria-hidden="true" />
      {plan}
    </span>
  );
}
