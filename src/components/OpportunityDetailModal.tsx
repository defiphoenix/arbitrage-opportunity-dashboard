import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  ArrowRight, 
  Flame, 
  DollarSign, 
  Layers, 
  Code 
} from 'lucide-react';
import { ArbOpportunity } from '../types';
import { formatSol, formatUsd, formatPct, formatTime } from '../utils/formatters';

interface OpportunityDetailModalProps {
  opportunity: ArbOpportunity | null;
  onClose: () => void;
  solPriceUsd?: number;
}

export const OpportunityDetailModal: React.FC<OpportunityDetailModalProps> = ({
  opportunity,
  onClose,
  solPriceUsd = 185,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'json'>('details');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!opportunity) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const isProfitable = opportunity.arbPnl > 0;

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0B]/85 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-mono">
      <div 
        className="bg-[#0F0F11] border border-gray-800 rounded max-w-2xl w-full shadow-2xl overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 border-b border-gray-800 bg-[#141416] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gray-800 border border-gray-700 flex items-center justify-center font-bold text-xs text-purple-400">
              {opportunity.tokenSymbol?.slice(0, 2) || 'SL'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  ${opportunity.tokenSymbol || 'UNK'} // ARB_INSPECTOR
                </h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  isProfitable
                    ? 'bg-green-950/80 text-green-400 border border-green-800/80'
                    : 'bg-rose-950/80 text-rose-400 border border-rose-800/80'
                }`}>
                  {formatSol(opportunity.arbPnl, 4)}
                </span>
              </div>
              {/* <p className="text-[10px] text-gray-500 font-mono">
                EVENT_ID: {opportunity.id} &bull; {formatTime(opportunity.timestamp)}
              </p> */}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-gray-800 bg-[#0A0A0B] px-4 text-xs font-mono">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-2 px-3 text-[11px] font-bold border-b-2 transition-colors ${
              activeTab === 'details'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            EXECUTION_BREAKDOWN
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`py-2 px-3 text-[11px] font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'json'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            RAW_JSON_PAYLOAD
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4">
          
          {activeTab === 'details' ? (
            <>
              {/* Route & DEX Leg Summary */}
              <div className="bg-[#0A0A0B] border border-gray-800 p-3 space-y-2">
                <div className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">
                  {opportunity.hops && opportunity.hops.length > 0 ? `${opportunity.hops.length}_HOP_EXECUTION_PATH` : 'TWO_LEG_EXECUTION_PATH'}
                </div>

                {opportunity.hops && opportunity.hops.length > 0 ? (
                  /* Multihop path */
                  <div className="flex flex-col gap-2">
                    {opportunity.hops.map((hop, i) => {
                      const hopColors = ['text-purple-400', 'text-indigo-400', 'text-cyan-400', 'text-teal-400'];
                      const color = hopColors[i % hopColors.length];
                      return (
                        <div key={i} className="bg-[#141416] border border-gray-800 p-2.5 space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-gray-400">
                            <span className={`font-bold ${color}`}>HOP {i + 1}</span>
                            <span className="text-gray-300 font-bold">{hop.dex}</span>
                          </div>
                          <div className="text-xs font-bold text-white font-mono">
                            {hop.inAmount.toLocaleString(undefined, { maximumFractionDigits: 6 })} &rarr; {hop.outAmount.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                          </div>
                          <div className="text-[10px] text-gray-400 font-mono">
                            IMPACT: {hop.priceImpactPct.toFixed(4)}%
                          </div>
                          {hop.pools.map((pool, pi) => (
                            <div key={pi} className="text-[9px] text-gray-500 font-mono truncate" title={pool}>
                              POOL{hop.pools.length > 1 ? ` ${pi + 1}` : ''}: {pool}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                    {opportunity.allRoutes && opportunity.allRoutes.length > 1 && (
                      <div className="bg-[#141416] border border-gray-800 p-2.5 space-y-1">
                        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">ALL_ROUTES_EVALUATED</div>
                        {opportunity.allRoutes.map((route, ri) => (
                          <div key={ri} className="flex items-center justify-between text-[10px] font-mono">
                            <span className="text-gray-400">
                              via <span className="text-indigo-300 font-bold">${route.intermediateSymbol}</span>
                              {' '}({route.intermediateAmount.toLocaleString(undefined, { maximumFractionDigits: 4 })} tokens)
                            </span>
                            <span className={route.netPnl > 0 ? 'text-green-400 font-bold' : 'text-rose-400'}>
                              {route.netPnl > 0 ? '+' : ''}{route.netPnl.toFixed(6)} SOL
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Two-leg path */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-[#141416] border border-gray-800 p-2.5 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-gray-400">
                        <span className="font-bold text-purple-400">LEG 1 (BUY)</span>
                        <span className="text-gray-300 font-bold">{opportunity.dexIn}</span>
                      </div>
                      <div className="text-xs font-bold text-white font-mono">
                        {opportunity.buyAmount.toFixed(4)} SOL &rarr; {opportunity.tokenAmount?.toLocaleString()} ${opportunity.tokenSymbol}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        PRICE: {opportunity.buyPrice.toFixed(8)} | IMPACT: {opportunity.priceImpactInPct ?? 0}%
                      </div>
                      <div className="text-[9px] text-gray-500 font-mono truncate" title={opportunity.poolIn}>
                        POOL: {opportunity.poolIn}
                      </div>
                    </div>
                    <div className="bg-[#141416] border border-gray-800 p-2.5 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-gray-400">
                        <span className="font-bold text-indigo-400">LEG 2 (SELL)</span>
                        <span className="text-gray-300 font-bold">{opportunity.dexOut}</span>
                      </div>
                      <div className="text-xs font-bold text-white font-mono">
                        {opportunity.tokenAmount?.toLocaleString()} ${opportunity.tokenSymbol} &rarr; {opportunity.sellAmount?.toFixed(4)} SOL
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        PRICE: {opportunity.sellPrice.toFixed(8)} | IMPACT: {opportunity.priceImpactOutPct ?? 0}%
                      </div>
                      <div className="text-[9px] text-gray-500 font-mono truncate" title={opportunity.poolOut}>
                        POOL: {opportunity.poolOut}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Financial Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-mono">
                <div className="bg-[#0A0A0B] border border-gray-800 p-2.5">
                  <span className="text-[10px] text-gray-500 block font-bold uppercase">SPREAD_PCT</span>
                  <span className="text-sm font-bold font-mono text-purple-400">
                    {formatPct(opportunity.spreadPct, 2)}
                  </span>
                </div>
                <div className="bg-[#0A0A0B] border border-gray-800 p-2.5">
                  <span className="text-[10px] text-gray-500 block font-bold uppercase">GROSS_PNL</span>
                  <span className="text-sm font-bold font-mono text-white">
                    {formatSol(opportunity.grossPnl, 4)}
                  </span>
                </div>
                <div className="bg-[#0A0A0B] border border-gray-800 p-2.5">
                  <span className="text-[10px] text-gray-500 block font-bold uppercase">JITO_TIP</span>
                  <span className="text-sm font-bold font-mono text-amber-400">
                    {formatSol(opportunity.costs?.jitoTipSol, 4)}
                  </span>
                </div>
                <div className="bg-[#0A0A0B] border border-gray-800 p-2.5">
                  <span className="text-[10px] text-gray-500 block font-bold uppercase">NET_PNL</span>
                  <span className={`text-sm font-bold font-mono ${
                    isProfitable ? 'text-green-400' : 'text-rose-400'
                  }`}>
                    {formatSol(opportunity.arbPnl, 4)}
                  </span>
                </div>
              </div>

              {/* Addresses & Telemetry */}
              <div className="space-y-1.5 text-[10px] font-mono">
                <div className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">
                  ADDRESSES_&_TELEMETRY
                </div>

                <div className="bg-[#0A0A0B] border border-gray-800 divide-y divide-gray-900 font-mono">
                  
                  {/* Source Mint */}
                  <div className="p-2 flex items-center justify-between">
                    <span className="text-gray-500">MINT:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-200">{opportunity.sourceMint}</span>
                      <button
                        onClick={() => copyToClipboard(opportunity.sourceMint, 'mint')}
                        className="text-gray-500 hover:text-white"
                      >
                        {copiedField === 'mint' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div> 

                  {/* PumpSwap Pool */}
                  <div className="p-2 flex items-center justify-between">
                    <span className="text-gray-500">PUMPSWAP_POOL:</span>
                    <span className="text-gray-400">{opportunity.trigger?.pumpswapPool || 'N/A'}</span>
                  </div>

                </div>
              </div>
            </>
          ) : (
            <div className="relative font-mono">
              <button
                onClick={() => copyToClipboard(JSON.stringify(opportunity, null, 2), 'raw_json')}
                className="absolute top-2 right-2 px-2 py-1 bg-[#141416] hover:bg-gray-800 text-gray-300 text-[10px] rounded border border-gray-800 flex items-center gap-1"
              >
                {copiedField === 'raw_json' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedField === 'raw_json' ? 'COPIED' : 'COPY_JSON'}</span>
              </button>
              <pre className="bg-[#0A0A0B] p-3 border border-gray-800 text-[10px] font-mono text-purple-300 overflow-x-auto">
                {JSON.stringify(opportunity, null, 2)}
              </pre>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-gray-800 bg-[#141416] flex items-center justify-between font-mono">
          <span className="text-[10px] text-gray-500">STRATEGY: {opportunity.strategy}</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white font-bold text-[10px] rounded transition-colors uppercase"
          >
            CLOSE
          </button>
        </div>

      </div>
    </div>
  );
};
