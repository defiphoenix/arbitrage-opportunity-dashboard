import React, { useState, useEffect } from 'react';
import { useArbWebSocket } from './hooks/useArbWebSocket';
import { AppShell } from './layout/AppShell';
import { Sidebar } from './layout/Sidebar';
import { Topbar } from './layout/Topbar';
import { OverviewPage } from './pages/OverviewPage';
import { LiveFeedPage } from './pages/LiveFeedPage';
import { TelemetryPage } from './pages/TelemetryPage';
import { OpportunityDetailModal } from './components/OpportunityDetailModal';
import { WebSocketDocs } from './components/WebSocketDocs';
import { PayloadTester } from './components/PayloadTester';
import { ArbOpportunity, Page } from './types';

const HASH_TO_PAGE: Record<string, Page> = {
  '#/overview': 'overview',
  '#/feed': 'feed',
  '#/telemetry': 'telemetry',
};

const getPageFromHash = (): Page => HASH_TO_PAGE[window.location.hash] || 'overview';

export default function App() {
  const {
    status,
    latencyMs,
    opportunities,
    newOppIds,
    serverStatus,
    clearOpportunities,
    toggleSimulation,
    setSimulationSpeed,
    postOpportunity,
  } = useArbWebSocket();

  const [selectedOpportunity, setSelectedOpportunity] = useState<ArbOpportunity | null>(null);
  const [showDocs, setShowDocs] = useState(false);
  const [showTester, setShowTester] = useState(false);
  const [page, setPage] = useState<Page>(getPageFromHash);

  useEffect(() => {
    const onHashChange = () => setPage(getPageFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = (target: Page) => {
    window.location.hash = `#/${target}`;
  };

  return (
    <>
      <AppShell
        sidebar={
          <Sidebar
            currentPage={page}
            onNavigate={navigate}
            oppCount={opportunities.length}
            status={status}
            latencyMs={latencyMs}
            onOpenDocs={() => setShowDocs(true)}
            onOpenTester={() => setShowTester(true)}
          />
        }
        topbar={
          <Topbar
            status={status}
            latencyMs={latencyMs}
            serverStatus={serverStatus}
            opportunities={opportunities}
            onClear={clearOpportunities}
            onToggleSimulation={toggleSimulation}
            onSetSimulationSpeed={setSimulationSpeed}
          />
        }
      >
        {page === 'overview' && (
          <OverviewPage opportunities={opportunities} solPriceUsd={185} />
        )}
        {page === 'feed' && (
          <LiveFeedPage
            opportunities={opportunities}
            newOppIds={newOppIds}
            onSelectOpportunity={(opp) => setSelectedOpportunity(opp)}
            solPriceUsd={185}
          />
        )}
        {page === 'telemetry' && (
          <TelemetryPage opportunities={opportunities} onClear={clearOpportunities} />
        )}
      </AppShell>

      {/* Opportunity Detail Inspector Modal */}
      <OpportunityDetailModal
        opportunity={selectedOpportunity}
        onClose={() => setSelectedOpportunity(null)}
        solPriceUsd={185}
      />

      {/* Integration Documentation Modal */}
      <WebSocketDocs
        isOpen={showDocs}
        onClose={() => setShowDocs(false)}
      />

      {/* Inject Payload Tester Modal */}
      <PayloadTester
        isOpen={showTester}
        onClose={() => setShowTester(false)}
        onSubmitOpportunity={postOpportunity}
      />
    </>
  );
}
