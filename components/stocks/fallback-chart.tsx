"use client";

import { BarChart3, CandlestickChart, LineChart } from "lucide-react";
import { useMemo, useState, useSyncExternalStore } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import type { StockAsset } from "@/types/stock";

type FallbackChartProps = {
  height?: number;
  initialInterval?: string;
  stock: StockAsset;
  variant?: "card" | "embedded";
};

type ChartInterval = "1S" | "1" | "5" | "15" | "30" | "60" | "240" | "1D" | "1W" | "1M";

type MockCandle = {
  close: number;
  high: number;
  low: number;
  ma: number | null;
  open: number;
  time: string;
  volume: number;
};

const intervalOptions: { label: string; value: ChartInterval }[] = [
  { label: "1 giây", value: "1S" },
  { label: "1 phút", value: "1" },
  { label: "5 phút", value: "5" },
  { label: "15 phút", value: "15" },
  { label: "30 phút", value: "30" },
  { label: "1 giờ", value: "60" },
  { label: "4 giờ", value: "240" },
  { label: "Ngày", value: "1D" },
  { label: "Tuần", value: "1W" },
  { label: "Tháng", value: "1M" },
];

const chart = {
  height: 360,
  priceHeight: 230,
  volumeHeight: 62,
  volumeY: 272,
  width: 760,
  x: 48,
  y: 24,
};

function subscribeToClientSnapshot() {
  return () => {};
}

function normalizeInterval(interval?: string): ChartInterval {
  if (interval === "D") {
    return "1D";
  }

  if (interval === "W") {
    return "1W";
  }

  if (interval === "M") {
    return "1M";
  }

  return intervalOptions.some((option) => option.value === interval)
    ? (interval as ChartInterval)
    : "15";
}

function parseDisplayPrice(price: string) {
  const parsed = Number(price.replace(/[^\d.-]/g, ""));

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 100;
}

function formatCompactPrice(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value);
}

function getIntervalLabel(interval: ChartInterval) {
  return intervalOptions.find((option) => option.value === interval)?.label ?? "15 phút";
}

function formatTime(index: number, total: number, interval: ChartInterval) {
  if (interval === "1D" || interval === "1W" || interval === "1M") {
    const distance = total - index;
    const unit = interval === "1D" ? "ngày" : interval === "1W" ? "tuần" : "tháng";

    return distance <= 1 ? "Hiện tại" : `${distance} ${unit} trước`;
  }

  if (interval === "1S") {
    const seconds = index % 60;

    return `09:00:${String(seconds).padStart(2, "0")}`;
  }

  const step = interval === "60" ? 60 : interval === "240" ? 240 : Number(interval);
  const minutes = 9 * 60 + index * step;
  const hour = Math.floor(minutes / 60) % 24;
  const minute = minutes % 60;

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function interpolate(points: number[], progress: number) {
  const position = progress * (points.length - 1);
  const left = Math.floor(position);
  const right = Math.min(left + 1, points.length - 1);
  const ratio = position - left;

  return points[left] + (points[right] - points[left]) * ratio;
}

function createMockCandles(stock: StockAsset, interval: ChartInterval): MockCandle[] {
  const total = interval === "1D" || interval === "1W" || interval === "1M" ? 28 : 34;
  const basePrice = parseDisplayPrice(stock.price);
  const intervalVolatility =
    interval === "1S"
      ? 0.0007
      : interval === "1"
        ? 0.001
        : interval === "240"
          ? 0.004
          : 0.0022;
  const priceUnit = Math.max(basePrice * intervalVolatility, 0.5);
  const sourcePoints =
    stock.chartPoints.length > 1 ? stock.chartPoints : [48, 50, 49, 52];
  const firstPoint = sourcePoints[0];
  const seed = stock.symbol.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const candles: MockCandle[] = [];

  for (let index = 0; index < total; index += 1) {
    const progress = index / (total - 1);
    const trendPoint = interpolate(sourcePoints, progress);
    const trendMove = (trendPoint - firstPoint) * priceUnit;
    const wave = Math.sin(index * 0.9 + seed) * priceUnit * 1.15;
    const close = Math.max(basePrice + trendMove + wave, priceUnit);
    const previousClose = candles[index - 1]?.close ?? close - Math.cos(seed) * priceUnit;
    const open = previousClose + Math.sin(index * 1.37 + seed / 3) * priceUnit * 0.45;
    const spread = priceUnit * (1.1 + Math.abs(Math.sin(index + seed)) * 1.4);
    const high = Math.max(open, close) + spread;
    const low = Math.max(Math.min(open, close) - spread, priceUnit * 0.1);
    const volume =
      760 +
      Math.abs(close - open) * 5 +
      (1 + Math.sin(index * 0.7 + seed / 11)) * 330 +
      (index % 5) * 58;

    candles.push({
      close,
      high,
      low,
      ma: null,
      open,
      time: formatTime(index, total, interval),
      volume,
    });
  }

  return candles.map((candle, index) => {
    const start = Math.max(0, index - 4);
    const window = candles.slice(start, index + 1);
    const ma = window.reduce((sum, item) => sum + item.close, 0) / window.length;

    return { ...candle, ma };
  });
}

export function FallbackChart({
  height = 520,
  initialInterval = "15",
  stock,
  variant = "card",
}: FallbackChartProps) {
  const [activeInterval, setActiveInterval] = useState<ChartInterval>(
    normalizeInterval(initialInterval),
  );
  const [showVolume, setShowVolume] = useState(true);
  const [showMovingAverage, setShowMovingAverage] = useState(true);
  const isMounted = useSyncExternalStore(
    subscribeToClientSnapshot,
    () => true,
    () => false,
  );

  const effectiveInterval =
    variant === "embedded" ? normalizeInterval(initialInterval) : activeInterval;

  const candles = useMemo(
    () => createMockCandles(stock, effectiveInterval),
    [effectiveInterval, stock],
  );

  if (!isMounted) {
    const loadingCanvas = (
      <div
        className="flex min-h-[320px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-400"
        style={{ minHeight: height }}
      >
        Dữ liệu mẫu MVP
      </div>
    );

    if (variant === "embedded") {
      return (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <Badge className="border-amber-200 bg-amber-50 text-amber-700">
              Dữ liệu mẫu MVP
            </Badge>
            <span>{stock.tradingViewSymbol || stock.symbol}</span>
          </div>
          {loadingCanvas}
        </div>
      );
    }

    return (
      <Card className="overflow-hidden bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-950">
            <CandlestickChart className="h-5 w-5 text-slate-500" aria-hidden="true" />
            Biểu đồ nến mẫu
          </CardTitle>
        </CardHeader>
        <CardContent>{loadingCanvas}</CardContent>
      </Card>
    );
  }


  const priceMin = Math.min(...candles.map((candle) => candle.low));
  const priceMax = Math.max(...candles.map((candle) => candle.high));
  const priceRange = Math.max(priceMax - priceMin, 1);
  const maxVolume = Math.max(...candles.map((candle) => candle.volume), 1);
  const chartWidth = chart.width - chart.x - 52;
  const candleGap = chartWidth / candles.length;
  const candleWidth = Math.max(candleGap * 0.54, 5);
  const priceTicks = Array.from({ length: 5 }, (_, index) => {
    const value = priceMax - (priceRange / 4) * index;
    const y = chart.y + ((priceMax - value) / priceRange) * chart.priceHeight;

    return { value, y };
  });

  const toX = (index: number) => chart.x + candleGap * index + candleGap / 2;
  const toPriceY = (value: number) =>
    chart.y + ((priceMax - value) / priceRange) * chart.priceHeight;
  const maPath = candles
    .map((candle, index) => `${toX(index)},${toPriceY(candle.ma ?? candle.close)}`)
    .join(" ");

  const controls = (
    <div className="flex flex-wrap gap-2">
      <Button
        className={cn(
          "h-8 rounded-lg px-2.5 text-xs",
          showVolume
            ? "bg-slate-950 text-white hover:bg-slate-800"
            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
        )}
        onClick={() => setShowVolume((value) => !value)}
        type="button"
        variant="ghost"
      >
        <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
        Khối lượng
      </Button>
      <Button
        className={cn(
          "h-8 rounded-lg px-2.5 text-xs",
          showMovingAverage
            ? "bg-slate-950 text-white hover:bg-slate-800"
            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
        )}
        onClick={() => setShowMovingAverage((value) => !value)}
        type="button"
        variant="ghost"
      >
        <LineChart className="h-3.5 w-3.5" aria-hidden="true" />
        Đường trung bình
      </Button>
      <Button
        className="h-8 rounded-lg px-2.5 text-xs"
        disabled
        type="button"
        variant="outline"
      >
        RSI TODO
      </Button>
      <Button
        className="h-8 rounded-lg px-2.5 text-xs"
        disabled
        type="button"
        variant="outline"
      >
        MACD TODO
      </Button>
    </div>
  );

  const chartCanvas = (
    <div
      className="overflow-hidden rounded-lg border border-slate-200 bg-white"
      style={{ minHeight: height }}
    >
      <svg
        className="fallbackChartSvg h-full min-h-[360px] w-full"
        preserveAspectRatio="none"
        role="img"
        viewBox={`0 0 ${chart.width} ${chart.height}`}
        aria-label={`${stock.displayName} biểu đồ nến mẫu MVP`}
      >
        <rect fill="#ffffff" height={chart.height} width={chart.width} x="0" y="0" />
        {priceTicks.map((tick) => (
          <g key={tick.value}>
            <line
              stroke="rgba(148,163,184,0.24)"
              strokeWidth="1"
              x1={chart.x}
              x2={chart.width - 38}
              y1={tick.y}
              y2={tick.y}
            />
            <text
              fill="rgba(71,85,105,0.82)"
              fontSize="11"
              textAnchor="end"
              x={chart.width - 8}
              y={tick.y + 4}
            >
              {formatCompactPrice(tick.value)}
            </text>
          </g>
        ))}
        {candles.map((candle, index) => {
          const x = toX(index);
          const openY = toPriceY(candle.open);
          const closeY = toPriceY(candle.close);
          const highY = toPriceY(candle.high);
          const lowY = toPriceY(candle.low);
          const isRising = candle.close >= candle.open;
          const color = isRising ? "#ef4444" : "#2563eb";
          const bodyY = Math.min(openY, closeY);
          const bodyHeight = Math.max(Math.abs(openY - closeY), 2);
          const volumeHeight = Math.max(
            (candle.volume / maxVolume) * chart.volumeHeight,
            3,
          );

          return (
            <g key={`${candle.time}-${index}`}>
              <line
                stroke={color}
                strokeLinecap="round"
                strokeWidth="1.5"
                x1={x}
                x2={x}
                y1={highY}
                y2={lowY}
              />
              <rect
                fill={color}
                height={bodyHeight}
                opacity={isRising ? 0.92 : 0.82}
                rx="1.5"
                width={candleWidth}
                x={x - candleWidth / 2}
                y={bodyY}
              />
              {showVolume ? (
                <rect
                  fill={color}
                  height={volumeHeight}
                  opacity="0.24"
                  rx="1.5"
                  width={Math.max(candleWidth, 4)}
                  x={x - candleWidth / 2}
                  y={chart.volumeY + chart.volumeHeight - volumeHeight}
                />
              ) : null}
              {index % 6 === 0 ? (
                <text
                  fill="rgba(100,116,139,0.78)"
                  fontSize="10"
                  textAnchor="middle"
                  x={x}
                  y={chart.height - 12}
                >
                  {candle.time}
                </text>
              ) : null}
            </g>
          );
        })}
        {showMovingAverage ? (
          <polyline
            fill="none"
            points={maPath}
            stroke="#0f172a"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        ) : null}
        <line
          stroke="rgba(148,163,184,0.3)"
          strokeWidth="1"
          x1={chart.x}
          x2={chart.width - 38}
          y1={chart.volumeY - 12}
          y2={chart.volumeY - 12}
        />
        <text fill="rgba(15,23,42,0.74)" fontSize="11" x={chart.x} y="18">
          {stock.displayName} / {getIntervalLabel(effectiveInterval)}
        </text>
        <text
          fill="rgba(245,158,11,0.95)"
          fontSize="11"
          textAnchor="end"
          x={chart.width - 8}
          y="18"
        >
          Dữ liệu mẫu MVP
        </text>
      </svg>
    </div>
  );

  const guideText = (
    <p className="text-xs leading-5 text-slate-400">
      Biểu đồ hiện tại là dữ liệu mẫu MVP. Không thể dùng làm giá thực tế hoặc căn cứ quyết định đầu tư.
    </p>
  );

  if (variant === "embedded") {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <Badge className="border-amber-200 bg-amber-50 text-amber-700">
              Dữ liệu mẫu MVP
            </Badge>
            <span>{stock.tradingViewSymbol || stock.symbol}</span>
          </div>
          {controls}
        </div>
        {chartCanvas}
        {guideText}
      </div>
    );
  }

  return (
    <Card className="overflow-hidden bg-white">
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-slate-950">
              <CandlestickChart className="h-5 w-5 text-slate-500" aria-hidden="true" />
              Biểu đồ nến mẫu
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <Badge className="border-amber-200 bg-amber-50 text-amber-700">
                Dữ liệu mẫu MVP
              </Badge>
              <span>{stock.tradingViewSymbol || stock.symbol}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {intervalOptions.map((option) => (
              <Button
                className={cn(
                  "h-8 rounded-lg px-2.5 text-xs",
                  activeInterval === option.value
                    ? "bg-slate-950 text-white"
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
        </div>
        {controls}
      </CardHeader>
      <CardContent className="space-y-3">
        {chartCanvas}
        {guideText}
      </CardContent>
    </Card>
  );
}
