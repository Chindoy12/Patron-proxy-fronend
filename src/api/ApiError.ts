const HTTP_PAYMENT_REQUIRED = 402;
const HTTP_TOO_MANY_REQUESTS = 429;
const NETWORK_FAILURE_STATUS = 0;

export class ApiError extends Error {
  readonly status: number;
  readonly retryAfterSeconds: number | null;

  constructor(status: number, message: string, retryAfterSeconds: number | null = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
  }

  static networkFailure(): ApiError {
    return new ApiError(NETWORK_FAILURE_STATUS, 'No fue posible conectar con el servidor. Intenta de nuevo.');
  }

  get isRateLimited(): boolean {
    return this.status === HTTP_TOO_MANY_REQUESTS;
  }

  get isQuotaExhausted(): boolean {
    return this.status === HTTP_PAYMENT_REQUIRED;
  }
}
