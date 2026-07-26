import React from 'react';
import { PageHead } from '../layout/PageHead';
import { TelemetryConsole } from '../components/TelemetryConsole';
import { ArbOpportunity } from '../types';

interface TelemetryPageProps {
  opportunities: ArbOpportunity[];
  onClear: () => void;
}

export const TelemetryPage: React.FC<TelemetryPageProps> = ({
  opportunities,
  onClear,
}) => {
  return (
    <>
      <PageHead
        title="Telemetry"
        subtitle="Raw WebSocket packet log"
      />
      <TelemetryConsole opportunities={opportunities} onClear={onClear} />
    </>
  );
};
