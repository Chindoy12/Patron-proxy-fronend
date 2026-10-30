import { useCallback, useMemo, useState } from 'react';
import { PlatformApiClient } from './api/PlatformApiClient';
import { AppHeader } from './components/AppHeader';
import { ChatPanel } from './components/ChatPanel';
import { PromptComposer, type SendBlockReason } from './components/PromptComposer';
import { QuotaCard } from './components/QuotaCard';
import { RateLimitCard } from './components/RateLimitCard';
import { UpgradeModal } from './components/UpgradeModal';
import { UsageHistoryCard } from './components/UsageHistoryCard';
import { QuotaView } from './domain/QuotaView';
import { useChatSession } from './hooks/useChatSession';
import { useQuota } from './hooks/useQuota';
import { useRateLimitWindow } from './hooks/useRateLimitWindow';

const apiClient = new PlatformApiClient();

export function App() {
  const { status, history, error, refresh } = useQuota(apiClient);
  const { secondsUntilReset, applyRetryAfter } = useRateLimitWindow(status, refresh);
  const [isUpgradeOpen, setUpgradeOpen] = useState(false);

  const openUpgrade = useCallback(() => setUpgradeOpen(true), []);
  const closeUpgrade = useCallback(() => setUpgradeOpen(false), []);

  const { messages, isSending, send } = useChatSession(apiClient, {
    onRateLimited: applyRetryAfter,
    onQuotaExhausted: openUpgrade,
    onSettled: refresh,
  });

  const quota = useMemo(() => (status ? new QuotaView(status) : null), [status]);

  const blockReason: SendBlockReason | null = useMemo(() => {
    if (quota?.isExhausted) {
      return 'quota';
    }
    if (quota?.isRequestLimitReached && secondsUntilReset > 0) {
      return 'rate-limit';
    }
    return null;
  }, [quota, secondsUntilReset]);

  const upgradePlan = useCallback(async () => {
    await apiClient.upgradePlan();
    await refresh();
  }, [refresh]);

  return (
    <div className="app">
      <AppHeader plan={status?.plan ?? null} />

      {error && (
        <div className="alert" role="alert">
          {error}
          <button type="button" className="button button--small button--ghost" onClick={() => void refresh()}>
            Reintentar
          </button>
        </div>
      )}

      <main className="layout">
        <ChatPanel
          messages={messages}
          isSending={isSending}
          composer={
            <PromptComposer
              isSending={isSending}
              blockReason={blockReason}
              secondsUntilReset={secondsUntilReset}
              quota={quota}
              onSend={(prompt) => void send(prompt)}
              onUpgradeClick={openUpgrade}
            />
          }
        />

        <aside className="sidebar" aria-label="Estado de consumo">
          {status ? (
            <>
              <QuotaCard status={status} onUpgradeClick={openUpgrade} />
              <RateLimitCard status={status} secondsUntilReset={secondsUntilReset} />
            </>
          ) : (
            <div className="skeleton" aria-busy="true" />
          )}
          {history ? <UsageHistoryCard history={history} /> : <div className="skeleton skeleton--tall" aria-busy="true" />}
        </aside>
      </main>

      {isUpgradeOpen && status && (
        <UpgradeModal currentPlan={status.plan} resetDate={status.resetDate} onClose={closeUpgrade} onUpgrade={upgradePlan} />
      )}
    </div>
  );
}
