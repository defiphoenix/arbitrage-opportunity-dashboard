import React, { useState } from 'react';
import { Play, Pause, Trash2, Download, Gauge } from 'lucide-react';
import { ConnectionStatus, ServerStatus, ArbOpportunity } from '../types';

interface TopbarProps {
  status: ConnectionStatus;
  latencyMs: number;
  serverStatus: ServerStatus;
  opportunities: ArbOpportunity[];
  onClear: () => void;
  onToggleSimulation: (enabled: boolean) => void;
  onSetSimulationSpeed: (intervalMs: number) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  status,
  latencyMs,
  serverStatus,
  opportunities,
  onClear,
  onToggleSimulation,
  onSetSimulationSpeed,
}) => {
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const exportToJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(opportunities, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `solana_arb_opportunities_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const isConnected = status === 'connected';

  return (
    <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#1E2128] bg-[#111318]/60 sticky top-0 z-40 backdrop-blur-sm">

      {/* Left: env + WS status */}
      <div className="flex items-center gap-2.5">
        {/* <div className="flex items-center gap-1.5 font-mono text-[11px] bg-[#15171D] border border-[#1E2128] px-2.5 py-[5px] rounded-[7px] text-[#9AA0AC]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22D67C] shadow-[0_0_6px_#22D67C]" />
          PUMPSWAP : METEORA
        </div> */}
       
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2.5">

        {/* Simulation toggle + speed */}
        <div className="flex items-center gap-1">
           <div className={`font-mono text-[11px] flex items-center gap-1.5 ${isConnected ? 'text-[#22D67C]' : 'text-[#F0465C] animate-pulse'}`}>
          &#9672; {isConnected ? `WS_OK · ${latencyMs}ms` : status.toUpperCase()}
        </div>
          {/* <button
            onClick={() => onToggleSimulation(!serverStatus.simulationEnabled)}
            className={`font-mono text-[11.5px] font-semibold px-3 py-[7px] rounded-[7px] border flex items-center gap-1.5 transition-colors ${
              serverStatus.simulationEnabled
                ? 'bg-[#12321F] text-[#22D67C] border-[#22D67C]/30'
                : 'bg-[#15171D] text-[#9AA0AC] border-[#1E2128] hover:text-[#E8EAED]'
            }`}
            title={serverStatus.simulationEnabled ? 'Pause simulation stream' : 'Start simulation stream'}
          >
            {serverStatus.simulationEnabled ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {serverStatus.simulationEnabled ? 'SIM_ON' : 'SIM_OFF'}
          </button> */}

          <div className="relative">
            {/* <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="font-mono text-[11.5px] font-semibold px-2.5 py-[7px] rounded-[7px] border border-[#1E2128] bg-[#15171D] text-[#9AA0AC] hover:text-[#E8EAED] flex items-center gap-1.5 transition-colors"
              title="Simulation frequency"
            >
              <Gauge className="w-3 h-3" />
              {(serverStatus.simulationIntervalMs / 1000).toFixed(1)}s
            </button> */}

            {showSpeedMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-[#15171D] border border-[#1E2128] rounded-[7px] shadow-xl p-1 z-50">
                <div className="px-2 py-1 uppercase tracking-widest text-[#5B616E] font-bold text-[10px] font-mono">
                  Freq interval
                </div>
                {[
                  { label: '0.3s (TURBO)', ms: 300 },
                  { label: '0.8s (FAST)', ms: 800 },
                  { label: '1.2s (NORMAL)', ms: 1200 },
                  { label: '2.5s (SLOW)', ms: 2500 },
                ].map((item) => (
                  <button
                    key={item.ms}
                    onClick={() => {
                      onSetSimulationSpeed(item.ms);
                      setShowSpeedMenu(false);
                    }}
                    className={`w-full text-left px-2 py-1 rounded font-mono text-[10.5px] transition-colors ${
                      serverStatus.simulationIntervalMs === item.ms
                        ? 'bg-[#9D6FFF]/15 text-[#9D6FFF] font-bold'
                        : 'text-[#9AA0AC] hover:bg-[#1E2128] hover:text-[#E8EAED]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Export & Clear */}
        <button
          onClick={exportToJson}
          disabled={opportunities.length === 0}
          className="p-[7px] rounded-[7px] border border-[#1E2128] bg-[#15171D] text-[#9AA0AC] hover:text-[#E8EAED] transition-colors disabled:opacity-30"
          title="Export buffer as JSON"
        >
          <Download className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onClear}
          disabled={opportunities.length === 0}
          className="p-[7px] rounded-[7px] border border-[#1E2128] bg-[#15171D] text-[#9AA0AC] hover:text-[#F0465C] hover:border-[#F0465C]/40 transition-colors disabled:opacity-30"
          title="Purge event buffer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

      </div>
    </div>
  );
};
