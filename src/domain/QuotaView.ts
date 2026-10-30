import type { QuotaStatus } from '../api/types';

const WARNING_THRESHOLD = 0.8;

export type QuotaLevel = 'healthy' | 'warning' | 'exhausted' | 'unlimited';

export class QuotaView {
  private readonly status: QuotaStatus;

  constructor(status: QuotaStatus) {
    this.status = status;
  }

  get usageRatio(): number {
    if (this.status.unlimited || !this.status.tokensLimit) {
      return 0;
    }
    return Math.min(1, this.status.tokensUsed / this.status.tokensLimit);
  }

  get level(): QuotaLevel {
    if (this.status.unlimited) {
      return 'unlimited';
    }
    if (this.isExhausted) {
      return 'exhausted';
    }
    return this.usageRatio >= WARNING_THRESHOLD ? 'warning' : 'healthy';
  }

  get isExhausted(): boolean {
    return !this.status.unlimited && this.status.tokensRemaining === 0;
  }

  get canUpgrade(): boolean {
    return this.status.plan === 'FREE';
  }

  get isRequestLimitReached(): boolean {
    const limit = this.status.requestsPerMinute;
    return limit !== null && this.status.requestsUsedThisMinute >= limit;
  }

  canAfford(tokens: number): boolean {
    return this.status.unlimited || (this.status.tokensRemaining ?? 0) >= tokens;
  }
}
