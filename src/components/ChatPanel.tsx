import { type ReactNode, useEffect, useRef } from 'react';
import type { ChatMessage } from '../domain/ChatMessage';
import { MessageBubble } from './MessageBubble';

interface ChatPanelProps {
  messages: ChatMessage[];
  isSending: boolean;
  composer: ReactNode;
}

export function ChatPanel({ messages, isSending, composer }: ChatPanelProps) {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, isSending]);

  return (
    <section className="chat" aria-label="Conversación con el servicio de IA">
      <div className="chat__messages" aria-live="polite">
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
        <div ref={endOfMessagesRef} />
      </div>
      {composer}
    </section>
  );
}
