import { ApiError } from './ApiError';
import type { GenerationResult, QuotaStatus, UsageHistory } from './types';

interface ErrorPayload {
  message?: string;
}

const DEFAULT_ERROR_MESSAGE = 'Ocurrió un error inesperado.';

export class PlatformApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
  }

  generate(prompt: string): Promise<GenerationResult> {
    return this.request<GenerationResult>('/ai/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
  }

  getQuotaStatus(): Promise<QuotaStatus> {
    return this.request<QuotaStatus>('/quota/status');
  }

  getUsageHistory(): Promise<UsageHistory> {
    return this.request<UsageHistory>('/quota/history');
  }

  upgradePlan(): Promise<QuotaStatus> {
    return this.request<QuotaStatus>('/quota/upgrade', { method: 'POST' });
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      });
    } catch {
      throw ApiError.networkFailure();
    }

    if (!response.ok) {
      throw await this.toApiError(response);
    }
    return (await response.json()) as T;
  }

  private async toApiError(response: Response): Promise<ApiError> {
    const payload = await response.json().catch((): ErrorPayload => ({}));
    const retryAfterHeader = response.headers.get('Retry-After');
    const retryAfterSeconds = retryAfterHeader === null ? null : Number.parseInt(retryAfterHeader, 10);
    return new ApiError(
      response.status,
      (payload as ErrorPayload).message ?? DEFAULT_ERROR_MESSAGE,
      Number.isNaN(retryAfterSeconds) ? null : retryAfterSeconds,
    );
  }
}
