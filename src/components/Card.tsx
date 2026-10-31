import type { ReactNode } from 'react';

interface CardProps {
  id?: string;
  eyebrow: string;
  title?: string;
  aside?: ReactNode;
  tone?: 'default' | 'warning' | 'danger';
  className?: string;
  children: ReactNode;
}

export function Card({ id, eyebrow, title, aside, tone = 'default', className = '', children }: CardProps) {
  return (
    <section id={id} className={`card card--${tone} ${className}`}>
      <header className="card__header">
        <div>
          <p className="eyebrow">
            <span className="eyebrow__dot" aria-hidden="true" />
            {eyebrow}
          </p>
          {title && <h2 className="card__title">{title}</h2>}
        </div>
        {aside}
      </header>
      {children}
    </section>
  );
}
