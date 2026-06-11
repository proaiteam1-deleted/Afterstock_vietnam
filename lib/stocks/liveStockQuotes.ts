import type { MockStockQuote } from "@/lib/stocks/mockStockQuotes";
import type { StockAsset } from "@/types/stock";

export type LiveStockQuote = MockStockQuote & {
  isLive: boolean;
  sourceLabel: string;
  updatedAt: string;
};

const upbitMarketMap: Record<string, string> = {
  BTCUSDT: "KRW-BTC",
  ETHUSDT: "KRW-ETH",
};

const yahooSymbolMap: Record<string, string> = {
  "KRX:000660": "000660.KS",
  "KRX:005930": "005930.KS",
  "KRX:012450": "012450.KS",
  "KRX:035420": "035420.KS",
  "KRX:035720": "035720.KS",
  "NASDAQ:AAPL": "AAPL",
  "NASDAQ:NVDA": "NVDA",
  "NASDAQ:TSLA": "TSLA",
  "TVC:KOSPI": "^KS11",
  "TVC:NDX": "^IXIC",
  "TVC:SPX": "^GSPC",
};

function formatNumber(value: number, unit = "") {
  return `${new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value)}${unit ? ` ${unit}` : ""}`;
}

function formatSignedNumber(value: number) {
  return `${value >= 0 ? "+" : ""}${formatNumber(value)}`;
}

function getCurrencyUnit(stock: StockAsset) {
  if (stock.assetType === "global") {
    return "USD";
  }

  if (stock.assetType === "index") {
    return "pt";
  }

  return "KRW";
}

function getDisplayPair(stock: StockAsset) {
  if (stock.symbol === "BTCUSDT") {
    return "BTC/KRW";
  }

  if (stock.symbol === "ETHUSDT") {
    return "ETH/KRW";
  }

  if (stock.assetType === "global") {
    return `${stock.symbol}/USD`;
  }

  if (stock.assetType === "index") {
    return stock.symbol;
  }

  return `${stock.displayName}/KRW`;
}

function getLastFinite(values: Array<number | null | undefined>) {
  for (let index = values.length - 1; index >= 0; index -= 1) {
    const value = values[index];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
  }

  return null;
}

function getFiniteValues(values: Array<number | null | undefined> | undefined) {
  return (values ?? []).filter(
    (value): value is number => typeof value === "number" && Number.isFinite(value),
  );
}

export function getYahooSymbol(stock: StockAsset) {
  if (stock.tradingViewSymbol === "KRX:KOSDAQ") {
    return "^KQ11";
  }

  return yahooSymbolMap[stock.tradingViewSymbol] ?? null;
}

export async function fetchUpbitQuote(stock: StockAsset): Promise<LiveStockQuote | null> {
  const market = upbitMarketMap[stock.symbol];

  if (!market) {
    return null;
  }

  const response = await fetch(`https://api.upbit.com/v1/ticker?markets=${market}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 15 },
  });

  if (!response.ok) {
    return null;
  }

  const [ticker] = (await response.json()) as Array<{
    acc_trade_price_24h: number;
    acc_trade_volume_24h: number;
    high_price: number;
    low_price: number;
    signed_change_price: number;
    signed_change_rate: number;
    timestamp: number;
    trade_price: number;
  }>;

  if (!ticker || !Number.isFinite(ticker.trade_price)) {
    return null;
  }

  const coinUnit = stock.symbol.startsWith("ETH") ? "ETH" : "BTC";

  return {
    changeAmount: formatSignedNumber(ticker.signed_change_price),
    changeRate: ticker.signed_change_rate * 100,
    currentPrice: formatNumber(ticker.trade_price, "KRW"),
    displayPair: getDisplayPair(stock),
    highPrice: formatNumber(ticker.high_price),
    isLive: true,
    lowPrice: formatNumber(ticker.low_price),
    marketNote: "Giá realtime theo thị trường KRW của Upbit.",
    sourceLabel: "Upbit realtime",
    turnover: formatNumber(ticker.acc_trade_price_24h, "KRW"),
    updatedAt: new Date(ticker.timestamp).toISOString(),
    volume: formatNumber(ticker.acc_trade_volume_24h, coinUnit),
  };
}

export async function fetchYahooQuote(stock: StockAsset): Promise<LiveStockQuote | null> {
  const yahooSymbol = getYahooSymbol(stock);

  if (!yahooSymbol) {
    return null;
  }

  const response = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
      yahooSymbol,
    )}?range=1d&interval=1m`,
    {
      headers: {
        Accept: "application/json",
        "User-Agent": "AfterStock MVP quote fetcher",
      },
      next: { revalidate: 30 },
    },
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    chart?: {
      result?: Array<{
        indicators?: {
          quote?: Array<{
            close?: Array<number | null>;
            high?: Array<number | null>;
            low?: Array<number | null>;
            volume?: Array<number | null>;
          }>;
        };
        meta?: {
          chartPreviousClose?: number;
          currency?: string;
          previousClose?: number;
          regularMarketPrice?: number;
          regularMarketTime?: number;
        };
      }>;
    };
  };

  const result = data.chart?.result?.[0];
  const meta = result?.meta;
  const quote = result?.indicators?.quote?.[0];
  const closes = getFiniteValues(quote?.close);
  const highs = getFiniteValues(quote?.high);
  const lows = getFiniteValues(quote?.low);
  const volumes = getFiniteValues(quote?.volume);
  const currentPrice =
    getLastFinite(closes) ??
    (typeof meta?.regularMarketPrice === "number" ? meta.regularMarketPrice : null);
  const previousClose =
    typeof meta?.chartPreviousClose === "number"
      ? meta.chartPreviousClose
      : typeof meta?.previousClose === "number"
        ? meta.previousClose
        : null;

  if (!currentPrice) {
    return null;
  }

  const changeAmount = previousClose ? currentPrice - previousClose : 0;
  const changeRate = previousClose ? (changeAmount / previousClose) * 100 : 0;
  const unit = getCurrencyUnit(stock);
  const volume = volumes.reduce((sum, value) => sum + value, 0);
  const highPrice = highs.length ? Math.max(...highs) : currentPrice;
  const lowPrice = lows.length ? Math.min(...lows) : currentPrice;
  const updatedAt = meta?.regularMarketTime
    ? new Date(meta.regularMarketTime * 1000).toISOString()
    : new Date().toISOString();

  return {
    changeAmount: formatSignedNumber(changeAmount),
    changeRate,
    currentPrice: formatNumber(currentPrice, unit),
    displayPair: getDisplayPair(stock),
    highPrice: formatNumber(highPrice),
    isLive: true,
    lowPrice: formatNumber(lowPrice),
    marketNote:
      stock.assetType === "global"
        ? "Giá quốc tế dựa trên Yahoo Finance, có thể bị trễ tùy chính sách sàn."
        : "Giá chỉ số/cổ phiếu dựa trên Yahoo Finance, có thể bị trễ tùy chính sách sàn.",
    sourceLabel: stock.assetType === "global" ? "Yahoo Finance" : "Yahoo Finance/KRX",
    turnover: volume ? formatNumber(volume * currentPrice, unit) : "-",
    updatedAt,
    volume: volume
      ? formatNumber(volume, stock.assetType === "index" ? "hợp đồng" : "cổ phiếu")
      : "-",
  };
}

export async function fetchLiveStockQuote(stock: StockAsset) {
  if (stock.assetType === "coin") {
    return fetchUpbitQuote(stock);
  }

  return fetchYahooQuote(stock);
}
