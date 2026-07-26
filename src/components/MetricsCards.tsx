import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Flame, 
  Layers, 
  Percent, 
  ShieldAlert, 
  ArrowUpRight 
} from 'lucide-react';
import { ArbOpportunity, MetricSummary } from '../types';
import { formatSol, formatUsd, formatPct, formatNumber } from '../utils/formatters';

interface MetricsCardsProps {
  opportunities: ArbOpportunity[];
  solPriceUsd?: number;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({
  opportunities,
  solPriceUsd = 185,
}) => {
  const metrics = useMemo<MetricSummary>(() => {
    if (!opportunities || opportunities.length === 0) {
      return {
        totalOpportunities: 0,
        profitableCount: 0,
        winRate: 0,
        totalGrossPnlSol: 0,
        totalNetPnlSol: 0,
        totalJitoTipsSol: 0,
        totalPriorityFeesSol: 0,
        totalVolumeSol: 0,
        avgSpreadPct: 0,
        maxSpreadPct: 0,
        avgPriceImpactPct: 0,
        bestOpportunitySol: 0,
      };
    }

    let gross = 0;
    let net = 0;
    let jito = 0;
    let priority = 0;
    let volume = 0;
    let spreadSum = 0;
    let maxSpread = -Infinity;
    let profitable = 0;
    let bestArb = -Infinity;
    let priceImpactSum = 0;

    opportunities.forEach((opp) => {
      gross += opp.grossPnl || 0;
      net += opp.arbPnl || 0;
      jito += opp.costs?.jitoTipSol || 0;
      priority += opp.costs?.priorityFeeSol || 0;
      volume += opp.buyAmount || 0;
      spreadSum += opp.spreadPct || 0;

      if ((opp.spreadPct || 0) > maxSpread) maxSpread = opp.spreadPct || 0;
      if ((opp.arbPnl || 0) > 0) profitable++;
      if ((opp.arbPnl || 0) > bestArb) bestArb = opp.arbPnl || 0;

      priceImpactSum += (opp.priceImpactInPct || 0) + (opp.priceImpactOutPct || 0);
    });

    const count = opportunities.length;

    return {
      totalOpportunities: count,
      profitableCount: profitable,
      winRate: (profitable / count) * 100,
      totalGrossPnlSol: gross,
      totalNetPnlSol: net,
      totalJitoTipsSol: jito,
      totalPriorityFeesSol: priority,
      totalVolumeSol: volume,
      avgSpreadPct: spreadSum / count,
      maxSpreadPct: maxSpread === -Infinity ? 0 : maxSpread,
      avgPriceImpactPct: priceImpactSum / (count * 2),
      bestOpportunitySol: bestArb === -Infinity ? 0 : bestArb,
    };
  }, [opportunities]);

  const isNetPositive = metrics.totalNetPnlSol >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-4 font-mono">
      
      {/* 1. Total Net PnL */}
      <div className="bg-[#0F0F11] border border-gray-800 p-3.5 relative overflow-hidden group hover:border-gray-700 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-green-400" />
            TOTAL_NET_PNL
          </span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
            isNetPositive ? 'bg-green-950/80 text-green-400 border border-green-800/80' : 'bg-rose-950/80 text-rose-400 border border-rose-800/80'
          }`}>
            WIN_RATE {metrics.winRate.toFixed(1)}%
          </span>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className={`text-xl lg:text-2xl font-bold font-mono tracking-tight ${
            isNetPositive ? 'text-green-400' : 'text-rose-400'
          }`}>
            {formatSol(metrics.totalNetPnlSol, 4)}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
          <span>{formatUsd(metrics.totalNetPnlSol, solPriceUsd)}</span>
          <span className="text-gray-500">GROSS: {formatSol(metrics.totalGrossPnlSol, 3)}</span>
        </div>
      </div>

      {/* 2. Total Costs & Jito Tips */}
      <div className="bg-[#0F0F11] border border-gray-800 p-3.5 relative overflow-hidden group hover:border-gray-700 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            JITO_TIPS_&_GAS
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/60 text-amber-300 border border-amber-800/80">
            MEV_COSTS
          </span>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-xl lg:text-2xl font-bold font-mono text-amber-300 tracking-tight">
            {formatSol(metrics.totalJitoTipsSol + metrics.totalPriorityFeesSol, 4)}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
          <span>JITO: {formatSol(metrics.totalJitoTipsSol, 4)}</span>
          <span className="text-gray-500">FEE: {formatSol(metrics.totalPriorityFeesSol, 4)}</span>
        </div>
      </div>

      {/* 3. Average & Max Spread */}
      <div className="bg-[#0F0F11] border border-gray-800 p-3.5 relative overflow-hidden group hover:border-gray-700 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
            <Percent className="w-3.5 h-3.5 text-purple-400" />
            AVG_SPREAD_PCT
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950/60 text-purple-300 border border-purple-800/80">
            MAX {formatPct(metrics.maxSpreadPct, 2)}
          </span>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-xl lg:text-2xl font-bold font-mono text-purple-300 tracking-tight">
            {formatPct(metrics.avgSpreadPct, 2)}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
          <span>BEST: {formatSol(metrics.bestOpportunitySol, 3)}</span>
          <span className="text-gray-500">IMPACT: ~{metrics.avgPriceImpactPct.toFixed(2)}%</span>
        </div>
      </div>

      {/* 4. Stream Throughput & Volume */}
      <div className="bg-[#0F0F11] border border-gray-800 p-3.5 relative overflow-hidden group hover:border-gray-700 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            TOTAL_EVENTS
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-800/80">
            {metrics.profitableCount} PROFITABLE
          </span>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-xl lg:text-2xl font-bold font-mono text-cyan-300 tracking-tight">
            {formatNumber(metrics.totalOpportunities, 0)}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
          <span>VOL: {formatSol(metrics.totalVolumeSol, 1)}</span>
          <span className="text-gray-500">BUFFER: {opportunities.length}</span>
        </div>
      </div>

    </div>
  );
};
