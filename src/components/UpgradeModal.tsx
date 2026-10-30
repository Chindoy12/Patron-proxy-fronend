import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react';
import { ApiError } from '../api/ApiError';
import type { PlanName } from '../api/types';
import { Formatter } from '../domain/Formatter';
import {
  type CardDetails,
  type PaymentReceipt,
  PaymentSimulator,
  PaymentValidationError,
} from '../domain/PaymentSimulator';

interface UpgradeModalProps {
  currentPlan: PlanName;
  resetDate: string;
  onClose: () => void;
  onUpgrade: () => Promise<void>;
}

type Step = 'form' | 'processing' | 'success';

const paymentSimulator = new PaymentSimulator();

const TEST_CARD: CardDetails = {
  holderName: 'Usuario de Prueba',
  cardNumber: '4242 4242 4242 4242',
  expiry: '12/30',
  securityCode: '123',
};

const PLAN_COMPARISON = [
  { label: 'Requests por minuto', free: '10', pro: '60' },
  { label: 'Tokens por mes', free: '50.000', pro: '500.000' },
];

function formatCardNumber(value: string): string {
  return value.replace(/\D/g, '').slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

function describeError(caught: unknown): string {
  if (caught instanceof PaymentValidationError || caught instanceof ApiError) {
    return caught.message;
  }
  return 'No fue posible completar el upgrade.';
}

export function UpgradeModal({ currentPlan, resetDate, onClose, onUpgrade }: UpgradeModalProps) {
  const [card, setCard] = useState<CardDetails>(TEST_CARD);
  const [step, setStep] = useState<Step>('form');
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [canUpgrade] = useState(() => currentPlan === 'FREE');

  useEffect(() => {
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape' && step !== 'processing') {
        onClose();
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose, step]);

  const updateField = (field: keyof CardDetails, formatter: (value: string) => string = (value) => value) =>
    (event: ChangeEvent<HTMLInputElement>) => setCard((previous) => ({ ...previous, [field]: formatter(event.target.value) }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setStep('processing');
    try {
      const paymentReceipt = await paymentSimulator.charge(card);
      await onUpgrade();
      setReceipt(paymentReceipt);
      setStep('success');
    } catch (caught) {
      setError(describeError(caught));
      setStep('form');
    }
  };

  return (
    <div className="modal-backdrop" onClick={step === 'processing' ? undefined : onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="modal__close" onClick={onClose} disabled={step === 'processing'} aria-label="Cerrar">
          ×
        </button>

        {!canUpgrade && (
          <>
            <h2 id="upgrade-title" className="modal__title">Ya tienes el plan {currentPlan}</h2>
            <p className="modal__text">
              Tu cuota mensual se reinicia el <strong>{Formatter.longDate(resetDate)}</strong>. Hasta entonces no podrás generar
              nuevas respuestas.
            </p>
            <button type="button" className="button button--primary button--block" onClick={onClose}>Entendido</button>
          </>
        )}

        {canUpgrade && step === 'success' && receipt && (
          <div className="modal__success">
            <span className="modal__success-icon" aria-hidden="true">✓</span>
            <h2 id="upgrade-title" className="modal__title">¡Bienvenido a PRO!</h2>
            <p className="modal__text">
              Pago simulado de <strong>US${receipt.amount}</strong> con la tarjeta terminada en {receipt.last4}.
            </p>
            <p className="modal__reference">Referencia {receipt.reference}</p>
            <button type="button" className="button button--primary button--block" onClick={onClose}>Seguir generando</button>
          </div>
        )}

        {canUpgrade && step !== 'success' && (
          <form onSubmit={handleSubmit}>
            <h2 id="upgrade-title" className="modal__title">Mejora tu plan a PRO</h2>
            <p className="modal__text">Más requests por minuto y diez veces más tokens cada mes.</p>

            <table className="plan-table">
              <thead>
                <tr>
                  <th scope="col" />
                  <th scope="col">FREE</th>
                  <th scope="col" className="plan-table__highlight">PRO</th>
                </tr>
              </thead>
              <tbody>
                {PLAN_COMPARISON.map((row) => (
                  <tr key={row.label}>
                    <th scope="row">{row.label}</th>
                    <td>{row.free}</td>
                    <td className="plan-table__highlight">{row.pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="simulation-note">Modo simulación: no se realiza ningún cobro ni se envían datos de tarjeta.</div>

            <fieldset className="payment-form" disabled={step === 'processing'}>
              <label className="field field--full">
                <span>Titular</span>
                <input value={card.holderName} onChange={updateField('holderName')} autoComplete="off" />
              </label>
              <label className="field field--full">
                <span>Número de tarjeta</span>
                <input value={card.cardNumber} onChange={updateField('cardNumber', formatCardNumber)} inputMode="numeric" autoComplete="off" />
              </label>
              <label className="field">
                <span>Vencimiento</span>
                <input value={card.expiry} onChange={updateField('expiry', formatExpiry)} placeholder="MM/AA" inputMode="numeric" autoComplete="off" />
              </label>
              <label className="field">
                <span>CVC</span>
                <input
                  value={card.securityCode}
                  onChange={updateField('securityCode', (value) => value.replace(/\D/g, '').slice(0, 4))}
                  inputMode="numeric"
                  autoComplete="off"
                />
              </label>
            </fieldset>

            {error && <p className="form-error" role="alert">{error}</p>}

            <button type="submit" className="button button--primary button--block" disabled={step === 'processing'}>
              {step === 'processing' ? 'Procesando pago…' : `Pagar US$${PaymentSimulator.PRO_MONTHLY_PRICE_USD}/mes`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
