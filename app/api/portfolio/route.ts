import { portfolioData } from "../../data/portfolioData";

import {
  getFundamentalsCache,
  getMarketCache,
  setFundamentalsCache,
  setMarketCache,
} from "../../lib/portfolioCache";

import { getGoogleFinanceData } from "../../lib/googleFinance";
import { getYahooPrice } from "../../lib/yahooFinance";

export const runtime = "nodejs";

export async function GET() {
  try {
    const stocks = await Promise.all(
      portfolioData.map(async (stock) => {
        let cmp: number | null = getMarketCache(
          stock.symbol
        );

        let peRatio: number | null = null;
        let latestEarnings: number | null = null;

        const cachedFundamentals =
          getFundamentalsCache(stock.googleSymbol);

        if (cachedFundamentals) {
          peRatio = cachedFundamentals.peRatio;
          latestEarnings =
            cachedFundamentals.latestEarnings;
        }

        const requests: Promise<void>[] = [];

        if (cmp === null) {
          requests.push(
            getYahooPrice(stock.symbol)
              .then((price) => {
                cmp = price;
                setMarketCache(stock.symbol, price);
              })
              .catch((error) => {
                console.error(
                  `Yahoo Finance failed for ${stock.symbol}:`,
                  error
                );
              })
          );
        }

        if (!cachedFundamentals) {
          requests.push(
            getGoogleFinanceData(stock.googleSymbol)
              .then((data) => {
                peRatio = data.peRatio;
                latestEarnings = data.latestEarnings;

                setFundamentalsCache(
                  stock.googleSymbol,
                  peRatio,
                  latestEarnings
                );
              })
              .catch((error) => {
                console.error(
                  `Google Finance failed for ${stock.googleSymbol}:`,
                  error
                );
              })
          );
        }

        await Promise.all(requests);

        return {
          ...stock,
          cmp,
          peRatio,
          latestEarnings,
        };
      })
    );

    return Response.json({
      success: true,
      data: stocks,
    });
  } catch (error) {
    console.error("Portfolio API error:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to fetch portfolio market data",
      },
      { status: 500 }
    );
  }
}