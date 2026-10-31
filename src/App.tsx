import { useCallback, useMemo, useState } from 'react';
import { PlatformApiClient } from './api/PlatformApiClient';
import { ChatPanel } from './components/ChatPanel';
import { Hero } from './components/Hero';
import { HowItWorksModal } from './components/HowItWorksModal';
import { PlanCard } from './components/PlanCard';
import { PlanLimitsCard } from './components/PlanLimitsCard';
import { PromptComposer, type SendBlockReason } from './components/PromptComposer';
import { QuotaCard } from './components/QuotaCard';
import { RateLimitCard } from './components/RateLimitCard';
import { Sidebar } from './components/Sidebar';
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
  const [isHelpOpen, setHelpOpen] = useState(false);

  const openUpgrade = useCallback(() => setUpgradeOpen(true), []);
  const closeUpgrade = useCallback(() => setUpgradeOpen(false), []);
  const openHelp = useCallback(() => setHelpOpen(true), []);
  const closeHelp = useCallback(() => setHelpOpen(false), []);

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
    <div className="shell">
      <Sidebar onHelpClick={openHelp} />

      <div className="workspace">
        <Hero plan={status?.plan ?? null} />

        {error && (
          <div className="alert" role="alert">
            {error}
            <button type="button" className="button button--small button--ghost" onClick={() => void refresh()}>
              Reintentar
            </button>
          </div>
        )}

        <main className="dashboard">
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

          <aside className="dashboard__aside" aria-label="Estado de consumo">
            {status ? (
              <>
                <QuotaCard status={status} />
                <RateLimitCard status={status} secondsUntilReset={secondsUntilReset} />
                <PlanLimitsCard status={status} />
                <PlanCard status={status} onUpgradeClick={openUpgrade} />
              </>
            ) : (
              <div className="skeleton" aria-busy="true" />
            )}
          </aside>

          {history ? <UsageHistoryCard history={history} /> : <div className="skeleton skeleton--wide" aria-busy="true" />}
        </main>
      </div>

      {isUpgradeOpen && status && (
        <UpgradeModal currentPlan={status.plan} resetDate={status.resetDate} onClose={closeUpgrade} onUpgrade={upgradePlan} />
      )}
      {isHelpOpen && <HowItWorksModal onClose={closeHelp} />}
    </div>
  );
}
