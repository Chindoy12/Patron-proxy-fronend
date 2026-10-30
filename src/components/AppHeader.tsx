import type { PlanName } from '../api/types';
import { PlanBadge } from './PlanBadge';

interface AppHeaderProps {
  plan: PlanName | null;
}

export function AppHeader({ plan }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="app-header__brand">
        <span className="app-header__logo" aria-hidden="true">Q</span>
        <div>
          <h1 className="app-header__title">Quota AI</h1>
          <p className="app-header__subtitle">Plataforma de consumo de IA con proxy de rate limiting y cuotas</p>
        </div>
      </div>
      {plan && <PlanBadge plan={plan} />}
    </header>
  );
}
