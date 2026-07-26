import React, { useState } from 'react';
import { X, Send, Sparkles, Check } from 'lucide-react';
import { ArbOpportunity } from '../types';

interface PayloadTesterProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitOpportunity: (opp: ArbOpportunity) => void;
}

export const PayloadTester: React.FC<PayloadTesterProps> = ({
  isOpen,
  onClose,
  onSubmitOpportunity,
}) => {
  const [tokenSymbol, setTokenSymbol] = useState('BONK');
  const [sourceMint, setSourceMint] = useState('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263');
  const [strategy, setStrategy] = useState('pumpswap-meteora-two-leg');
  const [tradeSol, setTradeSol] = useState(5.0);
  const [spreadPct, setSpreadPct] = useState(2.85);
  const [jitoTipSol, setJitoTipSol] = useState(0.005);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const buyPrice = 0.000025;
    const sellPrice = buyPrice * (1 + spreadPct / 100);
    const tokenAmount = Math.floor(tradeSol / buyPrice);
    const solOut = tokenAmount * sellPrice;
    const grossProfitSol = solOut - tradeSol;
    const priorityFeeSol = 0.0001;
    const netProfitSol = grossProfitSol - (jitoTipSol + priorityFeeSol);

    const randomSig = Array.from({ length: 88 }, () =>
      '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'[Math.floor(Math.random() * 58)]
    ).join('');

    const opp: ArbOpportunity = {
      id: `${randomSig.slice(0, 16)}:${sourceMint.slice(0, 8)}`,
      timestamp: Date.now(),
      detectedAt: new Date().toISOString(),
      strategy,
      sourceMint,
      tokenSymbol,
      targetMint: 'So11111111111111111111111111111111111111112',
      poolIn: 'custom_test_pool_in',
      poolOut: 'custom_test_pool_out',
      dexIn: 'PumpSwap',
      dexOut: 'Meteora DLMM',
      buyAmount: Number(tradeSol),
      tokenAmount,
      sellAmount: Number(solOut.toFixed(6)),
      buyPrice,
      sellPrice: Number(sellPrice.toFixed(8)),
      spreadPct: Number(spreadPct),
      priceImpactInPct: 0.1,
      priceImpactOutPct: 0.15,
      grossPnl: Number(grossProfitSol.toFixed(6)),
      arbPnl: Number(netProfitSol.toFixed(6)),
      costs: {
        jitoTipSol: Number(jitoTipSol),
        priorityFeeSol,
        slippageBps: 50,
      },
      trigger: {
        signature: randomSig,
        sellSizeSol: Number(tradeSol),
        txSigner: null,
        pumpswapPool: null,
      },
    };

    onSubmitOpportunity(opp);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0B]/85 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-mono">
      <div 
        className="bg-[#0F0F11] border border-gray-800 rounded max-w-md w-full shadow-2xl overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3.5 border-b border-gray-800 bg-[#141416] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              INJECT_TEST_PAYLOAD
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded hover:bg-gray-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-[11px] font-mono">
          <div>
            <label className="text-gray-500 block mb-0.5 text-[10px] font-bold uppercase">TOKEN_SYMBOL:</label>
            <input
              type="text"
              value={tokenSymbol}
              onChange={(e) => setTokenSymbol(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#0A0A0B] border border-gray-800 rounded text-white focus:outline-none focus:border-purple-500 font-mono"
              required
            />
          </div>

          <div>
            <label className="text-gray-500 block mb-0.5 text-[10px] font-bold uppercase">SOURCE_MINT_ADDRESS:</label>
            <input
              type="text"
              value={sourceMint}
              onChange={(e) => setSourceMint(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#0A0A0B] border border-gray-800 rounded text-white focus:outline-none focus:border-purple-500 font-mono"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-gray-500 block mb-0.5 text-[10px] font-bold uppercase">TRADE_SIZE_SOL:</label>
              <input
                type="number"
                step="0.1"
                value={tradeSol}
                onChange={(e) => setTradeSol(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-[#0A0A0B] border border-gray-800 rounded text-white focus:outline-none focus:border-purple-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="text-gray-500 block mb-0.5 text-[10px] font-bold uppercase">SPREAD_PCT:</label>
              <input
                type="number"
                step="0.01"
                value={spreadPct}
                onChange={(e) => setSpreadPct(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-[#0A0A0B] border border-gray-800 rounded text-white focus:outline-none focus:border-purple-500 font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-gray-500 block mb-0.5 text-[10px] font-bold uppercase">JITO_TIP_SOL:</label>
            <input
              type="number"
              step="0.001"
              value={jitoTipSol}
              onChange={(e) => setJitoTipSol(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 bg-[#0A0A0B] border border-gray-800 rounded text-white focus:outline-none focus:border-purple-500 font-mono"
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 bg-gray-800 text-gray-300 hover:text-white font-bold text-[10px] rounded transition-colors uppercase"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] rounded flex items-center gap-1.5 transition-colors uppercase"
            >
              {submitted ? <Check className="w-3.5 h-3.5 text-green-300" /> : <Send className="w-3.5 h-3.5" />}
              <span>{submitted ? 'INJECTED' : 'EMIT_FRAME'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
