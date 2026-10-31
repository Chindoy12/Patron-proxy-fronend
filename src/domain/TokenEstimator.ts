export interface TokenEstimate {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export class TokenEstimator {
  private static readonly CHARACTERS_PER_TOKEN = 4;
  private static readonly AVERAGE_COMPLETION_TOKENS = 70;

  static estimate(prompt: string): TokenEstimate {
    const promptTokens = TokenEstimator.countTokens(prompt);
    const completionTokens = promptTokens === 0 ? 0 : TokenEstimator.AVERAGE_COMPLETION_TOKENS;
    return { promptTokens, completionTokens, totalTokens: promptTokens + completionTokens };
  }

  private static countTokens(text: string): number {
    const length = text.trim().length;
    return length === 0 ? 0 : Math.ceil(length / TokenEstimator.CHARACTERS_PER_TOKEN);
  }
}
