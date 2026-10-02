type MarketCache = {
  cmp: number;
  timestamp: number;
};

type FundamentalsCache = {
  peRatio: number | null;
  latestEarnings: number | null;
  timestamp: number;
};

const marketCache = new Map<string, MarketCache>();
const fundamentalsCache = new Map<
  string,
  FundamentalsCache
>();

const MARKET_CACHE_DURATION = 15 * 1000;
const FUNDAMENTALS_CACHE_DURATION = 5 * 60 * 1000;

export function getMarketCache(
  symbol: string
): number | null {
  const cached = marketCache.get(symbol);

  if (!cached) {
    return null;
  }

  if (Date.now() - cached.timestamp > MARKET_CACHE_DURATION) {
    marketCache.delete(symbol);
    return null;
  }

  return cached.cmp;
}

export function setMarketCache(
  symbol: string,
  cmp: number
): void {
  marketCache.set(symbol, {
    cmp,
    timestamp: Date.now(),
  });
}

export function getFundamentalsCache(
  googleSymbol: string
): {
  peRatio: number | null;
  latestEarnings: number | null;
} | null {
  const cached = fundamentalsCache.get(googleSymbol);

  if (!cached) {
    return null;
  }

  if (
    Date.now() - cached.timestamp >
    FUNDAMENTALS_CACHE_DURATION
  ) {
    fundamentalsCache.delete(googleSymbol);
    return null;
  }

  return {
    peRatio: cached.peRatio,
    latestEarnings: cached.latestEarnings,
  };
}

export function setFundamentalsCache(
  googleSymbol: string,
  peRatio: number | null,
  latestEarnings: number | null
): void {
  fundamentalsCache.set(googleSymbol, {
    peRatio,
    latestEarnings,
    timestamp: Date.now(),
  });
}