# Dynamic Portfolio Dashboard

A full-stack portfolio dashboard built with Next.js, React, TypeScript, Tailwind CSS, Node.js runtime API routes, Yahoo Finance market data, and Google Finance fundamentals.

The dashboard reads the portfolio holdings from structured data based on the supplied Excel sheet and displays current portfolio metrics.

## Features

- Portfolio table with:
  - Stock name
  - Purchase price
  - Quantity
  - Investment
  - Portfolio percentage
  - NSE/BSE exchange
  - CMP
  - Present value
  - Gain/Loss
  - P/E ratio
  - Latest earnings
- Automatic refresh every 15 seconds
- Manual `Refresh now` action
- Live-data status and countdown
- Last-updated timestamp
- Sector-wise summaries
- Green/red Gain/Loss indicators
- Responsive horizontal scrolling for the wide portfolio table
- Loading and error states
- Graceful handling of unavailable market/fundamental data
- In-memory caching to reduce repeated external requests

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Node.js runtime API routes
- `yahoo-finance2`
- Cheerio

## Data Sources

### Yahoo Finance

Yahoo Finance is used for Current Market Price (CMP).

The project uses the unofficial `yahoo-finance2` package because Yahoo Finance does not provide a public official API for this use case.

For Indian listings, Yahoo symbols are mapped using `.NS` for NSE and `.BO` for BSE. Where required, a fallback NSE symbol is used when the primary BSE quote does not return a usable market price.

### Google Finance

Google Finance is used for:

- P/E Ratio
- Latest Earnings

The project retrieves the Google Finance page server-side and parses the relevant values.

For the Latest Earnings column, the implementation uses the EPS value exposed by Google Finance. The parser also includes a quarterly EPS fallback for pages where the main EPS statistic is not directly available.

Because these are unofficial/scraped data sources, values can occasionally be unavailable or change as the source pages change.

## Project Structure

```text
app/
├── api/
│   └── portfolio/
│       └── route.ts
├── components/
│   ├── PortfolioDashboard.tsx
│   ├── PortfolioTable.tsx
│   ├── SectorSummary.tsx
│   └── SummaryCard.tsx
├── data/
│   └── portfolioData.ts
├── lib/
│   ├── calculations.ts
│   ├── googleFinance.ts
│   ├── portfolioCache.ts
│   └── yahooFinance.ts
└── types/
    └── portfolio.ts
```

## Calculation Logic

### Investment

```text
Investment = Purchase Price × Quantity
```

### Present Value

```text
Present Value = CMP × Quantity
```

### Gain/Loss

```text
Gain/Loss = Present Value − Investment
```

### Portfolio Percentage

```text
Portfolio % = (Investment / Total Investment) × 100
```

These calculations are kept in `app/lib/calculations.ts` so that the calculation logic is separate from the UI components.

## API Flow

The dashboard requests:

```text
GET /api/portfolio
```

The API route:

1. Loads the portfolio holdings.
2. Checks the CMP cache.
3. Fetches Yahoo Finance CMP data when the cache is expired or missing.
4. Checks the Google Finance fundamentals cache.
5. Fetches P/E and EPS data when needed.
6. Combines the source data with the portfolio record.
7. Returns a structured JSON response.

Example response shape:

```json
{
  "success": true,
  "data": [
    {
      "name": "HDFC Bank",
      "symbol": "HDFCBANK.NS",
      "purchasePrice": 1490,
      "quantity": 50,
      "exchange": "NSE",
      "sector": "Financial Sector",
      "cmp": 721.2,
      "peRatio": 14.08,
      "latestEarnings": 51.21
    }
  ]
}
```

## Refresh and Caching Strategy

The frontend refreshes the portfolio every 15 seconds.

The backend uses separate in-memory caches:

- Market/CMP cache: 15 seconds
- Google Finance fundamentals cache: 5 minutes

This avoids requesting fundamentals on every 15-second refresh and helps reduce unnecessary calls to unofficial external sources.

The cache is process-local and is intended for this assignment/demo rather than a multi-instance production cache.

## Error Handling

The project handles failures without breaking the dashboard.

Examples:

- If Yahoo does not return a CMP, the stock displays `Unavailable`.
- If Google Finance does not expose P/E or EPS, those fields display `Unavailable`.
- If the portfolio API itself fails, the dashboard shows an error state with a retry action.
- Individual source failures do not prevent other holdings from being returned.

## Responsive Design

The dashboard uses responsive Tailwind layouts.

Summary cards and sector cards stack on smaller screens, while the wide portfolio table uses horizontal scrolling so all required columns remain accessible on mobile-sized screens.

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### Test the portfolio API

Open:

```text
http://localhost:3000/api/portfolio
```

### Production build

```bash
npm run build
```

## Deployment

The application can be deployed to Vercel.

The portfolio API uses a Node.js runtime because it performs server-side requests to Yahoo Finance and Google Finance.

No API keys are required by the current implementation.

## Known Limitations

- Yahoo Finance and Google Finance are unofficial/scraped data sources for this implementation.
- External page structure can change and may require parser updates.
- Some individual securities may not return market or fundamental data and are shown as `Unavailable`.
- In-memory caching is local to the running application process.
- Market data may be delayed or differ slightly from other market-data providers.

## Assignment Alignment

The implementation covers the requested areas from the supplied assignment:

- Next.js / React application
- TypeScript and Tailwind CSS
- Yahoo Finance CMP integration
- Google Finance P/E and latest-earnings integration
- Portfolio calculations
- 15-second dynamic updates
- Gain/Loss visual indicators
- Sector grouping and summaries
- Async data fetching
- Caching and rate-limit considerations
- Error handling
- Responsive UI
- README and technical documentation deliverables

## Future Improvements

Possible production improvements include:

- Redis or another shared cache for multiple application instances
- A more resilient market-data provider
- Background refresh jobs
- More structured source validation
- Authentication and user-specific portfolios
- Historical performance charts
