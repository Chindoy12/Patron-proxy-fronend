import type { ReactNode } from 'react';

interface CardProps {
  title: string;
  aside?: ReactNode;
  tone?: 'default' | 'warning' | 'danger';
  children: ReactNode;
}

export function Card({ title, aside, tone = 'default', children }: CardProps) {
  return (
    <section className={`card card--${tone}`}>
      <header className="card__header">
        <h2 className="card__title">{title}</h2>
        {aside}
      </header>
      {children}
    </section>
  );
}
