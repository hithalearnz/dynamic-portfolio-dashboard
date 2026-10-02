export type Stock = {
  name: string;
  symbol: string;
  googleSymbol: string;
  yahooFallbackSymbol?: string;

  purchasePrice: number;
  quantity: number;
  exchange: string;
  sector: string;

  cmp: number | null;
  peRatio: number | null;
  latestEarnings: number | null;
};