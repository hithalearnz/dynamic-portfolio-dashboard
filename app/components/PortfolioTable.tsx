import type { Stock } from "../types/portfolio";

import {
  calculateGainLoss,
  calculateInvestment,
  calculatePortfolioPercentage,
  calculatePresentValue,
  calculateTotalInvestment,
} from "../lib/calculations";

type PortfolioTableProps = {
  stocks: Stock[];
};

export default function PortfolioTable({
  stocks,
}: PortfolioTableProps) {
  const totalInvestment = calculateTotalInvestment(stocks);

  return (
    <section className="mt-0 w-full min-w-0">
      <div className="mb-5 px-4 pt-4">
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Portfolio Holdings
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Current positions and live market performance.
        </p>
      </div>

      <div className="overflow-hidden rounded-[26px] border border-white/10 bg-slate-950/80 shadow-[0_24px_60px_rgba(2,6,23,0.72)] ring-1 ring-white/5">
        <div className="w-full overflow-x-auto rounded-[26px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <table className="w-full min-w-[1200px] border-separate border-spacing-0 overflow-hidden text-sm">
            <thead className="bg-slate-900/95 backdrop-blur-xl">
              <tr>
                <th className="border-b border-white/10 px-5 py-4 text-left font-semibold text-slate-300">
                  Stock
                </th>
                <th className="border-b border-white/10 px-5 py-4 text-right font-semibold text-slate-300">
                  Purchase Price
                </th>
                <th className="border-b border-white/10 px-5 py-4 text-right font-semibold text-slate-300">
                  Qty
                </th>
                <th className="border-b border-white/10 px-5 py-4 text-right font-semibold text-slate-300">
                  Investment
                </th>
                <th className="border-b border-white/10 px-5 py-4 text-right font-semibold text-slate-300">
                  Portfolio %
                </th>
                <th className="border-b border-white/10 px-5 py-4 text-center font-semibold text-slate-300">
                  Exchange
                </th>
                <th className="border-b border-white/10 px-5 py-4 text-right font-semibold text-slate-300">
                  CMP
                </th>
                <th className="border-b border-white/10 px-5 py-4 text-right font-semibold text-slate-300">
                  Present Value
                </th>
                <th className="border-b border-white/10 px-5 py-4 text-right font-semibold text-slate-300">
                  Gain/Loss
                </th>
                <th className="border-b border-white/10 px-5 py-4 text-right font-semibold text-slate-300">
                  P/E Ratio
                </th>
                <th className="border-b border-white/10 px-5 py-4 text-right font-semibold text-slate-300">
                  Latest Earnings
                </th>
              </tr>
            </thead>

            <tbody>
              {stocks.map((stock) => {
                const investment = calculateInvestment(stock);
                const presentValue = calculatePresentValue(stock);
                const gainLoss = calculateGainLoss(stock);
                const portfolioPercentage = calculatePortfolioPercentage(
                  stock,
                  totalInvestment
                );

                return (
                  <tr
                    key={stock.symbol}
                    className="bg-slate-950/40 transition-colors hover:bg-white/[0.04]"
                  >
                    <td className="border-b border-white/5 px-5 py-4 align-middle">
                      <div>
                        <p className="font-semibold text-white">{stock.name}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{stock.symbol}</p>
                      </div>
                    </td>

                    <td className="border-b border-white/5 px-5 py-4 text-right align-middle text-slate-300">
                      ₹{stock.purchasePrice.toLocaleString("en-IN")}
                    </td>

                    <td className="border-b border-white/5 px-5 py-4 text-right align-middle text-slate-300">
                      {stock.quantity}
                    </td>

                    <td className="border-b border-white/5 px-5 py-4 text-right align-middle font-medium text-slate-100">
                      ₹{investment.toLocaleString("en-IN")}
                    </td>

                    <td className="border-b border-white/5 px-5 py-4 text-right align-middle text-slate-300">
                      {portfolioPercentage.toFixed(2)}%
                    </td>

                    <td className="border-b border-white/5 px-5 py-4 text-center align-middle">
                      <span className="inline-flex rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-300 ring-1 ring-white/10">
                        {stock.exchange}
                      </span>
                    </td>

                    <td className="border-b border-white/5 px-5 py-4 text-right align-middle font-medium text-slate-100">
                      {stock.cmp === null
                        ? "Unavailable"
                        : `₹${stock.cmp.toLocaleString("en-IN")}`}
                    </td>

                    <td className="border-b border-white/5 px-5 py-4 text-right align-middle font-medium text-slate-100">
                      {presentValue === null
                        ? "Unavailable"
                        : `₹${presentValue.toLocaleString("en-IN")}`}
                    </td>

                    <td className="border-b border-white/5 px-5 py-4 text-right align-middle">
                      {gainLoss === null ? (
                        <span className="text-slate-500">Unavailable</span>
                      ) : (
                        <span
                          className={
                            gainLoss >= 0
                              ? "font-semibold text-emerald-400"
                              : "font-semibold text-rose-400"
                          }
                        >
                          {gainLoss >= 0 ? "+" : "-"}₹
                          {Math.abs(gainLoss).toLocaleString("en-IN")}
                        </span>
                      )}
                    </td>

                    <td className="border-b border-white/5 px-5 py-4 text-right align-middle text-slate-300">
                      {stock.peRatio === null
                        ? "Unavailable"
                        : stock.peRatio.toFixed(2)}
                    </td>

                    <td className="border-b border-white/5 px-5 py-4 text-right align-middle text-slate-300">
                      {stock.latestEarnings === null
                        ? "Unavailable"
                        : stock.latestEarnings.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        Swipe horizontally on smaller screens to view all portfolio columns.
      </p>
    </section>
  );
}