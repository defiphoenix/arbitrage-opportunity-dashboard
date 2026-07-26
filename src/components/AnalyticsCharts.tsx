import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { ArbOpportunity } from '../types';
import { formatSol, formatPct, formatTime } from '../utils/formatters';
import { TrendingUp, PieChart as PieIcon, Activity } from 'lucide-react';

interface AnalyticsChartsProps {
  opportunities: ArbOpportunity[];
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ opportunities }) => {
  // Cumulative PnL Timeline Data
  const timelineData = useMemo(() => {
    if (!opportunities || opportunities.length === 0) return [];

    // Sort chronologically ascending for chart
    const sorted = [...opportunities].sort((a, b) => a.timestamp - b.timestamp);
    let cumulativeNetSol = 0;
    let cumulativeGrossSol = 0;

    return sorted.map((opp, idx) => {
      cumulativeNetSol += opp.arbPnl || 0;
      cumulativeGrossSol += opp.grossPnl || 0;

      return {
        index: idx + 1,
        time: formatTime(opp.timestamp),
        netPnl: Number(cumulativeNetSol.toFixed(4)),
        grossPnl: Number(cumulativeGrossSol.toFixed(4)),
        spreadPct: Number((opp.spreadPct || 0).toFixed(2)),
        token: opp.tokenSymbol || 'SOL',
      };
    });
  }, [opportunities]);

  // Strategy performance breakdown
  const strategyData = useMemo(() => {
    if (!opportunities || opportunities.length === 0) return [];

    const map = new Map<string, { count: number; netPnl: number; grossPnl: number }>();

    opportunities.forEach((opp) => {
      const strat = opp.strategy || 'Other';
      const existing = map.get(strat) || { count: 0, netPnl: 0, grossPnl: 0 };
      existing.count += 1;
      existing.netPnl += opp.arbPnl || 0;
      existing.grossPnl += opp.grossPnl || 0;
      map.set(strat, existing);
    });

    return Array.from(map.entries()).map(([name, val]) => ({
      name,
      count: val.count,
      netPnl: Number(val.netPnl.toFixed(4)),
      grossPnl: Number(val.grossPnl.toFixed(4)),
    }));
  }, [opportunities]);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 my-4 font-mono">
      
      {/* 1. Cumulative Net PnL Chart */}
      <div className="lg:col-span-2 bg-[#0F0F11] border border-gray-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-green-400" />
              CUMULATIVE_PNL_TRAJECTORY
            </h3>
            <p className="text-[10px] text-gray-500">Live net profit accumulation curve (SOL)</p>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#141416] text-gray-400 border border-gray-800">
            {timelineData.length} SAMPLES
          </span>
        </div>

        <div className="h-56 w-full">
          {timelineData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-[11px] text-gray-600">
              Awaiting websocket stream opportunities...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="pnlColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" stroke="#1f2937" />
                <XAxis dataKey="time" stroke="#4b5563" fontSize={9} tickLine={false} />
                <YAxis stroke="#4b5563" fontSize={9} tickLine={false} tickFormatter={(val) => `${val} SOL`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F0F11',
                    borderColor: '#374151',
                    borderRadius: '0.25rem',
                    fontSize: '11px',
                    color: '#f3f4f6',
                    fontFamily: 'monospace',
                  }}
                  formatter={(value: any) => [`${value} SOL`, 'NET_PNL']}
                />
                <Area
                  type="monotone"
                  dataKey="netPnl"
                  stroke="#22c55e"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#pnlColor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 2. Strategy PnL Breakdown */}
      <div className="bg-[#0F0F11] border border-gray-800 p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <PieIcon className="w-3.5 h-3.5 text-purple-400" />
              STRATEGY_BREAKDOWN
            </h3>
            <span className="text-[10px] font-mono text-gray-500">{strategyData.length} STRATS</span>
          </div>

          <div className="h-48 w-full">
            {strategyData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[11px] text-gray-600">
                Awaiting strategy data...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={strategyData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#1f2937" horizontal={false} />
                  <XAxis type="number" stroke="#4b5563" fontSize={9} tickFormatter={(v) => `${v} SOL`} />
                  <YAxis type="category" dataKey="name" stroke="#4b5563" fontSize={8} width={90} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F0F11',
                      borderColor: '#374151',
                      borderRadius: '0.25rem',
                      fontSize: '11px',
                      color: '#f3f4f6',
                      fontFamily: 'monospace',
                    }}
                    formatter={(val: any) => [`${val} SOL`, 'NET_PNL']}
                  />
                  <Bar dataKey="netPnl" fill="#a855f7" radius={[0, 2, 2, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-gray-800 text-[10px] text-gray-500 font-mono flex items-center justify-between">
          <span>PRIMARY_ROUTE: PUMPSWAP : METEORA</span>
          <span className="text-purple-400 font-bold">TWO-LEG</span>
        </div>
      </div>

    </div>
  );
};
