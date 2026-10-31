import type { ComponentType, SVGProps } from 'react';
import { ChartIcon, ChatIcon, ClockIcon, CrownIcon, GaugeIcon, HelpIcon, LayersIcon } from './icons';

interface NavigationItem {
  target: string;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  { target: 'chat', label: 'Conversación', Icon: ChatIcon },
  { target: 'quota', label: 'Cuota mensual', Icon: GaugeIcon },
  { target: 'rate-limit', label: 'Requests por minuto', Icon: ClockIcon },
  { target: 'history', label: 'Uso semanal', Icon: ChartIcon },
  { target: 'plan', label: 'Plan', Icon: CrownIcon },
];

interface SidebarProps {
  onHelpClick: () => void;
}

export function Sidebar({ onHelpClick }: SidebarProps) {
  return (
    <nav className="rail" aria-label="Secciones">
      <span className="rail__logo" aria-hidden="true">
        <LayersIcon />
      </span>
      <ul className="rail__items">
        {NAVIGATION_ITEMS.map(({ target, label, Icon }, index) => (
          <li key={target}>
            <a href={`#${target}`} className={`rail__link ${index === 0 ? 'rail__link--active' : ''}`} title={label}>
              <Icon />
              <span className="visually-hidden">{label}</span>
            </a>
          </li>
        ))}
      </ul>
      <button type="button" className="rail__link rail__help" title="Cómo funciona" onClick={onHelpClick}>
        <HelpIcon />
        <span className="visually-hidden">Cómo funciona</span>
      </button>
    </nav>
  );
}
