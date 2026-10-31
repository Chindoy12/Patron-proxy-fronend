import type { PlanName } from '../api/types';
import { Formatter } from '../domain/Formatter';
import { CalendarIcon, LayersIcon } from './icons';
import { PlanBadge } from './PlanBadge';

interface HeroProps {
  plan: PlanName | null;
}

export function Hero({ plan }: HeroProps) {
  const today = new Date();

  return (
    <header className="hero">
      <div className="hero__top">
        <span className="brand">
          <LayersIcon />
          QUOTA AI
        </span>
        {plan && <PlanBadge plan={plan} />}
      </div>
      <span className="date-pill">
        <CalendarIcon width={14} height={14} />
        {Formatter.fullDate(today)}
      </span>
      <h1 className="hero__title">
        {Formatter.greeting(today)},
        <span className="hero__accent"> crea sin límites.</span>
      </h1>
      <p className="hero__subtitle">Un panel. Cada prompt pasa por el proxy de rate limiting y luego por el de cuota.</p>
    </header>
  );
}
