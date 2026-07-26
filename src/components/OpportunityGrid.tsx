import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ExternalLink,
  Eye,
  Play, 
  Pause, 
  Sparkles, 
  ArrowRight, 
  Info 
} from 'lucide-react';
import { ArbOpportunity, FilterState } from '../types';
import { formatSol, formatUsd, formatPct, truncateAddress, formatTime } from '../utils/formatters';

interface OpportunityGridProps {
  opportunities: ArbOpportunity[];
  newOppIds: Set<string>;
  onSelectOpportunity: (opp: ArbOpportunity) => void;
  solPriceUsd?: number;
}

export const OpportunityGrid: React.FC<OpportunityGridProps> = ({
  opportunities,
  newOppIds,
  onSelectOpportunity,
  solPriceUsd = 185,
}) => {
  const [filter, setFilter] = useState<FilterState>({
    searchQuery: '',
    strategy: 'all',
    minPnlSol: '',
    minSpreadPct: '',
    onlyProfitable: false,
    sortBy: 'timestamp',
    sortOrder: 'desc',
  });

  const [autoScroll, setAutoScroll] = useState(true);

  // Get unique strategies for dropdown
  const uniqueStrategies = useMemo(() => {
    const set = new Set<string>();
    opportunities.forEach((o) => {
      if (o.strategy) set.add(o.strategy);
    });
    return Array.from(set);
  }, [opportunities]);

  // Filter & Sort logic
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opp) => {
      // Search
      if (filter.searchQuery.trim()) {
        const q = filter.searchQuery.toLowerCase().trim();
        const matchesSymbol = opp.tokenSymbol?.toLowerCase().includes(q);
        const matchesMint = opp.sourceMint.toLowerCase().includes(q);
        const matchesSig = opp.trigger?.signature.toLowerCase().includes(q);
        const matchesStrategy = opp.strategy.toLowerCase().includes(q);
        const matchesDex = (opp.dexIn?.toLowerCase().includes(q) || opp.dexOut?.toLowerCase().includes(q))
          || opp.hops?.some(h => h.dex.toLowerCase().includes(q))
          || opp.intermediateSymbol?.toLowerCase().includes(q);

        if (!matchesSymbol && !matchesMint && !matchesSig && !matchesStrategy && !matchesDex) {
          return false;
        }
      }

      // Strategy
      if (filter.strategy !== 'all' && opp.strategy !== filter.strategy) {
        return false;
      }

      // Only profitable
      if (filter.onlyProfitable && (opp.arbPnl || 0) <= 0) {
        return false;
      }

      // Min PnL
      if (filter.minPnlSol !== '' && (opp.arbPnl || 0) < Number(filter.minPnlSol)) {
        return false;
      }

      // Min Spread
      if (filter.minSpreadPct !== '' && (opp.spreadPct || 0) < Number(filter.minSpreadPct)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      let valA = a[filter.sortBy] || 0;
      let valB = b[filter.sortBy] || 0;

      if (filter.sortBy === 'timestamp') {
        valA = a.timestamp;
        valB = b.timestamp;
      } else if (filter.sortBy === 'arbPnl') {
        valA = a.arbPnl;
        valB = b.arbPnl;
      } else if (filter.sortBy === 'spreadPct') {
        valA = a.spreadPct;
        valB = b.spreadPct;
      } else if (filter.sortBy === 'buyAmount') {
        valA = a.buyAmount;
        valB = b.buyAmount;
      }

      if (filter.sortOrder === 'asc') {
        return valA > valB ? 1 : -1;
      } else {
        return valA < valB ? 1 : -1;
      }
    });
  }, [opportunities, filter]);

  return (
    <div className="bg-[#0F0F11] border border-gray-800 shadow-2xl overflow-hidden my-4 font-mono">
      
      {/* Table Header Controls */}
      <div className="p-3 border-b border-gray-800 bg-[#141416] flex flex-col lg:flex-row items-center justify-between gap-3">
        
        {/* Title & Live Feed Status */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto">
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              LIVE
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-950/80 text-purple-300 border border-purple-800/80">
                {filteredOpportunities.length} EVENTS
              </span>
            </h2>
            <p className="text-[10px] text-gray-500">Realtime spreads feed</p>
          </div>
        </div>

        {/* High Density Filtering Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto text-[11px]">
          
          {/* Search Input */}
          <div className="relative flex-1 min-w-[160px] sm:min-w-[200px]">
            <Search className="w-3 h-3 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="SEARCH_TOKEN_OR_SIG..."
              value={filter.searchQuery}
              onChange={(e) => setFilter((prev) => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full pl-8 pr-2.5 py-1 bg-[#0A0A0B] border border-gray-800 rounded text-[11px] text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-all font-mono"
            />
          </div>

          {/* Strategy Dropdown */}
          <select
            value={filter.strategy}
            onChange={(e) => setFilter((prev) => ({ ...prev, strategy: e.target.value }))}
            className="px-2 py-1 bg-[#0A0A0B] border border-gray-800 rounded text-[11px] text-gray-300 focus:outline-none focus:border-purple-500 font-mono"
          >
            <option value="all">ALL STRATEGIES</option>
            {uniqueStrategies.map((s) => (
              <option key={s} value={s}>
                {s.toUpperCase()}
              </option>
            ))}
          </select>

          {/* Min PnL filter */}
          <select
            value={filter.minPnlSol}
            onChange={(e) => setFilter((prev) => ({ ...prev, minPnlSol: e.target.value === '' ? '' : Number(e.target.value) }))}
            className="px-2 py-1 bg-[#0A0A0B] border border-gray-800 rounded text-[11px] text-gray-300 focus:outline-none focus:border-purple-500 font-mono"
          >
            <option value="">ANY PNL</option>
            <option value="0">PROFIT ONLY (&gt; 0 SOL)</option>
            <option value="0.005">&gt; 0.005 SOL</option>
            <option value="0.02">&gt; 0.02 SOL</option>
            <option value="0.05">&gt; 0.05 SOL</option>
          </select>

          {/* Sort Column & Direction */}
          <div className="flex items-center bg-[#0A0A0B] border border-gray-800 rounded px-1">
            <select
              value={filter.sortBy}
              onChange={(e) => setFilter((prev) => ({ ...prev, sortBy: e.target.value as any }))}
              className="px-1 py-1 bg-transparent text-[11px] text-gray-300 focus:outline-none font-mono"
            >
              <option value="timestamp">SORT: TIME</option>
              <option value="arbPnl">SORT: NET PNL</option>
              <option value="spreadPct">SORT: SPREAD %</option>
              <option value="buyAmount">SORT: SIZE</option>
            </select>
            <button
              onClick={() => setFilter((prev) => ({ ...prev, sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' }))}
              className="p-1 text-gray-400 hover:text-white transition-colors"
              title="TOGGLE_SORT"
            >
              <ArrowUpDown className="w-3 h-3" />
            </button>
          </div>

          {/* Lock Feed */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono border transition-colors ${
              autoScroll
                ? 'bg-[#0A0A0B] text-gray-300 border-gray-800 hover:bg-gray-800'
                : 'bg-amber-950/60 text-amber-300 border-amber-800/80'
            }`}
          >
            {autoScroll ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span className="hidden sm:inline">{autoScroll ? 'STREAM_LIVE' : 'LOCKED'}</span>
          </button>

        </div>
      </div>

      {/* Main Table View */}
      <div className="overflow-x-auto max-h-[580px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800">
        <table className="w-full text-left border-collapse font-mono">
          <thead className="bg-[#0A0A0B] sticky top-0 z-20 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800">
            <tr>
              <th className="py-2.5 px-3">TIME</th>
              <th className="py-2.5 px-3">TOKEN</th>
              <th className="py-2.5 px-3">ROUTE (BUY &rarr; SELL)</th>
              <th className="py-2.5 px-3 text-right">SIZE (SOL)</th>
              <th className="py-2.5 px-3 text-right">SPREAD %</th>
              <th className="py-2.5 px-3 text-right">EST PNL (SOL)</th>
              <th className="py-2.5 px-3 text-right">MEV TIP</th>
              <th className="py-2.5 px-3 text-center">INSPECT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-900 text-[11px]">
            {filteredOpportunities.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-600">
                  <div className="flex flex-col items-center gap-2">
                    <Info className="w-6 h-6 text-gray-700" />
                    <p className="text-xs font-bold text-gray-400">NO MATCHING ARBITRAGE EVENTS</p>
                    <p className="text-[10px] text-gray-600">Adjust query parameters or await incoming WebSocket frames</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredOpportunities.map((opp) => {
                const isNew = newOppIds.has(opp.id);
                const isProfitable = (opp.arbPnl || 0) > 0;

                return (
                  <tr
                    key={opp.id}
                    onClick={() => onSelectOpportunity(opp)}
                    className={`cursor-pointer transition-colors ${
                      isNew
                        ? 'bg-purple-950/40 border-l-2 border-l-purple-500'
                        : 'hover:bg-[#141416]'
                    }`}
                  >
                    {/* Time */}
                    <td className="py-2 px-3 text-gray-400 text-[10px]">
                      {formatTime(opp.timestamp)}
                    </td>

                    {/* Token */}
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded bg-gray-800 text-purple-400 flex items-center justify-center font-bold text-[9px] border border-gray-700">
                          {opp.tokenSymbol?.slice(0, 1) || 'S'}
                        </span>
                        <div>
                          <span className="font-bold text-white block">
                            ${opp.tokenSymbol || 'UNK'}
                          </span>
                          <span className="text-[9px] text-gray-500 block">
                            {truncateAddress(opp.sourceMint, 3, 3)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Route */}
                    <td className="py-2 px-3 max-w-[260px]">
                      {opp.hops && opp.hops.length > 0 ? (
                        <div className="flex flex-col gap-0.5">
                          {/* Token hop chain */}
                          <div className="flex items-center flex-wrap gap-0.5 text-[10px]">
                            <span className="text-cyan-400 font-bold">SOL</span>
                            {opp.hops.map((hop, i) => {
                              const isLast = i === opp.hops!.length - 1;
                              const outSymbol = isLast
                                ? 'SOL'
                                : i === 0
                                  ? (opp.tokenSymbol || 'TOKEN')
                                  : (opp.intermediateSymbol || 'MID');
                              const dexLabel = hop.dex.split('->').map(d => d.trim()).join('→');
                              return (
                                <React.Fragment key={i}>
                                  <ArrowRight className="w-2.5 h-2.5 text-gray-600 shrink-0" />
                                  <span className={`font-bold ${isLast ? 'text-cyan-400' : i === 0 ? 'text-purple-400' : 'text-indigo-400'}`}>
                                    {outSymbol}
                                  </span>
                                  <span className="text-[9px] text-gray-600 px-0.5 bg-gray-900 rounded border border-gray-800 leading-tight">
                                    {dexLabel}
                                  </span>
                                </React.Fragment>
                              );
                            })}
                          </div>
                          {/* Strategy + hop count */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] text-gray-600 uppercase tracking-tight">{opp.strategy}</span>
                            <span className="text-[9px] px-1 rounded bg-purple-950/60 text-purple-400 border border-purple-900/60">
                              {opp.hops.length}HOP
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1 text-[11px] text-gray-200 font-medium">
                            <span className="text-purple-400">{opp.dexIn}</span>
                            <ArrowRight className="w-3 h-3 text-gray-600" />
                            <span className="text-indigo-400">{opp.dexOut}</span>
                          </div>
                          <span className="text-[9px] text-gray-600 uppercase tracking-tight">
                            {opp.strategy}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Trade Size */}
                    <td className="py-2 px-3 text-right font-bold text-gray-200">
                      {opp.buyAmount ? opp.buyAmount.toFixed(3) : '0.000'}
                    </td>

                    {/* Spread % */}
                    <td className="py-2 px-3 text-right">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        (opp.spreadPct || 0) > 0
                          ? 'bg-green-950/80 text-green-400 border border-green-800/80'
                          : 'bg-rose-950/80 text-rose-400 border border-rose-800/80'
                      }`}>
                        {formatPct(opp.spreadPct, 2)}
                      </span>
                    </td>

                    {/* Net PnL */}
                    <td className="py-2 px-3 text-right">
                      <div className="flex flex-col items-end">
                        <span className={`font-bold text-[11px] ${
                          isProfitable ? 'text-green-400' : 'text-rose-400'
                        }`}>
                          {formatSol(opp.arbPnl, 4)}
                        </span>
                        <span className="text-[9px] text-gray-500">
                          {formatUsd(opp.arbPnl, solPriceUsd)}
                        </span>
                      </div>
                    </td>

                    {/* Jito Tip */}
                    <td className="py-2 px-3 text-right text-gray-400 text-[10px]">
                      {opp.costs?.jitoTipSol ? formatSol(opp.costs.jitoTipSol, 4) : '0.0000'}
                    </td>

                    {/* Actions */}
                    <td className="py-2 px-3 text-center">
                      <button
                        onClick={() => onSelectOpportunity(opp)}
                        className="px-2 py-0.5 bg-[#141416] hover:bg-purple-950/80 text-gray-300 hover:text-purple-300 rounded border border-gray-800 hover:border-purple-800 text-[10px] font-bold transition-all"
                      >
                        VIEW
                      </button>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer info */}
      <div className="px-3 py-2 bg-[#141416] border-t border-gray-800 text-[10px] text-gray-500 font-mono flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>BUFFER_COUNT: {filteredOpportunities.length} / {opportunities.length} EVENTS</span>
        <span>PROTOCOL_PORT: 3000 :: WS_STATUS: LIVE_STREAMING</span>
      </div>

    </div>
  );
};
