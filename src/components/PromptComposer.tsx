import { type FormEvent, type KeyboardEvent, useState } from 'react';
import { Formatter } from '../domain/Formatter';
import type { QuotaView } from '../domain/QuotaView';
import { TokenEstimator } from '../domain/TokenEstimator';
import { SendIcon } from './icons';

export type SendBlockReason = 'rate-limit' | 'quota';

interface PromptComposerProps {
  isSending: boolean;
  blockReason: SendBlockReason | null;
  secondsUntilReset: number;
  quota: QuotaView | null;
  onSend: (prompt: string) => void;
  onUpgradeClick: () => void;
}

const MAX_PROMPT_LENGTH = 4000;

export function PromptComposer({ isSending, blockReason, secondsUntilReset, quota, onSend, onUpgradeClick }: PromptComposerProps) {
  const [prompt, setPrompt] = useState('');
  const estimate = TokenEstimator.estimate(prompt);
  const hasPrompt = estimate.promptTokens > 0;
  const mayExceedQuota = hasPrompt && quota !== null && !quota.canAfford(estimate.totalTokens);
  const isDisabled = !hasPrompt || isSending || blockReason !== null;

  const submit = () => {
    if (isDisabled) {
      return;
    }
    onSend(prompt);
    setPrompt('');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <form className="composer" onSubmit={handleSubmit}>
      {blockReason === 'rate-limit' && (
        <div className="composer__banner composer__banner--warning" role="status">
          <span>
            Límite de requests por minuto alcanzado. Podrás enviar de nuevo en{' '}
            <strong>{Formatter.countdown(secondsUntilReset)}</strong>.
          </span>
        </div>
      )}
      {blockReason === 'quota' && (
        <div className="composer__banner composer__banner--danger" role="status">
          <span>Agotaste tu cuota mensual de tokens.</span>
          {quota?.canUpgrade && (
            <button type="button" className="button button--small button--primary" onClick={onUpgradeClick}>
              Mejorar plan
            </button>
          )}
        </div>
      )}

      <label className="visually-hidden" htmlFor="prompt-input">Prompt</label>
      <textarea
        id="prompt-input"
        className="composer__input"
        placeholder="Escribe tu prompt… (Enter para enviar, Shift + Enter para nueva línea)"
        value={prompt}
        maxLength={MAX_PROMPT_LENGTH}
        rows={3}
        onChange={(event) => setPrompt(event.target.value)}
        onKeyDown={handleKeyDown}
      />

      <div className="composer__footer">
        <div className={`estimator ${mayExceedQuota ? 'estimator--warning' : ''}`} aria-live="polite">
          <span className="estimator__label">Estimador</span>
          {hasPrompt ? (
            <span>
              ≈ <strong>{Formatter.number(estimate.totalTokens)}</strong> tokens
              <span className="estimator__detail">
                {' '}({Formatter.number(estimate.promptTokens)} prompt + ~{Formatter.number(estimate.completionTokens)} respuesta)
              </span>
              {mayExceedQuota && <span className="estimator__detail"> · podría superar tu cuota restante</span>}
            </span>
          ) : (
            <span className="estimator__detail">Escribe para ver cuántos tokens consumirá tu prompt</span>
          )}
        </div>
        <span className="composer__counter">{prompt.length}/{MAX_PROMPT_LENGTH}</span>
        <button type="submit" className="button button--primary" disabled={isDisabled}>
          {isSending ? 'Generando…' : blockReason === 'rate-limit' ? `Espera ${Formatter.countdown(secondsUntilReset)}` : 'Enviar'}
          {!isSending && blockReason === null && <SendIcon width={16} height={16} />}
        </button>
      </div>
    </form>
  );
}
