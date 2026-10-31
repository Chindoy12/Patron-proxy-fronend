export type PlanName = 'FREE' | 'PRO' | 'ENTERPRISE';

export interface QuotaStatus {
  plan: PlanName;
  tokensUsed: number;
  tokensRemaining: number | null;
  tokensLimit: number | null;
  unlimited: boolean;
  resetDate: string;
  requestsPerMinute: number | null;
  requestsUsedThisMinute: number;
  rateLimitResetInSeconds: number;
}

export interface DailyUsage {
  date: string;
  tokens: number;
  requests: number;
}

export interface UsageHistory {
  days: DailyUsage[];
  totalTokens: number;
  totalRequests: number;
}

export interface GenerationResult {
  text: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}
