import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../api/ApiError';
import type { PlatformApiClient } from '../api/PlatformApiClient';
import { type ChatMessage, ChatMessageFactory } from '../domain/ChatMessage';

export interface ChatSessionHandlers {
  onRateLimited: (retryAfterSeconds: number) => void;
  onQuotaExhausted: () => void;
  onSettled: () => Promise<void>;
}

const WELCOME_MESSAGE =
  'Bienvenido. Escribe un prompt para el servicio de IA. Cada request pasa por el proxy de rate limiting y luego por el de cuota.';
const DEFAULT_RETRY_AFTER_SECONDS = 60;

function describeFailure(caught: unknown, handlers: ChatSessionHandlers): ChatMessage {
  if (!(caught instanceof ApiError)) {
    return ChatMessageFactory.notice('Ocurrió un error inesperado al generar la respuesta.', 'danger');
  }
  if (caught.isRateLimited) {
    const retryAfter = caught.retryAfterSeconds ?? DEFAULT_RETRY_AFTER_SECONDS;
    handlers.onRateLimited(retryAfter);
    return ChatMessageFactory.notice(
      `Alcanzaste el límite de requests por minuto (429). Podrás enviar de nuevo en ${retryAfter} s.`,
      'warning',
    );
  }
  if (caught.isQuotaExhausted) {
    handlers.onQuotaExhausted();
    return ChatMessageFactory.notice(
      'Tu cuota mensual de tokens se agotó (402). Mejora tu plan para seguir generando.',
      'danger',
    );
  }
  return ChatMessageFactory.notice(caught.message, 'danger');
}

export function useChatSession(client: PlatformApiClient, handlers: ChatSessionHandlers) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [ChatMessageFactory.notice(WELCOME_MESSAGE, 'info')]);
  const [isSending, setIsSending] = useState(false);
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  });

  const append = useCallback((message: ChatMessage) => {
    setMessages((previous) => [...previous, message]);
  }, []);

  const send = useCallback(
    async (prompt: string) => {
      const trimmedPrompt = prompt.trim();
      if (trimmedPrompt.length === 0) {
        return;
      }
      append(ChatMessageFactory.user(trimmedPrompt));
      setIsSending(true);
      try {
        const result = await client.generate(trimmedPrompt);
        append(ChatMessageFactory.assistant(result.text, result.totalTokens));
      } catch (caught) {
        append(describeFailure(caught, handlersRef.current));
      } finally {
        setIsSending(false);
        await handlersRef.current.onSettled();
      }
    },
    [client, append],
  );

  return { messages, isSending, send };
}
