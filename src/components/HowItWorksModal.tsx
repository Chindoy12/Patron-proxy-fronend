import { useEffect } from 'react';

interface HowItWorksModalProps {
  onClose: () => void;
}

const STEPS = [
  { title: 'RateLimitProxyService', text: 'Verifica cuántos requests llevas en el minuto según tu plan. Si superas el límite responde 429 con Retry-After.' },
  { title: 'QuotaProxyService', text: 'Verifica tu cuota mensual de tokens y descuenta lo consumido. Si se agota responde 402 Payment Required.' },
  { title: 'MockAIGenerationService', text: 'El servicio real: simula la generación de texto durante 1,2 segundos y devuelve una respuesta predefinida.' },
];

export function HowItWorksModal({ onClose }: HowItWorksModalProps) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="how-title" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="modal__close" onClick={onClose} aria-label="Cerrar">×</button>
        <p className="eyebrow">Patrón Proxy</p>
        <h2 id="how-title" className="modal__title">¿Cómo viaja tu prompt?</h2>
        <ol className="steps">
          {STEPS.map((step, index) => (
            <li key={step.title} className="steps__item">
              <span className="steps__number">{index + 1}</span>
              <div>
                <p className="steps__title">{step.title}</p>
                <p className="steps__text">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <button type="button" className="button button--primary button--block" onClick={onClose}>Entendido</button>
      </div>
    </div>
  );
}
