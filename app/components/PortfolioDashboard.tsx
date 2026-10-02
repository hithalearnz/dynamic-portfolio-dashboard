"use client";

import { useEffect, useState } from "react";

import type { Stock } from "../types/portfolio";

import SummaryCard from "./SummaryCard";
import PortfolioTable from "./PortfolioTable";
import SectorSummary from "./SectorSummary";

import {
  calculateTotalGainLoss,
  calculateTotalInvestment,
  calculateTotalPresentValue,
} from "../lib/calculations";

export default function PortfolioDashboard() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(15);

  async function fetchPortfolio(isRefresh = false) {
    try {
      if (isRefresh) {
        setRefreshing(true);
      }

      const response = await fetch("/api/portfolio", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch portfolio");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.message || "Failed to load portfolio"
        );
      }

      setStocks(result.data);
      setLastUpdated(new Date());
      setSecondsUntilRefresh(15);
      setError("");
    } catch (error) {
      console.error("Portfolio fetch error:", error);

      setError("Unable to load portfolio data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    const initialLoadTimeoutId = setTimeout(() => {
      void fetchPortfolio();
    }, 0);

    const intervalId = setInterval(() => {
      void fetchPortfolio(true);
    }, 15000);

    const countdownId = setInterval(() => {
      setSecondsUntilRefresh((previous) =>
        previous <= 1 ? 15 : previous - 1
      );
    }, 1000);

    return () => {
      clearTimeout(initialLoadTimeoutId);
      clearInterval(intervalId);
      clearInterval(countdownId);
    };
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="text-center">
          <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />

          <h1 className="text-xl font-semibold text-white">
            Loading portfolio
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Fetching the latest market data...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="w-full max-w-md rounded-3xl border border-red-500/20 bg-slate-900 p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-xl text-red-400">
            !
          </div>

          <h1 className="mt-5 text-xl font-semibold text-white">
            Something went wrong
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            {error}
          </p>

          <button
            type="button"
            onClick={() => fetchPortfolio(true)}
            className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 active:scale-[0.98]"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  const totalInvestment = calculateTotalInvestment(stocks);
  const currentValue = calculateTotalPresentValue(stocks);
  const totalGainLoss = calculateTotalGainLoss(stocks);

  const availableCmpCount = stocks.filter(
    (stock) => stock.cmp !== null
  ).length;

  const availableFundamentalsCount = stocks.filter(
    (stock) =>
      stock.peRatio !== null ||
      stock.latestEarnings !== null
  ).length;

  const gainLossPercentage =
    totalInvestment === 0
      ? 0
      : (totalGainLoss / totalInvestment) * 100;

  function formatCurrency(value: number): string {
    return `₹${value.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  }

  function formatGainLoss(value: number): string {
    if (value >= 0) {
      return `+₹${value.toLocaleString("en-IN", {
        maximumFractionDigits: 2,
      })}`;
    }

    return `-₹${Math.abs(value).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-80 w-80 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute right-[-10%] top-[20%] h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        {/* ============================= */}
        {/* HEADER */}
        {/* ============================= */}

        <header className="mb-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                Investment Overview
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Portfolio Dashboard
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                Monitor portfolio performance with live market prices,
                valuation metrics, and sector-level performance.
              </p>
            </div>

            {/* Live status */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </span>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      Market Data
                    </p>

                    <p className="text-sm font-semibold text-emerald-400">
                      Live
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                      refreshing
                        ? "bg-blue-500/10 text-blue-400"
                        : "bg-white/5 text-slate-300"
                    }`}
                  >
                    <span
                      className={
                        refreshing
                          ? "inline-block animate-spin"
                          : ""
                      }
                    >
                      ↻
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      Next refresh
                    </p>

                    <p className="text-sm font-semibold text-white">
                      {secondsUntilRefresh}s
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => fetchPortfolio(true)}
                disabled={refreshing}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {refreshing ? "Refreshing..." : "Refresh now"}
              </button>
            </div>
          </div>

          {/* Last update + coverage */}
          <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {lastUpdated && (
                <span>
                  Last updated{" "}
                  <span className="font-medium text-slate-400">
                    {lastUpdated.toLocaleTimeString("en-IN")}
                  </span>
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
                {stocks.length} holdings
              </span>

              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
                {availableCmpCount}/{stocks.length} CMP available
              </span>

              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
                {availableFundamentalsCount}/{stocks.length} fundamentals available
              </span>
            </div>
          </div>
        </header>

        {/* ============================= */}
        {/* SUMMARY CARDS */}
        {/* ============================= */}

        <section className="mb-10">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white">
              Portfolio Summary
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current portfolio valuation at a glance.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <SummaryCard
              title="Total Investment"
              value={formatCurrency(totalInvestment)}
            />

            <SummaryCard
              title="Current Value"
              value={formatCurrency(currentValue)}
            />

            <SummaryCard
              title="Total Gain/Loss"
              value={formatGainLoss(totalGainLoss)}
            />
          </div>

          {/* Performance strip */}
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Return
              </p>

              <p
                className={`mt-2 text-xl font-bold ${
                  gainLossPercentage >= 0
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {gainLossPercentage >= 0 ? "+" : ""}
                {gainLossPercentage.toFixed(2)}%
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Holdings
              </p>

              <p className="mt-2 text-xl font-bold text-white">
                {stocks.length}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Data Refresh
              </p>

              <p className="mt-2 text-xl font-bold text-white">
                15 sec
              </p>
            </div>
          </div>
        </section>

        {/* ============================= */}
        {/* PORTFOLIO TABLE */}
        {/* ============================= */}

        <section className="mb-10">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            {/* heading area */}
          </div>

          <div className="rounded-[26px] border border-white/10 bg-slate-950/80 shadow-[0_24px_60px_rgba(2,6,23,0.72)] ring-1 ring-white/5">
            <PortfolioTable stocks={stocks} />
          </div>
        </section>

        {/* ============================= */}
        {/* SECTOR SUMMARY */}
        {/* ============================= */}

        <section className="pb-10">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white">
              Sector Summary
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Investment, present value, and gain/loss grouped by sector.
            </p>
          </div>

          <SectorSummary stocks={stocks} />
        </section>

        {/* ============================= */}
        {/* FOOTER */}
        {/* ============================= */}

        <footer className="border-t border-white/10 pt-6">
          <div className="flex flex-col gap-2 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Portfolio Dashboard
            </p>

            <p>
              Market data may be subject to source availability and delays.
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}