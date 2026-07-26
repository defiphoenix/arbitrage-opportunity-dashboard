import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import { ArbOpportunity, ServerStatus } from './src/types.js';

const PORT = 3000;
const HOST = '0.0.0.0';

const CONFIG = {
  wsolMint: 'So11111111111111111111111111111111111111112',
  jitoTipSol: 0.005,
  priorityFeeSol: 0.0001,
  slippageBps: 50,
};

// In-memory store for opportunities
const opportunities: ArbOpportunity[] = [];
const MAX_HISTORY = 1000;

let simulationEnabled = false;
let simulationIntervalMs = 1200;
let simulationTimer: NodeJS.Timeout | null = null;
let totalOpportunitiesCount = 0;
const startTime = Date.now();

// Popular Solana tokens for realistic simulation
const SIMULATED_TOKENS = [
  { symbol: 'BONK', mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263' },
  { symbol: 'WIF', mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcJM' },
  { symbol: 'POPCAT', mint: '7GCihgB12FuLio2oEYP31iJ8BkRZg3yPD97TijVKpump' },
  { symbol: 'PUMP', mint: 'PUMP111111111111111111111111111111111111111' },
  { symbol: 'TRUMP', mint: '6p6v2343cd2143df32131231231231231231231pump' },
  { symbol: 'GIGA', mint: '633213213123123123123123123123123123123pump' },
  { symbol: 'MOODENG', mint: 'ED5566112233445566778899aabbccddeeffgg11' },
  { symbol: 'MEW', mint: 'MEW111111111111111111111111111111111111111' },
  { symbol: 'FARTCOIN', mint: '9BB62h3yA33L38AK4G3B69UL2EsUM9YoWK9C4G7ppump' },
  { symbol: 'NEIRO', mint: 'CTg213213123123123123123123123123123123pump' },
];

const STRATEGIES = [
  'pumpswap-meteora-two-leg',
  'pumpswap-raydium-two-leg',
  'raydium-meteora-two-leg',
  'orca-raydium-triangular',
  'pumpswap-orca-two-leg'
];

const DEX_ROUTES = [
  { dexIn: 'PumpSwap', dexOut: 'Meteora DLMM' },
  { dexIn: 'PumpSwap', dexOut: 'Raydium CP-MM' },
  { dexIn: 'Raydium Concentrated', dexOut: 'Meteora DLMM' },
  { dexIn: 'Meteora Dynamic', dexOut: 'Orca Whirlpool' },
  { dexIn: 'PumpSwap', dexOut: 'Orca Whirlpool' }
];

function generateRandomBase58(length = 88): string {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let res = '';
  for (let i = 0; i < length; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
}

function generateMockOpportunity(): ArbOpportunity {
  const now = Date.now();
  const token = SIMULATED_TOKENS[Math.floor(Math.random() * SIMULATED_TOKENS.length)];
  const strategy = STRATEGIES[Math.floor(Math.random() * STRATEGIES.length)];
  const dexRoute = DEX_ROUTES[Math.floor(Math.random() * DEX_ROUTES.length)];

  const signature = generateRandomBase58(88);
  const tradeSol = Number((0.5 + Math.random() * 20).toFixed(4));
  
  // Spread percentage: 75% chance of positive spread (0.2% to 4.5%), 25% small negative/neutral
  const isProfitable = Math.random() > 0.22;
  const spreadPct = isProfitable 
    ? Number((0.25 + Math.random() * 4.2).toFixed(3))
    : Number((-0.1 - Math.random() * 0.5).toFixed(3));

  const buyPrice = Number((0.000012 + Math.random() * 0.005).toFixed(8));
  const sellPrice = Number((buyPrice * (1 + spreadPct / 100)).toFixed(8));

  const tokenOut = Math.floor((tradeSol / buyPrice) * 1000) / 1000;
  const solOut = Number((tokenOut * sellPrice).toFixed(6));

  const grossProfitSol = Number((solOut - tradeSol).toFixed(6));
  
  // Costs
  const jitoTipSol = Number((0.001 + Math.random() * 0.012).toFixed(5));
  const priorityFeeSol = CONFIG.priorityFeeSol;
  const totalCostsSol = jitoTipSol + priorityFeeSol;

  const netProfitSol = Number((grossProfitSol - totalCostsSol).toFixed(6));

  const opportunity: ArbOpportunity = {
    id: `${signature.slice(0, 16)}:${token.mint.slice(0, 8)}`,
    timestamp: now,
    detectedAt: new Date(now).toISOString(),
    strategy,
    sourceMint: token.mint,
    tokenSymbol: token.symbol,
    targetMint: CONFIG.wsolMint,
    poolIn: `${generateRandomBase58(32)}...in`,
    poolOut: `${generateRandomBase58(32)}...out`,
    dexIn: dexRoute.dexIn,
    dexOut: dexRoute.dexOut,
    buyAmount: tradeSol,
    tokenAmount: tokenOut,
    sellAmount: solOut,
    buyPrice,
    sellPrice,
    spreadPct,
    priceImpactInPct: Number((0.05 + Math.random() * 0.8).toFixed(2)),
    priceImpactOutPct: Number((0.08 + Math.random() * 1.2).toFixed(2)),
    grossPnl: grossProfitSol,
    arbPnl: netProfitSol,
    costs: {
      jitoTipSol,
      priorityFeeSol,
      slippageBps: CONFIG.slippageBps,
    },
    trigger: {
      signature,
      sellSizeSol: Number((tradeSol * (0.8 + Math.random() * 0.5)).toFixed(3)),
      txSigner: generateRandomBase58(44),
      pumpswapPool: `${token.symbol.toLowerCase()}_pump_pool_sol`,
    },
  };

  return opportunity;
}

function processAndBroadcastOpportunity(opp: ArbOpportunity, wss: WebSocketServer) {
  opportunities.unshift(opp);
  totalOpportunitiesCount++;
  if (opportunities.length > MAX_HISTORY) {
    opportunities.length = MAX_HISTORY;
  }

  const payload = JSON.stringify({
    type: 'opportunity',
    opportunity: opp,
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

function getServerStatus(wss: WebSocketServer): ServerStatus {
  return {
    connectedClients: wss.clients.size,
    totalOpportunitiesReceived: totalOpportunitiesCount,
    simulationEnabled,
    simulationIntervalMs,
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
  };
}

async function startServer() {
  const app = express();
  app.use(express.json());

  const server = http.createServer(app);

  // Initialize WebSocket server attached to HTTP server
  const wss = new WebSocketServer({ server });

  // Handle WS connections
  wss.on('connection', (ws: WebSocket) => {
    // Send initial history & status
    const initialPayload = JSON.stringify({
      type: 'initial_state',
      opportunities: opportunities.slice(0, 100),
      status: getServerStatus(wss),
    });
    ws.send(initialPayload);

    // Broadcast updated status to all clients
    broadcastStatus(wss);

    ws.on('message', (messageRaw: Buffer) => {
      try {
        const msgStr = messageRaw.toString();
        const parsed = JSON.parse(msgStr);

        // Check if message is a direct ArbOpportunity or wrapped
        if (parsed.id && parsed.sourceMint && parsed.strategy) {
          processAndBroadcastOpportunity(parsed as ArbOpportunity, wss);
          return;
        }

        if (parsed.type === 'post_opportunity' && parsed.opportunity) {
          processAndBroadcastOpportunity(parsed.opportunity, wss);
          return;
        }

        if (parsed.type === 'opportunity' && parsed.data) {
          processAndBroadcastOpportunity(parsed.data, wss);
          return;
        }

        if (parsed.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
          return;
        }

        if (parsed.type === 'clear') {
          opportunities.length = 0;
          const clearedMsg = JSON.stringify({ type: 'cleared' });
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(clearedMsg);
            }
          });
          return;
        }

        if (parsed.type === 'simulation_toggle') {
          simulationEnabled = !!parsed.enabled;
          restartSimulation(wss);
          broadcastStatus(wss);
          return;
        }

        if (parsed.type === 'simulation_speed' && typeof parsed.intervalMs === 'number') {
          simulationIntervalMs = Math.max(200, Math.min(10000, parsed.intervalMs));
          restartSimulation(wss);
          broadcastStatus(wss);
          return;
        }
      } catch (err) {
        console.error('Error handling WS message:', err);
      }
    });

    ws.on('close', () => {
      broadcastStatus(wss);
    });
  });

  function broadcastStatus(wssInstance: WebSocketServer) {
    const statusMsg = JSON.stringify({
      type: 'status_update',
      status: getServerStatus(wssInstance),
    });
    wssInstance.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(statusMsg);
      }
    });
  }

  function restartSimulation(wssInstance: WebSocketServer) {
    if (simulationTimer) {
      clearInterval(simulationTimer);
      simulationTimer = null;
    }

    if (simulationEnabled) {
      simulationTimer = setInterval(() => {
        const opp = generateMockOpportunity();
        processAndBroadcastOpportunity(opp, wssInstance);
      }, simulationIntervalMs);
    }
  }

  // Start background simulator (disabled by default)
  restartSimulation(wss);

  // REST API ENDPOINTS

  // Get current opportunities
  app.get('/api/opportunities', (req, res) => {
    const limit = parseInt(req.query.limit as string) || 200;
    res.json({
      success: true,
      data: opportunities.slice(0, limit),
      status: getServerStatus(wss),
    });
  });

  // Post external opportunity via REST HTTP endpoint
  app.post('/api/opportunities', (req, res) => {
    const oppData = req.body;
    const opp: ArbOpportunity = oppData.id && oppData.sourceMint ? oppData : (oppData.opportunity || oppData.data);
    
    if (!opp || !opp.sourceMint || !opp.strategy) {
      return res.status(400).json({ error: 'Invalid ArbOpportunity schema' });
    }

    if (!opp.id) {
      const sig = opp.trigger?.signature || generateRandomBase58(88);
      opp.id = `${sig}:${opp.sourceMint}`;
    }
    if (!opp.timestamp) opp.timestamp = Date.now();
    if (!opp.detectedAt) opp.detectedAt = new Date().toISOString();

    processAndBroadcastOpportunity(opp, wss);
    res.json({ success: true, id: opp.id });
  });

  // Clear opportunities
  app.delete('/api/opportunities', (req, res) => {
    opportunities.length = 0;
    const clearedMsg = JSON.stringify({ type: 'cleared' });
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(clearedMsg);
      }
    });
    res.json({ success: true, message: 'All opportunities cleared' });
  });

  // Toggle simulation mode
  app.post('/api/simulation/toggle', (req, res) => {
    const { enabled } = req.body;
    simulationEnabled = enabled !== undefined ? !!enabled : !simulationEnabled;
    restartSimulation(wss);
    broadcastStatus(wss);
    res.json({ success: true, simulationEnabled });
  });

  // Change simulation speed
  app.post('/api/simulation/speed', (req, res) => {
    const { intervalMs } = req.body;
    if (typeof intervalMs === 'number' && intervalMs >= 200) {
      simulationIntervalMs = intervalMs;
      restartSimulation(wss);
      broadcastStatus(wss);
      return res.json({ success: true, simulationIntervalMs });
    }
    res.status(400).json({ error: 'Interval must be a number >= 200ms' });
  });

  // Status endpoint
  app.get('/api/status', (req, res) => {
    res.json(getServerStatus(wss));
  });

  // Vite or static serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, HOST, () => {
    console.log(`[Arb Dashboard] Server listening on http://${HOST}:${PORT}`);
    console.log(`[Arb Dashboard] WebSocket endpoint live on ws://${HOST}:${PORT}`);
  });
}

startServer();
