"use client";

import { CandlestickChart } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { FallbackChart } from "@/components/stocks/fallback-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getEmbeddableTradingViewSymbol,
  getEmbeddableTradingViewSymbolBySymbol,
} from "@/lib/domain/trading-view";
import type { StockAsset } from "@/types/stock";

type TradingViewChartProps = {
  height?: number;
  interval?: string;
  stock?: StockAsset;
  symbol: string;
  theme?: "light" | "dark";
  variant?: "card" | "embedded";
};

const TRADING_VIEW_SCRIPT_URL =
  "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";

function TradingViewLoadingSkeleton({ height }: { height: number }) {
  const candleBars = [
    { color: "#fca5a5", height: 48, marginTop: 40 },
    { color: "#93c5fd", height: 64, marginTop: 24 },
    { color: "#fca5a5", height: 80, marginTop: 12 },
    { color: "#fca5a5", height: 56, marginTop: 32 },
    { color: "#93c5fd", height: 96, marginTop: 4 },
    { color: "#fca5a5", height: 72, marginTop: 20 },
    { color: "#93c5fd", height: 48, marginTop: 44 },
    { color: "#fca5a5", height: 80, marginTop: 16 },
    { color: "#fca5a5", height: 64, marginTop: 28 },
    { color: "#93c5fd", height: 96, marginTop: 8 },
    { color: "#fca5a5", height: 56, marginTop: 36 },
    { color: "#93c5fd", height: 72, marginTop: 20 },
  ];

  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-lg bg-white"
      aria-live="polite"
      style={{ minHeight: height }}
    >
      <div className="flex h-full flex-col p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-slate-900">Đang tải biểu đồ</p>
            <p className="mt-1 text-xs text-slate-400">
              Đang chuẩn bị widget TradingView.
            </p>
          </div>
          <div className="h-2.5 w-24 animate-pulse rounded-full bg-slate-100" />
        </div>

        <div className="relative mt-4 flex-1 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <div className="absolute inset-x-4 top-1/4 h-px bg-slate-200/80" />
          <div className="absolute inset-x-4 top-1/2 h-px bg-slate-200/80" />
          <div className="absolute inset-x-4 top-3/4 h-px bg-slate-200/80" />
          <div className="flex h-[70%] items-start justify-between gap-2">
            {candleBars.map((bar, index) => (
              <div className="flex flex-1 justify-center" key={`${bar.height}-${index}`}>
                <div
                  className="flex flex-col items-center"
                  style={{ marginTop: bar.marginTop }}
                >
                  <div className="h-9 w-px rounded-full bg-slate-300" />
                  <div
                    className="w-3 animate-pulse rounded-sm opacity-70"
                    style={{ backgroundColor: bar.color, height: bar.height }}
                  />
                  <div className="h-8 w-px rounded-full bg-slate-300" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex h-[18%] items-end justify-between gap-2">
            {Array.from({ length: 18 }).map((_, index) => (
              <div
                className="flex-1 animate-pulse rounded-t bg-slate-200"
                key={index}
                style={{ height: `${26 + ((index * 11) % 58)}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TradingViewChart({
  height = 520,
  interval = "15",
  stock,
  symbol,
  theme = "light",
  variant = "card",
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [widgetReady, setWidgetReady] = useState(false);
  const tradingViewSymbol = useMemo(() => {
    return stock
      ? getEmbeddableTradingViewSymbol(stock)
      : getEmbeddableTradingViewSymbolBySymbol(symbol);
  }, [stock, symbol]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container || !tradingViewSymbol) {
      return;
    }

    setLoadFailed(false);
    setWidgetReady(false);
    container.innerHTML = "";

    const widgetElement = document.createElement("div");
    widgetElement.className = "tradingview-widget-container__widget";
    widgetElement.style.height = "100%";
    widgetElement.style.width = "100%";

    const scriptElement = document.createElement("script");
    scriptElement.type = "text/javascript";
    scriptElement.src = TRADING_VIEW_SCRIPT_URL;
    scriptElement.async = true;
    scriptElement.innerHTML = JSON.stringify({
      allow_symbol_change: true,
      autosize: true,
      backgroundColor: theme === "light" ? "#ffffff" : "#05070b",
      calendar: false,
      details: false,
      gridColor:
        theme === "light" ? "rgba(15, 23, 42, 0.06)" : "rgba(255, 255, 255, 0.06)",
      hide_legend: false,
      hide_side_toolbar: false,
      hide_top_toolbar: false,
      hide_volume: false,
      hotlist: false,
      interval,
      locale: "ko",
      save_image: false,
      style: "1",
      studies: [],
      support_host: "https://www.tradingview.com",
      symbol: tradingViewSymbol,
      theme,
      timezone: "Asia/Seoul",
      withdateranges: true,
    });

    const fallbackTimerId = window.setTimeout(() => setLoadFailed(true), 12000);
    let readyTimerId: number | null = null;

    scriptElement.onload = () => {
      window.clearTimeout(fallbackTimerId);
      readyTimerId = window.setTimeout(() => setWidgetReady(true), 900);
    };
    scriptElement.onerror = () => {
      window.clearTimeout(fallbackTimerId);
      setLoadFailed(true);
    };

    container.appendChild(widgetElement);
    container.appendChild(scriptElement);

    return () => {
      window.clearTimeout(fallbackTimerId);
      if (readyTimerId) {
        window.clearTimeout(readyTimerId);
      }
      container.innerHTML = "";
    };
  }, [interval, theme, tradingViewSymbol]);

  if ((!tradingViewSymbol || loadFailed) && stock) {
    return (
      <FallbackChart
        height={height}
        initialInterval={interval}
        stock={stock}
        variant={variant === "embedded" ? "embedded" : "card"}
      />
    );
  }

  if (!tradingViewSymbol || loadFailed) {
    return null;
  }

  const widget = (
    <div
      className="relative overflow-hidden rounded-lg border border-slate-200 bg-white"
      style={{ height }}
    >
      <div
        ref={containerRef}
        className={`tradingview-widget-container h-full w-full transition-opacity duration-500 ${
          widgetReady ? "opacity-100" : "opacity-0"
        }`}
        data-tradingview-symbol={tradingViewSymbol}
      />
      {!widgetReady ? <TradingViewLoadingSkeleton height={height} /> : null}
    </div>
  );

  if (variant === "embedded") {
    return (
      <div className="space-y-2">
        {widget}
        <p className="px-1 text-xs leading-5 text-slate-400">
          Sử dụng widget miễn phí của TradingView. Không cung cấp chức năng đặt lệnh hoặc giao dịch.
        </p>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden bg-white">
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-slate-950">
            <CandlestickChart className="h-5 w-5 text-slate-500" aria-hidden="true" />
            Biểu đồ TradingView
          </CardTitle>
          <div className="text-xs text-slate-500">{tradingViewSymbol}</div>
        </div>
      </CardHeader>
      <CardContent>
        {widget}
        <p className="mt-3 text-xs leading-5 text-slate-400">
          Sử dụng widget miễn phí của TradingView. Không cung cấp chức năng đặt lệnh hoặc giao dịch.
        </p>
      </CardContent>
    </Card>
  );
}
