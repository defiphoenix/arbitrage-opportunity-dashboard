import React from 'react';
import { PageHead } from '../layout/PageHead';
import { OpportunityGrid } from '../components/OpportunityGrid';
import { ArbOpportunity } from '../types';

interface LiveFeedPageProps {
  opportunities: ArbOpportunity[];
  newOppIds: Set<string>;
  onSelectOpportunity: (opp: ArbOpportunity) => void;
  solPriceUsd?: number;
}

export const LiveFeedPage: React.FC<LiveFeedPageProps> = ({
  opportunities,
  newOppIds,
  onSelectOpportunity,
  solPriceUsd = 185,
}) => {
  return (
    <>
      <PageHead
        title="Live feed"
        subtitle="Realtime DEX arbitrage execution stream"
      />
      <OpportunityGrid
        opportunities={opportunities}
        newOppIds={newOppIds}
        onSelectOpportunity={onSelectOpportunity}
        solPriceUsd={solPriceUsd}
      />
    </>
  );
};
