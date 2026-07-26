import React from 'react';
import { PageHead } from '../layout/PageHead';
import { MetricsCards } from '../components/MetricsCards';
import { AnalyticsCharts } from '../components/AnalyticsCharts';
import { ArbOpportunity } from '../types';

interface OverviewPageProps {
  opportunities: ArbOpportunity[];
  solPriceUsd?: number;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  opportunities,
  solPriceUsd = 185,
}) => {
  return (
    <>
      <PageHead
        title="Overview"
        subtitle="Aggregated PnL metrics & spread analytics"
      />
      <MetricsCards opportunities={opportunities} solPriceUsd={solPriceUsd} />
      <AnalyticsCharts opportunities={opportunities} />
    </>
  );
};
