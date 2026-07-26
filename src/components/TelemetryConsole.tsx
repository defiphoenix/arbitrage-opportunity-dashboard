import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Copy, Check, Trash2, Pause, Play, ChevronDown, ChevronUp } from 'lucide-react';
import { ArbOpportunity } from '../types';

interface TelemetryConsoleProps {
  opportunities: ArbOpportunity[];
  onClear: () => void;
}

export const TelemetryConsole: React.FC<TelemetryConsoleProps> = ({
  opportunities,
  onClear,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [filterText, setFilterText] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [opportunities, autoScroll]);

  const handleCopy = (index: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const filtered = opportunities.filter((o) => {
    if (!filterText.trim()) return true;
    const q = filterText.toLowerCase();
    return (
      o.tokenSymbol?.toLowerCase().includes(q) ||
      o.sourceMint.toLowerCase().includes(q) ||
      o.strategy.toLowerCase().includes(q) ||
      o.trigger?.signature.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-[#0F0F11] border border-gray-800 shadow-2xl overflow-hidden my-4 font-mono">
      
      {/* Console Header */}
      <div className="p-2.5 bg-[#141416] border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-green-400" />
          <h3 className="text-xs font-bold text-white tracking-widest uppercase">
            RAW_WEBSOCKET_PACKET_TELEMETRY
          </h3>
          <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
        </div>

        <div className="flex items-center gap-2 text-[10px]">
          <input
            type="text"
            placeholder="FILTER_RAW_LOGS..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="px-2 py-0.5 bg-[#0A0A0B] border border-gray-800 rounded text-[10px] text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 font-mono"
          />

          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-2 py-0.5 text-[10px] font-bold rounded flex items-center gap-1 border transition-colors ${
              autoScroll
                ? 'bg-[#0A0A0B] text-gray-300 border-gray-800'
                : 'bg-amber-950/60 text-amber-300 border-amber-800/80'
            }`}
          >
            {autoScroll ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{autoScroll ? 'LOCK_TOP' : 'PAUSED'}</span>
          </button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 text-gray-400 hover:text-white rounded hover:bg-gray-800 transition-colors"
          >
            {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Console Log Area */}
      {!collapsed && (
        <div
          ref={scrollRef}
          className="p-3 max-h-64 overflow-y-auto text-[10px] leading-relaxed space-y-1.5 bg-[#0A0A0B] scrollbar-thin scrollbar-thumb-gray-800"
        >
          {filtered.length === 0 ? (
            <div className="text-gray-600 py-4 text-center font-mono">
              Awaiting websocket packet payload frames...
            </div>
          ) : (
            filtered.map((opp, idx) => (
              <div
                key={`${opp.id}-${idx}`}
                className="p-2 rounded bg-[#0F0F11] border border-gray-900 hover:border-gray-800 transition-colors flex items-start justify-between gap-3 group font-mono"
              >
                <div className="space-y-0.5 overflow-hidden">
                  <div className="flex items-center gap-2 text-gray-400">
                    <span className="text-gray-600">[{new Date(opp.timestamp).toISOString()}]</span>
                    <span className="text-purple-400 font-bold">OPPORTUNITY_DETECTED</span>
                    <span className="text-green-400 font-bold">${opp.tokenSymbol}</span>
                    <span className="text-gray-300">{opp.strategy}</span>
                  </div>
                  <div className="text-gray-300 truncate">
                    <span className="text-gray-600">ROUTE:</span>{' '}
                    {opp.hops && opp.hops.length > 0
                      ? opp.hops.map(h => h.dex).join(' → ')
                      : `${opp.dexIn} → ${opp.dexOut}`}{' '}|{' '}
                    <span className="text-gray-600">SIZE:</span> {opp.buyAmount} SOL |{' '}
                    <span className="text-gray-600">SPREAD:</span>{' '}
                    <span className={opp.spreadPct > 0 ? 'text-green-400' : 'text-rose-400'}>
                      {opp.spreadPct}%
                    </span>{' '}
                    | <span className="text-gray-600">NET_PNL:</span>{' '}
                    <span className={opp.arbPnl > 0 ? 'text-green-400 font-bold' : 'text-rose-400'}>
                      {opp.arbPnl} SOL
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleCopy(idx, JSON.stringify(opp))}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-white bg-[#141416] rounded transition-all shrink-0 border border-gray-800"
                  title="COPY_JSON"
                >
                  {copiedIndex === idx ? (
                    <Check className="w-3 h-3 text-green-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
};
