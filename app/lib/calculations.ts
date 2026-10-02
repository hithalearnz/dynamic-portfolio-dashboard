import type { Stock } from "../types/portfolio";

export function calculateInvestment(stock: Stock): number {
  return stock.purchasePrice * stock.quantity;
}

export function calculatePresentValue(
  stock: Stock
): number | null {
  if (stock.cmp === null) {
    return null;
  }

  return stock.cmp * stock.quantity;
}

export function calculateGainLoss(
  stock: Stock
): number | null {
  const presentValue = calculatePresentValue(stock);

  if (presentValue === null) {
    return null;
  }

  return presentValue - calculateInvestment(stock);
}

export function calculateTotalInvestment(
  stocks: Stock[]
): number {
  return stocks.reduce((total, stock) => {
    return total + calculateInvestment(stock);
  }, 0);
}

export function calculateTotalPresentValue(
  stocks: Stock[]
): number {
  return stocks.reduce((total, stock) => {
    const presentValue = calculatePresentValue(stock);

    if (presentValue === null) {
      return total;
    }

    return total + presentValue;
  }, 0);
}

export function calculateTotalGainLoss(
  stocks: Stock[]
): number {
  return stocks.reduce((total, stock) => {
    const gainLoss = calculateGainLoss(stock);

    if (gainLoss === null) {
      return total;
    }

    return total + gainLoss;
  }, 0);
}

export function calculatePortfolioPercentage(
  stock: Stock,
  totalInvestment: number
): number {
  if (totalInvestment === 0) {
    return 0;
  }

  return (
    (calculateInvestment(stock) / totalInvestment) *
    100
  );
}