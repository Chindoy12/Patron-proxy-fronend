import { type ReactNode, useEffect, useRef } from 'react';
import type { ChatMessage } from '../domain/ChatMessage';
import { SparkIcon } from './icons';
import { MessageBubble } from './MessageBubble';

interface ChatPanelProps {
  messages: ChatMessage[];
  isSending: boolean;
  composer: ReactNode;
}

const PROXY_CHAIN = ['RateLimit', 'Quota', 'IA'];

export function ChatPanel({ messages, isSending, composer }: ChatPanelProps) {
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = messagesRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  }, [messages.length, isSending]);

  return (
    <section id="chat" className="chat" aria-label="Conversación con el servicio de IA">
      <header className="chat__header">
        <span className="soft-icon soft-icon--accent">
          <SparkIcon />
        </span>
        <div>
          <p className="eyebrow">Asistente de IA</p>
          <h2 className="card__title">Conversación</h2>
        </div>
        <ol className="chain" aria-label="Cadena de proxies">
          {PROXY_CHAIN.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </header>

      <div ref={messagesRef} className="chat__messages" aria-live="polite">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isSending && (
          <div className="bubble bubble--assistant bubble--typing" aria-label="Generando respuesta">
            <span />
            <span />
            <span />
          </div>
        )}
      </div>
      {composer}
    </section>
  );
}
