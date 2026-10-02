import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

export async function getYahooPrice(
  primarySymbol: string,
  fallbackSymbol?: string
): Promise<number> {
  try {
    const quote = await yahooFinance.quote(primarySymbol);

    if (typeof quote.regularMarketPrice === "number") {
      return quote.regularMarketPrice;
    }
  } catch (error) {
    console.error(`Yahoo primary lookup failed for ${primarySymbol}`, error);
  }

  if (fallbackSymbol) {
    try {
      const fallbackQuote = await yahooFinance.quote(fallbackSymbol);

      if (typeof fallbackQuote.regularMarketPrice === "number") {
        console.log(
          `Using Yahoo fallback ${fallbackSymbol} for ${primarySymbol}`
        );

        return fallbackQuote.regularMarketPrice;
      }
    } catch (error) {
      console.error(`Yahoo fallback lookup failed for ${fallbackSymbol}`, error);
    }
  }

  throw new Error(`CMP unavailable for ${primarySymbol}`);
}