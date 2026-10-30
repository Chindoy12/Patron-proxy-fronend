export interface CardDetails {
  holderName: string;
  cardNumber: string;
  expiry: string;
  securityCode: string;
}

export interface PaymentReceipt {
  reference: string;
  amount: number;
  last4: string;
}

export class PaymentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PaymentValidationError';
  }
}

export class PaymentSimulator {
  static readonly PRO_MONTHLY_PRICE_USD = 19;
  private static readonly PROCESSING_DELAY_MS = 1500;
  private static readonly EXPIRY_PATTERN = /^(0[1-9]|1[0-2])\/(\d{2})$/;
  private static readonly SECURITY_CODE_PATTERN = /^\d{3,4}$/;

  async charge(details: CardDetails): Promise<PaymentReceipt> {
    this.validate(details);
    await new Promise((resolve) => setTimeout(resolve, PaymentSimulator.PROCESSING_DELAY_MS));
    const digits = PaymentSimulator.digitsOf(details.cardNumber);
    return {
      reference: `SIM-${Date.now().toString(36).toUpperCase()}`,
      amount: PaymentSimulator.PRO_MONTHLY_PRICE_USD,
      last4: digits.slice(-4),
    };
  }

  private validate(details: CardDetails): void {
    if (details.holderName.trim().length < 3) {
      throw new PaymentValidationError('Ingresa el nombre del titular.');
    }
    if (!PaymentSimulator.passesLuhnCheck(PaymentSimulator.digitsOf(details.cardNumber))) {
      throw new PaymentValidationError('El número de tarjeta no es válido.');
    }
    if (!PaymentSimulator.isFutureExpiry(details.expiry)) {
      throw new PaymentValidationError('La fecha de vencimiento no es válida.');
    }
    if (!PaymentSimulator.SECURITY_CODE_PATTERN.test(details.securityCode)) {
      throw new PaymentValidationError('El código de seguridad no es válido.');
    }
  }

  private static digitsOf(value: string): string {
    return value.replace(/\D/g, '');
  }

  private static passesLuhnCheck(digits: string): boolean {
    if (digits.length < 13 || digits.length > 19) {
      return false;
    }
    const sum = [...digits].reverse().reduce((total, character, index) => {
      const digit = Number(character);
      if (index % 2 === 0) {
        return total + digit;
      }
      const doubled = digit * 2;
      return total + (doubled > 9 ? doubled - 9 : doubled);
    }, 0);
    return sum % 10 === 0;
  }

  private static isFutureExpiry(expiry: string): boolean {
    const match = PaymentSimulator.EXPIRY_PATTERN.exec(expiry);
    if (!match) {
      return false;
    }
    const lastDayOfMonth = new Date(2000 + Number(match[2]), Number(match[1]), 0, 23, 59, 59);
    return lastDayOfMonth.getTime() >= Date.now();
  }
}
