"use client";

import { Expand, Settings, SlidersHorizontal } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

import { FallbackChart } from "@/components/stocks/fallback-chart";
import { TradingViewChart } from "@/components/stocks/trading-view-chart";
import { useStockQuote } from "@/components/stocks/use-stock-quote";
import { Button } from "@/components/ui/button";
import { getEmbeddableTradingViewSymbol } from "@/lib/domain/trading-view";
import { cn } from "@/lib/utils/cn";
import type { StockAsset } from "@/types/stock";

type UpbitStyleChartLayoutProps = {
  compact?: boolean;
  headerSlot?: ReactNode;
  stock: StockAsset;
};

const intervalOptions = [
  { label: "1 phút", value: "1" },
  { label: "30 phút", value: "30" },
  { label: "1 giờ", value: "60" },
  { label: "4 giờ", value: "240" },
  { label: "Ngày", value: "D" },
  { label: "Tuần", value: "W" },
];

const chartTools = [
  { icon: SlidersHorizontal, label: "Chỉ báo" },
  { icon: Settings, label: "Cài đặt" },
  { icon: Expand, label: "Toàn màn hình" },
];

function QuoteStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium text-slate-400">{label}</p>
      <p className="mt-1 truncate text-xs font-semibold text-slate-700 sm:text-sm">
        {value}
      </p>
    </div>
  );
}

function useResponsiveChartHeight(compact?: boolean) {
  const [height, setHeight] = useState(compact ? 390 : 560);

  useEffect(() => {
    const updateHeight = () => {
      const width = window.innerWidth;

      if (width <= 768) {
        setHeight(compact ? 280 : 420);
        return;
      }

      if (width < 1024) {
        setHeight(compact ? 360 : 500);
        return;
      }

      setHeight(compact ? 390 : 560);
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);

    return () => window.removeEventListener("resize", updateHeight);
  }, [compact]);

  return height;
}

export function UpbitStyleChartLayout({
  compact = false,
  headerSlot,
  stock,
}: UpbitStyleChartLayoutProps) {
  const embeddableTradingViewSymbol = getEmbeddableTradingViewSymbol(stock);
  const [activeInterval, setActiveInterval] = useState("1");
  const [chartMode, setChartMode] = useState<"fallback" | "tradingview">("tradingview");
  const quote = useStockQuote(stock);
  const chartSourceLabel = embeddableTradingViewSymbol
    ? `TradingView ${embeddableTradingViewSymbol}`
    : "Tự động hiển thị biểu đồ cơ bản";
  const isPositive = quote.changeRate >= 0;
  const quoteSourceLabel = quote.isLive ? quote.sourceLabel : "Giá mẫu MVP";
  const chartHeight = useResponsiveChartHeight(compact);
  const chartStock = useMemo(
    () => ({
      ...stock,
      changeRate: quote.changeRate,
      price: quote.currentPrice,
    }),
    [quote.changeRate, quote.currentPrice, stock],
  );
  const effectiveChartMode =
    chartMode === "tradingview" && embeddableTradingViewSymbol
      ? "tradingview"
      : "fallback";

  return (
    <section className="upbitChartLayout premium-card overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div
        className={cn(
          "border-b border-slate-200 px-4 sm:px-5",
          compact ? "py-3" : "py-4",
        )}
      >
        <div
          className={cn(
            "flex flex-col xl:flex-row xl:items-start xl:justify-between",
            compact ? "gap-2" : "gap-4",
          )}
        >
          <div className="min-w-0">
            {headerSlot ?? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-950 sm:text-2xl">
                    {stock.displayName}
                  </h2>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                    {quote.displayPair}
                  </span>
                  <span className="text-xs text-slate-400">{stock.market}</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">{chartSourceLabel}</p>
              </>
            )}
          </div>

          <div
            className={cn("xl:text-right", compact && "flex items-end gap-3 xl:block")}
          >
            <p className="text-xs font-medium text-slate-400">{quoteSourceLabel}</p>
            <p
              className={cn(
                "mt-1 font-bold tracking-normal",
                compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl",
                isPositive ? "text-red-500" : "text-blue-500",
              )}
            >
              {quote.currentPrice}
            </p>
            <p
              className={cn(
                "mt-1 text-sm font-semibold",
                isPositive ? "text-red-500" : "text-blue-500",
              )}
            >
              {isPositive ? "▲" : "▼"} {quote.changeRate.toFixed(2)}% {quote.changeAmount}
            </p>
          </div>
        </div>

        <div
          className={cn(
            "grid grid-cols-2 gap-x-4 gap-y-2 border-t border-slate-100 sm:grid-cols-4",
            compact ? "mt-3 pt-2" : "mt-4 pt-3",
          )}
        >
          <QuoteStat label="Cao" value={quote.highPrice} />
          <QuoteStat label="Thấp" value={quote.lowPrice} />
          <QuoteStat label="Khối lượng" value={quote.volume} />
          <QuoteStat label="Giá trị GD" value={quote.turnover} />
        </div>
      </div>

      <div className={cn("space-y-2 p-2.5 sm:p-3", !compact && "space-y-3 sm:p-4")}>
        <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {intervalOptions.map((option) => (
              <Button
                className={cn(
                  "rounded-lg px-2.5 text-xs",
                  compact ? "h-7" : "h-8",
                  activeInterval === option.value
                    ? "bg-slate-950 text-white hover:bg-slate-800"
                    : "bg-white text-slate-600 hover:bg-slate-100",
                )}
                key={option.value}
                onClick={() => setActiveInterval(option.value)}
                type="button"
                variant="ghost"
              >
                {option.label}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5">
            <Button
              className={cn(
                "rounded-lg px-2.5 text-xs",
                compact ? "h-7" : "h-8",
                effectiveChartMode === "fallback"
                  ? "bg-slate-950 text-white hover:bg-slate-800"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
              )}
              onClick={() => setChartMode("fallback")}
              type="button"
              variant="ghost"
            >
              Biểu đồ cơ bản
            </Button>
            <Button
              className={cn(
                "rounded-lg px-2.5 text-xs",
                compact ? "h-7" : "h-8",
                effectiveChartMode === "tradingview"
                  ? "bg-slate-950 text-white hover:bg-slate-800"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                !embeddableTradingViewSymbol &&
                  "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300 hover:bg-slate-50",
              )}
              disabled={!embeddableTradingViewSymbol}
              onClick={() => setChartMode("tradingview")}
              title={
                embeddableTradingViewSymbol
                  ? "Xem biểu đồ TradingView"
                  : "Mã này bị giới hạn nhúng TradingView nên hiển thị biểu đồ cơ bản."
              }
              type="button"
              variant="ghost"
            >
              TradingView
            </Button>
            {chartTools.map((tool) => {
              const Icon = tool.icon;

              return (
                <Button
                  className={cn(
                    "rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-600 hover:bg-slate-50",
                    compact ? "h-7" : "h-8",
                  )}
                  key={tool.label}
                  aria-label={tool.label}
                  title={tool.label}
                  type="button"
                  variant="ghost"
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="sr-only sm:not-sr-only">{tool.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-1.5">
          <div className="mb-1 flex items-center justify-between px-2 text-[11px] font-medium text-slate-400">
            <span>
              {embeddableTradingViewSymbol
                ? "Dữ liệu biểu đồ được hiển thị bằng TradingView hoặc biểu đồ cơ bản."
                : "Mã bị giới hạn nhúng TradingView sẽ tự động hiển thị biểu đồ cơ bản."}
            </span>
            <span className="hidden sm:inline">Không có chức năng đặt lệnh/giao dịch</span>
          </div>
          {effectiveChartMode === "tradingview" ? (
            <TradingViewChart
              height={chartHeight}
              interval={activeInterval}
              stock={chartStock}
              symbol={stock.symbol}
              theme="light"
              variant="embedded"
            />
          ) : (
            <FallbackChart
              height={chartHeight}
              initialInterval={activeInterval}
              stock={chartStock}
              variant="embedded"
            />
          )}
        </div>
      </div>
    </section>
  );
}
