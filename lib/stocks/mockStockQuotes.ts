import type { StockAsset } from "@/types/stock";

export type MockStockQuote = {
  changeAmount: string;
  changeRate: number;
  currentPrice: string;
  displayPair: string;
  highPrice: string;
  lowPrice: string;
  marketNote: string;
  turnover: string;
  volume: string;
};

const fixedQuotes: Record<string, MockStockQuote> = {
  BTCUSDT: {
    changeAmount: "-1,472,000",
    changeRate: -1.41,
    currentPrice: "102,668,000 KRW",
    displayPair: "BTC/KRW",
    highPrice: "104,140,000",
    lowPrice: "102,000,000",
    marketNote:
      "Giá crypto hiển thị theo KRW; biểu đồ ưu tiên ký hiệu BINANCE để ổn định.",
    turnover: "331,014,013,247 KRW",
    volume: "3,146.420 BTC",
  },
  ETHUSDT: {
    changeAmount: "+54,000",
    changeRate: 1.08,
    currentPrice: "5,045,000 KRW",
    displayPair: "ETH/KRW",
    highPrice: "5,118,000",
    lowPrice: "4,912,000",
    marketNote:
      "UPBIT KRW 심볼은 TradingView에서 확인되지만, MVP 차트는 배포 안정성을 위해 글로벌 심볼을 우선합니다.",
    turnover: "98,842,510,000 KRW",
    volume: "19,481.238 ETH",
  },
};

function parseDisplayPrice(price: string) {
  const parsed = Number(price.replace(/[^\d.-]/g, ""));

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 100;
}

function formatNumber(value: number, unit = "") {
  return `${new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value)}${unit ? ` ${unit}` : ""}`;
}

function getCurrencyUnit(stock: StockAsset) {
  if (stock.assetType === "global") {
    return "USD";
  }

  if (stock.assetType === "coin") {
    return "KRW";
  }

  if (stock.assetType === "index") {
    return "pt";
  }

  return "KRW";
}

function getVolumeUnit(stock: StockAsset) {
  if (stock.assetType === "coin") {
    return stock.symbol.startsWith("ETH") ? "ETH" : "BTC";
  }

  if (stock.assetType === "index") {
    return "hợp đồng";
  }

  return "cổ phiếu";
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

export function getMockStockQuote(stock: StockAsset): MockStockQuote {
  const fixedQuote = fixedQuotes[stock.symbol];

  if (fixedQuote) {
    return fixedQuote;
  }

  const basePrice = parseDisplayPrice(stock.price);
  const changeAmount = basePrice * (stock.changeRate / 100);
  const volatility = Math.max(Math.abs(stock.changeRate) / 100, 0.006);
  const highPrice = basePrice * (1 + volatility + 0.012);
  const lowPrice = basePrice * (1 - volatility - 0.009);
  const seed = stock.symbol.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const volumeValue = Math.max(500 + seed * 13.7, 1000);
  const turnoverValue = volumeValue * basePrice;
  const unit = getCurrencyUnit(stock);
  const volumeUnit = getVolumeUnit(stock);

  return {
    changeAmount: `${changeAmount >= 0 ? "+" : ""}${formatNumber(changeAmount)}`,
    changeRate: stock.changeRate,
    currentPrice: formatNumber(basePrice, unit),
    displayPair: getDisplayPair(stock),
    highPrice: formatNumber(highPrice),
    lowPrice: formatNumber(lowPrice),
    marketNote:
      "Khu vực giá hiện tại dùng dữ liệu mock MVP để kiểm tra cấu trúc cộng đồng trước khi nối API thật.",
    turnover: formatNumber(turnoverValue, unit),
    volume: formatNumber(volumeValue, volumeUnit),
  };
}
