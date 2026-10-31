import type { ChatMessage } from '../domain/ChatMessage';
import { Formatter } from '../domain/Formatter';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  if (message.role === 'notice') {
    return <div className={`notice notice--${message.tone ?? 'info'}`}>{message.content}</div>;
  }

  return (
    <article className={`bubble bubble--${message.role}`}>
      <p className="bubble__content">{message.content}</p>
      <footer className="bubble__meta">
        <span>{message.role === 'user' ? 'Tú' : 'Asistente IA'}</span>
        <span>{Formatter.time(message.createdAt)}</span>
        {message.tokens !== undefined && <span>{Formatter.number(message.tokens)} tokens</span>}
      </footer>
    </article>
  );
}
