import { stockAssets } from "@/lib/stocks/mockStocks";
import type { StockAsset, StockAssetType } from "@/types/stock";

type TradingViewSymbolMap = Record<string, string>;

const cryptoSymbols: TradingViewSymbolMap = {
  BTCUSDT: "UPBIT:BTCKRW",
  ETHUSDT: "UPBIT:ETHKRW",
};

const domesticSymbols: TradingViewSymbolMap = {
  SK하이닉스: "KRX:000660",
  네이버: "KRX:035420",
  삼성전자: "KRX:005930",
  카카오: "KRX:035720",
  한화에어로스페이스: "KRX:012450",
};

const globalSymbols: TradingViewSymbolMap = {
  애플: "NASDAQ:AAPL",
  엔비디아: "NASDAQ:NVDA",
  테슬라: "NASDAQ:TSLA",
};

const indexSymbols: TradingViewSymbolMap = {
  KOSDAQ: "KRX:KOSDAQ",
  KOSPI: "TVC:KOSPI",
  NASDAQ: "TVC:NDX",
  "S&P500": "TVC:SPX",
};

export const tradingViewSymbolMaps: Record<StockAssetType, TradingViewSymbolMap> = {
  coin: cryptoSymbols,
  domestic: domesticSymbols,
  global: globalSymbols,
  index: indexSymbols,
};

const blockedEmbeddedSymbols = new Set([
  "NASDAQ:IXIC",
  "SP:SPX",
  "TVC:KOSPI",
  "TVC:NDX",
  "TVC:SPX",
]);

export function getTradingViewSymbol(stock: StockAsset) {
  return (
    tradingViewSymbolMaps[stock.assetType][stock.symbol] ??
    tradingViewSymbolMaps[stock.assetType][stock.displayName] ??
    stock.tradingViewSymbol ??
    null
  );
}

export function canEmbedTradingViewSymbol(symbol: string | null | undefined) {
  return Boolean(
    symbol &&
    !symbol.startsWith("KRX:") &&
    !symbol.startsWith("TVC:") &&
    !blockedEmbeddedSymbols.has(symbol),
  );
}

export function getEmbeddableTradingViewSymbol(stock: StockAsset) {
  const resolvedSymbol = getTradingViewSymbol(stock);

  return canEmbedTradingViewSymbol(resolvedSymbol) ? resolvedSymbol : null;
}

export function getTradingViewSymbolBySymbol(symbol: string) {
  const normalizedSymbol = decodeURIComponent(symbol);
  const stock = stockAssets.find(
    (item) =>
      item.symbol.toLowerCase() === normalizedSymbol.toLowerCase() ||
      item.displayName.toLowerCase() === normalizedSymbol.toLowerCase(),
  );

  if (stock) {
    return getTradingViewSymbol(stock);
  }

  return (
    cryptoSymbols[normalizedSymbol] ??
    domesticSymbols[normalizedSymbol] ??
    globalSymbols[normalizedSymbol] ??
    indexSymbols[normalizedSymbol] ??
    null
  );
}

export function getEmbeddableTradingViewSymbolBySymbol(symbol: string) {
  const resolvedSymbol = getTradingViewSymbolBySymbol(symbol);

  return canEmbedTradingViewSymbol(resolvedSymbol) ? resolvedSymbol : null;
}
