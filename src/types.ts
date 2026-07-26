export interface ArbCosts {
  jitoTipSol: number;
  priorityFeeSol: number;
  slippageBps: number;
}

export interface ArbTrigger {
  signature: string;
  sellSizeSol: number;
  txSigner: string | null;
  pumpswapPool: string | null;
}

export interface ArbHop {
  inputMint: string;
  outputMint: string;
  inAmount: number;
  outAmount: number;
  dex: string;
  pools: string[];
  priceImpactPct: number;
}

export interface ArbRoute {
  intermediateMint: string;
  intermediateSymbol: string;
  intermediateAmount: number;
  sellAmount: number;
  netPnl: number;
}

export interface ArbOpportunity {
  id: string; // `${e.signature}:${e.mint}`
  timestamp: number;
  detectedAt: string; // ISO string
  strategy: string; // e.g. 'pumpswap-meteora-two-leg'
  sourceMint: string;
  tokenSymbol: string | null;
  targetMint: string; // WSOL mint
  // Two-leg fields (optional when hops is present)
  poolIn?: string;
  poolOut?: string;
  dexIn?: string;
  dexOut?: string;
  // Multihop fields
  intermediateMint?: string;
  intermediateSymbol?: string;
  intermediateAmount?: number;
  hops?: ArbHop[];
  allRoutes?: ArbRoute[];
  buyAmount: number; // Trade size in SOL
  tokenAmount: number;
  sellAmount: number; // Received SOL
  buyPrice: number;
  sellPrice: number;
  spreadPct: number;
  priceImpactInPct?: number;
  priceImpactOutPct?: number;
  grossPnl: number; // SOL
  arbPnl: number; // Net profit in SOL
  costs: ArbCosts;
  trigger: ArbTrigger;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

export interface ServerStatus {
  connectedClients: number;
  totalOpportunitiesReceived: number;
  simulationEnabled: boolean;
  simulationIntervalMs: number;
  uptimeSeconds: number;
}

// Client-side page routing (hash-based: #/overview, #/feed, #/telemetry)
export type Page = 'overview' | 'feed' | 'telemetry';

export interface FilterState {
  searchQuery: string;
  strategy: string;
  minPnlSol: number | '';
  minSpreadPct: number | '';
  onlyProfitable: boolean;
  sortBy: 'timestamp' | 'arbPnl' | 'spreadPct' | 'buyAmount';
  sortOrder: 'asc' | 'desc';
}

export interface MetricSummary {
  totalOpportunities: number;
  profitableCount: number;
  winRate: number;
  totalGrossPnlSol: number;
  totalNetPnlSol: number;
  totalJitoTipsSol: number;
  totalPriorityFeesSol: number;
  totalVolumeSol: number;
  avgSpreadPct: number;
  maxSpreadPct: number;
  avgPriceImpactPct: number;
  bestOpportunitySol: number;
}

export type WSClientMessage =
  | { type: 'ping' }
  | { type: 'clear' }
  | { type: 'simulation_toggle'; enabled: boolean }
  | { type: 'simulation_speed'; intervalMs: number }
  | { type: 'post_opportunity'; opportunity: ArbOpportunity };

export type WSServerMessage =
  | { type: 'initial_state'; opportunities: ArbOpportunity[]; status: ServerStatus }
  | { type: 'hello'; data: { history: ArbOpportunity[] } }
  | { type: 'arb_opportunity'; data: ArbOpportunity }
  | { type: 'status_update'; status: ServerStatus }
  | { type: 'cleared' }
  | { type: 'pong' };
