import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Code, Server, Zap } from 'lucide-react';

interface WebSocketDocsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WebSocketDocs: React.FC<WebSocketDocsProps> = ({ isOpen, onClose }) => {
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ws-node' | 'ws-python' | 'http-curl'>('ws-node');

  if (!isOpen) return null;

  const currentHost = window.location.host;
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsEndpoint = 'ws://localhost:8787/ws';
  const httpEndpoint = `${window.location.protocol}//${currentHost}/api/opportunities`;

  const tsCodeSnippet = `import WebSocket from 'ws';

// Connect to local arbitrage dashboard WebSocket server
const ws = new WebSocket('${wsEndpoint}');

ws.on('open', () => {
  console.log('Connected to Solana Arb Dashboard!');

  const opportunity = {
    id: 'txSig1234567:DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    timestamp: Date.now(),
    detectedAt: new Date().toISOString(),
    strategy: 'pumpswap-meteora-two-leg',
    sourceMint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    tokenSymbol: 'BONK',
    targetMint: 'So11111111111111111111111111111111111111112',
    poolIn: 'buyPoolAmmKey...',
    poolOut: 'sellPoolAmmKey...',
    dexIn: 'PumpSwap',
    dexOut: 'Meteora DLMM',
    buyAmount: 5.0,
    tokenAmount: 185000000,
    sellAmount: 5.12,
    buyPrice: 0.00002702,
    sellPrice: 0.00002767,
    spreadPct: 2.40,
    priceImpactInPct: 0.12,
    priceImpactOutPct: 0.18,
    grossPnl: 0.12,
    arbPnl: 0.1149,
    costs: {
      jitoTipSol: 0.005,
      priorityFeeSol: 0.0001,
      slippageBps: 50
    },
    trigger: {
      signature: '5K9A3X8q1mZ7pL2vR8wY4tN6bC1dE3fG5hJ7kM9nP2qR4sT6uV8wX0yZ2aB4cD6e',
      sellSizeSol: 5.0,
      txSigner: 'Gk3123123123123123123123123123123123123pump',
      pumpswapPool: 'bonk_pump_pool'
    }
  };

  // Broadcast opportunity to dashboard
  ws.send(JSON.stringify(opportunity));
});`;

  const pythonCodeSnippet = `import asyncio
import json
import websockets
import time

async function push_opportunity():
    uri = "${wsEndpoint}"
    async with websockets.connect(uri) as websocket:
        opp = {
            "id": "sig_python:token_mint",
            "timestamp": int(time.time() * 1000),
            "detectedAt": "2026-07-23T22:46:53Z",
            "strategy": "pumpswap-meteora-two-leg",
            "sourceMint": "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcJM",
            "tokenSymbol": "WIF",
            "targetMint": "So11111111111111111111111111111111111111112",
            "poolIn": "amm_in",
            "poolOut": "amm_out",
            "dexIn": "PumpSwap",
            "dexOut": "Meteora DLMM",
            "buyAmount": 10.0,
            "tokenAmount": 5000,
            "sellAmount": 10.35,
            "buyPrice": 0.002,
            "sellPrice": 0.00207,
            "spreadPct": 3.5,
            "priceImpactInPct": 0.1,
            "priceImpactOutPct": 0.1,
            "grossPnl": 0.35,
            "arbPnl": 0.3449,
            "costs": {
                "jitoTipSol": 0.005,
                "priorityFeeSol": 0.0001,
                "slippageBps": 50
            },
            "trigger": {
                "signature": "sig_wif_123",
                "sellSizeSol": 10.0,
                "txSigner": None,
                "pumpswapPool": None
            }
        }
        await websocket.send(json.dumps(opp))

asyncio.run(push_opportunity())`;

  const curlSnippet = `curl -X POST "${httpEndpoint}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "id": "curl_sig_123:token_mint",
    "timestamp": ${Date.now()},
    "detectedAt": "${new Date().toISOString()}",
    "strategy": "pumpswap-meteora-two-leg",
    "sourceMint": "7GCihgB12FuLio2oEYP31iJ8BkRZg3yPD97TijVKpump",
    "tokenSymbol": "POPCAT",
    "targetMint": "So11111111111111111111111111111111111111112",
    "poolIn": "pool_in_key",
    "poolOut": "pool_out_key",
    "dexIn": "PumpSwap",
    "dexOut": "Meteora DLMM",
    "buyAmount": 2.5,
    "tokenAmount": 12500,
    "sellAmount": 2.62,
    "buyPrice": 0.0002,
    "sellPrice": 0.0002096,
    "spreadPct": 4.8,
    "priceImpactInPct": 0.08,
    "priceImpactOutPct": 0.12,
    "grossPnl": 0.12,
    "arbPnl": 0.1149,
    "costs": {
      "jitoTipSol": 0.005,
      "priorityFeeSol": 0.0001,
      "slippageBps": 50
    },
    "trigger": {
      "signature": "curl_test_sig",
      "sellSizeSol": 2.5,
      "txSigner": null,
      "pumpswapPool": null
    }
  }'`;

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTab(id);
    setTimeout(() => setCopiedTab(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0B]/85 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-mono">
      <div 
        className="bg-[#0F0F11] border border-gray-800 rounded max-w-3xl w-full shadow-2xl overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-800 bg-[#141416] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              WEBSOCKET_STREAM_INTEGRATION_DOCS
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Endpoint Specs */}
        <div className="p-4 border-b border-gray-800 bg-[#0A0A0B] space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
            <div className="bg-[#141416] p-2.5 border border-gray-800">
              <span className="text-gray-500 block mb-0.5">WEBSOCKET_ENDPOINT:</span>
              <span className="text-green-400 font-bold">{wsEndpoint}</span>
            </div>
            <div className="bg-[#141416] p-2.5 border border-gray-800">
              <span className="text-gray-500 block mb-0.5">REST_HTTP_API:</span>
              <span className="text-purple-400 font-bold">{httpEndpoint}</span>
            </div>
          </div>
        </div>

        {/* Code Snippets Selector */}
        <div className="flex border-b border-gray-800 bg-[#0A0A0B] px-4 text-xs">
          <button
            onClick={() => setActiveTab('ws-node')}
            className={`py-2 px-3 text-[10px] font-bold border-b-2 transition-colors ${
              activeTab === 'ws-node'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            NODE.JS (ws)
          </button>
          <button
            onClick={() => setActiveTab('ws-python')}
            className={`py-2 px-3 text-[10px] font-bold border-b-2 transition-colors ${
              activeTab === 'ws-python'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            PYTHON (websockets)
          </button>
          <button
            onClick={() => setActiveTab('http-curl')}
            className={`py-2 px-3 text-[10px] font-bold border-b-2 transition-colors ${
              activeTab === 'http-curl'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            CURL / REST
          </button>
        </div>

        {/* Code View */}
        <div className="p-4 bg-[#0A0A0B] relative">
          <button
            onClick={() => {
              const snippet = activeTab === 'ws-node' ? tsCodeSnippet : activeTab === 'ws-python' ? pythonCodeSnippet : curlSnippet;
              handleCopy(snippet, activeTab);
            }}
            className="absolute top-6 right-6 px-2 py-1 bg-[#141416] hover:bg-gray-800 text-gray-300 text-[10px] rounded border border-gray-800 flex items-center gap-1 transition-colors z-10"
          >
            {copiedTab === activeTab ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedTab === activeTab ? 'COPIED' : 'COPY_CODE'}</span>
          </button>

          <pre className="p-3 bg-[#0F0F11] border border-gray-800 text-[10px] text-gray-300 overflow-x-auto max-h-80 font-mono">
            {activeTab === 'ws-node' && tsCodeSnippet}
            {activeTab === 'ws-python' && pythonCodeSnippet}
            {activeTab === 'http-curl' && curlSnippet}
          </pre>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-800 bg-[#141416] flex justify-end font-mono">
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
