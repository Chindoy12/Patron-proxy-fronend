import type { UsageHistory } from '../api/types';
import { Formatter } from '../domain/Formatter';
import { Card } from './Card';

interface UsageHistoryCardProps {
  history: UsageHistory;
}

const PERCENT = 100;
const MINIMUM_VISIBLE_HEIGHT = 3;

export function UsageHistoryCard({ history }: UsageHistoryCardProps) {
  const highestUsage = Math.max(1, ...history.days.map((day) => day.tokens));
  const lastIndex = history.days.length - 1;

  return (
    <Card
      id="history"
      eyebrow="Últimos 7 días"
      title="Uso semanal"
      className="card--wide"
      aside={
        <p className="history-total">
          <strong>{Formatter.compact(history.totalTokens)}</strong> tokens · {Formatter.number(history.totalRequests)} requests
        </p>
      }
    >
      <ol className="bar-chart" aria-label="Tokens consumidos por día">
        {history.days.map((day, index) => {
          const height = day.tokens === 0 ? 0 : Math.max(MINIMUM_VISIBLE_HEIGHT, (day.tokens / highestUsage) * PERCENT);
          const label = `${Formatter.dayMonth(day.date)}: ${Formatter.number(day.tokens)} tokens en ${day.requests} requests`;
          const isToday = index === lastIndex;
          return (
            <li key={day.date} className={`bar-chart__item ${isToday ? 'bar-chart__item--today' : ''}`} title={label}>
              <span className="bar-chart__value">{day.tokens > 0 ? Formatter.compact(day.tokens) : ''}</span>
              <span className="bar-chart__track">
                <span className="bar-chart__bar" style={{ height: `${height}%` }} />
              </span>
              <span className="bar-chart__label">{isToday ? 'Hoy' : Formatter.weekday(day.date)}</span>
              <span className="visually-hidden">{label}</span>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
