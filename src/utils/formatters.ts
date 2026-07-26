export function formatSol(amount: number, decimals: number = 4): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '0.0000 SOL';
  const prefix = amount > 0 ? '+' : '';
  return `${prefix}${amount.toFixed(decimals)} SOL`;
}

export function formatUsd(solAmount: number, solPriceUsd: number = 185): string {
  if (solAmount === undefined || solAmount === null || isNaN(solAmount)) return '$0.00';
  const usd = solAmount * solPriceUsd;
  const prefix = usd > 0 ? '+$' : usd < 0 ? '-$' : '$';
  return `${prefix}${Math.abs(usd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPct(val: number, decimals: number = 2): string {
  if (val === undefined || val === null || isNaN(val)) return '0.00%';
  const prefix = val > 0 ? '+' : '';
  return `${prefix}${val.toFixed(decimals)}%`;
}

export function truncateAddress(addr: string | null | undefined, start: number = 4, end: number = 4): string {
  if (!addr) return 'N/A';
  if (addr.length <= start + end) return addr;
  return `${addr.slice(0, start)}...${addr.slice(-end)}`;
}

export function formatTime(timestamp: number | string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) +
    '.' + date.getMilliseconds().toString().padStart(3, '0');
}

export function formatNumber(num: number, decimals: number = 2): string {
  if (num === undefined || num === null || isNaN(num)) return '0';
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(decimals) + 'B';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(decimals) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(decimals) + 'K';
  return num.toLocaleString(undefined, { maximumFractionDigits: decimals });
}
