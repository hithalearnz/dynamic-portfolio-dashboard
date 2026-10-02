import * as cheerio from "cheerio";

type GoogleFinanceData = {
  peRatio: number | null;
  latestEarnings: number | null;
};

function parseNumber(value: string): number | null {
  const cleaned = value
    .replace(/₹/g, "")
    .replace(/INR/g, "")
    .replace(/,/g, "")
    .trim();

  const number = Number.parseFloat(cleaned);

  return Number.isFinite(number) ? number : null;
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

/**
 * Find a numeric value near a Google Finance label.
 */
function findValueNearLabel(
  $: cheerio.CheerioAPI,
  labels: string[]
): number | null {
  const normalizedLabels = labels.map(normalizeText);

  const elements = $("body *").toArray();

  for (const element of elements) {
    const elementText = normalizeText($(element).text());

    if (!normalizedLabels.includes(elementText)) {
      continue;
    }

    let current = $(element);

    for (let depth = 0; depth < 5; depth++) {
      current = current.parent();

      if (!current.length) {
        break;
      }

      const children = current.children().toArray();

      for (const child of children) {
        const childText = $(child).text().trim();

        if (!childText) {
          continue;
        }

        if (normalizedLabels.includes(normalizeText(childText))) {
          continue;
        }

        const value = parseNumber(childText);

        if (value !== null) {
          return value;
        }
      }

      const parentText = current
        .text()
        .replace(/\s+/g, " ")
        .trim();

      for (const label of labels) {
        const index = parentText
          .toLowerCase()
          .indexOf(label.toLowerCase());

        if (index === -1) {
          continue;
        }

        const afterLabel = parentText.slice(
          index + label.length
        );

        const match = afterLabel.match(
          /₹?\s*([\d,]+(?:\.\d+)?)/i
        );

        if (match) {
          const value = parseNumber(match[1]);

          if (value !== null) {
            return value;
          }
        }
      }
    }
  }

  return null;
}

/**
 * Google Finance sometimes exposes quarterly EPS in a row like:
 *
 * Earnings per share | 47.23 | 47.34 | 45.38 | 49.42
 *
 * We take the last numeric value because the columns are shown
 * from older quarter to newest quarter.
 */
function findLatestQuarterlyEps(
  pageText: string
): number | null {
  const startIndex = pageText
    .toLowerCase()
    .indexOf("earnings per share");

  if (startIndex === -1) {
    return null;
  }

  const remainingText = pageText.slice(
    startIndex + "earnings per share".length
  );

  const nextSectionMatch = remainingText.search(
    /interest and investment income|interest expense|net interest expenses|depreciation and amortization|ebitda/i
  );

  const rowText =
    nextSectionMatch === -1
      ? remainingText
      : remainingText.slice(0, nextSectionMatch);

  const values = rowText.match(
    /-?\d+(?:,\d{3})*(?:\.\d+)?/g
  );

  if (!values || values.length === 0) {
    return null;
  }

  const latestValue = values[values.length - 1];

  return parseNumber(latestValue);
}

export async function getGoogleFinanceData(
  symbol: string
): Promise<GoogleFinanceData> {
  const url = `https://www.google.com/finance/quote/${encodeURIComponent(
    symbol
  )}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/154.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Google Finance request failed: ${response.status} ${response.statusText}`
    );
  }

  const html = await response.text();

  const $ = cheerio.load(html);

  const pageText = $("body")
    .text()
    .replace(/\s+/g, " ")
    .trim();

  // ==========================================
  // 1. P/E RATIO
  // ==========================================

  let peRatio = findValueNearLabel($, [
    "P/E ratio",
    "P/E",
  ]);

  // Fallback for P/E extraction
  if (peRatio === null) {
    const peMatch = pageText.match(
      /P\/E\s*ratio\s*₹?\s*([\d,]+(?:\.\d+)?)/i
    );

    if (peMatch) {
      peRatio = parseNumber(peMatch[1]);
    }
  }

  // ==========================================
  // 2. LATEST EARNINGS / EPS
  // ==========================================

  let latestEarnings = findValueNearLabel($, [
    "EPS",
  ]);

  // Fallback for the normal EPS field
  if (latestEarnings === null) {
    const cleanedText = pageText.replace(
      /EPS\s*\/\s*Est\.\s*\(INR\).*?(?=Revenue\s*\/\s*Est\.|At a glance|Previous reports|Income statement|$)/i,
      ""
    );

    const epsMatch = cleanedText.match(
      /\bEPS\b\s*₹?\s*(-?\d+(?:,\d{3})*(?:\.\d+)?)/i
    );

    if (epsMatch) {
      latestEarnings = parseNumber(epsMatch[1]);
    }
  }

  // ==========================================
  // 3. QUARTERLY EPS FALLBACK
  // ==========================================

  if (latestEarnings === null) {
    latestEarnings = findLatestQuarterlyEps(
      pageText
    );
  }

  return {
    peRatio,
    latestEarnings,
  };
}