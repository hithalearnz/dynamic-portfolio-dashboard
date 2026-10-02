import type { Stock } from "../types/portfolio";

import {
  calculateGainLoss,
  calculateInvestment,
  calculatePresentValue,
} from "../lib/calculations";

type SectorData = {
  investment: number;
  presentValue: number;
  gainLoss: number;
};

type SectorSummaryProps = {
  stocks: Stock[];
};

export default function SectorSummary({
  stocks,
}: SectorSummaryProps) {
  const sectors: Record<string, SectorData> = {};

  stocks.forEach((stock) => {
    const sector = stock.sector;

    if (!sectors[sector]) {
      sectors[sector] = {
        investment: 0,
        presentValue: 0,
        gainLoss: 0,
      };
    }

    sectors[sector].investment +=
      calculateInvestment(stock);

    const presentValue = calculatePresentValue(stock);

    if (presentValue !== null) {
      sectors[sector].presentValue += presentValue;
    }

    const gainLoss = calculateGainLoss(stock);

    if (gainLoss !== null) {
      sectors[sector].gainLoss += gainLoss;
    }
  });

  return (
    <section className="mt-10">


      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {Object.entries(sectors).map(
          ([sector, data]) => (
            <div
              key={sector}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl"
            >
              <h3 className="text-lg font-semibold text-white">
                {sector}
              </h3>
              <p className="text-slate-400">
  Total Investment: ₹
  {data.investment.toLocaleString("en-IN")}
</p>

              <div className="mt-4 space-y-2 text-sm">
                <p className="text-slate-400">
                  Present Value: ₹
                  {data.presentValue.toLocaleString("en-IN")}
                </p>

                <p
                  className={`font-semibold ${
                    data.gainLoss >= 0
  ? "text-emerald-400"
  : "text-red-400"
                  }`}
                >
                  Gain/Loss:{" "}
                  {data.gainLoss >= 0 ? "+" : "-"}₹
                  {Math.abs(data.gainLoss).toLocaleString(
                    "en-IN"
                  )}
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}