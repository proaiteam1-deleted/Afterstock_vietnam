"use client";

import { Check, ChevronDown, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  canEmbedTradingViewSymbol,
  getTradingViewSymbol,
} from "@/lib/domain/trading-view";
import { cn } from "@/lib/utils/cn";
import type { StockAsset, StockAssetType } from "@/types/stock";

export const HOME_SELECTED_STOCK_KEY = "afterstock:home:selected-stock-symbol:v1";
export const HOME_STOCK_SELECT_EVENT = "afterstock:home-stock-select";

type AssetFilter = "all" | StockAssetType;

type AssetSelectorOption = {
  chartSourceLabel: string;
  displayName: string;
  displaySymbol: string;
  filterType: StockAssetType;
  marketLabel: string;
  stock: StockAsset;
  tradingViewSymbol: string;
};

type AssetSelectorProps = {
  options: AssetSelectorOption[];
  selectedStock: StockAsset;
  onSelect: (stock: StockAsset) => void;
};

const filterOptions: { id: AssetFilter; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "domestic", label: "Hàn Quốc" },
  { id: "global", label: "Quốc tế" },
  { id: "coin", label: "Crypto" },
  { id: "index", label: "Chỉ số" },
];

function getMarketBadgeClass(filterType: StockAssetType) {
  if (filterType === "domestic") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (filterType === "global") {
    return "border-violet-200 bg-violet-50 text-violet-700";
  }

  if (filterType === "coin") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-600";
}

export function createHomeAssetOptions(stockAssets: StockAsset[]) {
  const definitions = [
    {
      displayName: "Bitcoin",
      displaySymbol: "BTC/KRW",
      marketLabel: "Crypto",
      tradingViewSymbol: "UPBIT:BTCKRW",
    },
    {
      displayName: "Ethereum",
      displaySymbol: "ETH/KRW",
      marketLabel: "Crypto",
      tradingViewSymbol: "UPBIT:ETHKRW",
    },
    {
      displayName: "KOSPI",
      displaySymbol: "KOSPI",
      marketLabel: "Chỉ số",
      tradingViewSymbol: "TVC:KOSPI",
    },
    {
      displayName: "KOSDAQ",
      displaySymbol: "KOSDAQ",
      marketLabel: "Chỉ số",
      tradingViewSymbol: "KRX:KOSDAQ",
    },
    {
      displayName: "Samsung Electronics",
      displaySymbol: "005930",
      marketLabel: "Hàn Quốc",
      tradingViewSymbol: "KRX:005930",
    },
    {
      displayName: "SK hynix",
      displaySymbol: "000660",
      marketLabel: "Hàn Quốc",
      tradingViewSymbol: "KRX:000660",
    },
    {
      displayName: "NAVER",
      displaySymbol: "035420",
      marketLabel: "Hàn Quốc",
      tradingViewSymbol: "KRX:035420",
    },
    {
      displayName: "Kakao",
      displaySymbol: "035720",
      marketLabel: "Hàn Quốc",
      tradingViewSymbol: "KRX:035720",
    },
    {
      displayName: "Hyundai Motor",
      displaySymbol: "005380",
      marketLabel: "Hàn Quốc",
      tradingViewSymbol: "KRX:005380",
    },
    {
      displayName: "LG Energy Solution",
      displaySymbol: "373220",
      marketLabel: "Hàn Quốc",
      tradingViewSymbol: "KRX:373220",
    },
    {
      displayName: "Hanwha Aerospace",
      displaySymbol: "012450",
      marketLabel: "Hàn Quốc",
      tradingViewSymbol: "KRX:012450",
    },
    {
      displayName: "Tesla",
      displaySymbol: "TSLA",
      marketLabel: "Quốc tế",
      tradingViewSymbol: "NASDAQ:TSLA",
    },
    {
      displayName: "NVIDIA",
      displaySymbol: "NVDA",
      marketLabel: "Quốc tế",
      tradingViewSymbol: "NASDAQ:NVDA",
    },
    {
      displayName: "Apple",
      displaySymbol: "AAPL",
      marketLabel: "Quốc tế",
      tradingViewSymbol: "NASDAQ:AAPL",
    },
    {
      displayName: "NASDAQ",
      displaySymbol: "NASDAQ",
      marketLabel: "Chỉ số",
      tradingViewSymbol: "TVC:NDX",
    },
    {
      displayName: "S&P500",
      displaySymbol: "SPX",
      marketLabel: "Chỉ số",
      tradingViewSymbol: "TVC:SPX",
    },
    {
      displayName: "Vàng",
      displaySymbol: "XAU/USD",
      marketLabel: "Hàng hóa",
      tradingViewSymbol: "OANDA:XAUUSD",
    },
  ];

  return definitions
    .map((definition) => {
      const stock = stockAssets.find(
        (asset) => asset.tradingViewSymbol === definition.tradingViewSymbol,
      );

      if (!stock) {
        return null;
      }
      const tradingViewSymbol = getTradingViewSymbol(stock) ?? stock.tradingViewSymbol;

      return {
        ...definition,
        chartSourceLabel: canEmbedTradingViewSymbol(tradingViewSymbol)
          ? `TradingView ${tradingViewSymbol}`
          : `Biểu đồ cơ bản ${definition.displaySymbol}`,
        filterType: stock.assetType,
        stock,
        tradingViewSymbol,
      };
    })
    .filter((option): option is AssetSelectorOption => Boolean(option));
}

export function getHomeAssetOption(options: AssetSelectorOption[], stock: StockAsset) {
  return (
    options.find((option) => option.stock.symbol === stock.symbol) ?? {
      chartSourceLabel: canEmbedTradingViewSymbol(
        getTradingViewSymbol(stock) ?? stock.tradingViewSymbol,
      )
        ? `TradingView ${getTradingViewSymbol(stock) ?? stock.tradingViewSymbol}`
        : `Biểu đồ cơ bản ${stock.symbol}`,
      displayName: stock.displayName,
      displaySymbol: stock.symbol,
      filterType: stock.assetType,
      marketLabel: stock.market,
      stock,
      tradingViewSymbol: getTradingViewSymbol(stock) ?? stock.tradingViewSymbol,
    }
  );
}

export function AssetSelector({ onSelect, options, selectedStock }: AssetSelectorProps) {
  const [activeFilter, setActiveFilter] = useState<AssetFilter>("all");
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedOption = getHomeAssetOption(options, selectedStock);
  const filteredOptions = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return options.filter((option) => {
      const matchesFilter =
        activeFilter === "all" ? true : option.filterType === activeFilter;
      const matchesQuery = keyword
        ? `${option.displayName} ${option.displaySymbol} ${option.tradingViewSymbol} ${option.chartSourceLabel}`
            .toLowerCase()
            .includes(keyword)
        : true;

      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, options, query]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function handleSelect(stock: StockAsset) {
    onSelect(stock);
    setIsOpen(false);
    setQuery("");
  }

  return (
    <div className="relative min-w-0" ref={rootRef}>
      <button
        className="group -mx-2 rounded-xl border border-transparent px-2 py-1.5 text-left transition hover:border-slate-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
        aria-expanded={isOpen}
      >
        <span className="mb-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500 transition group-hover:bg-slate-900 group-hover:text-white">
          Đổi mã
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xl font-bold text-slate-950 sm:text-2xl">
            {selectedOption.displayName}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-slate-400 transition group-hover:text-slate-700",
              isOpen && "rotate-180",
            )}
            aria-hidden="true"
          />
          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
            {selectedOption.displaySymbol}
          </span>
          <span className="text-xs text-slate-400">{selectedOption.marketLabel}</span>
        </div>
        <p className="mt-1 text-xs text-slate-400">{selectedOption.chartSourceLabel}</p>
      </button>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-3 w-[min(92vw,440px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:right-auto">
          <div className="border-b border-slate-100 p-3">
            <label className="relative block">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm tên mã hoặc ký hiệu"
                value={query}
              />
            </label>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {filterOptions.map((filter) => (
                <Button
                  className={cn(
                    "h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-600 hover:bg-slate-100",
                    activeFilter === filter.id &&
                      "bg-slate-950 text-white hover:bg-slate-800",
                  )}
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  type="button"
                  variant="ghost"
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="max-h-[420px] overflow-y-auto p-2">
            {filteredOptions.map((option) => {
              const selected = option.stock.symbol === selectedStock.symbol;
              const isPositive = option.stock.changeRate >= 0;

              return (
                <button
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-50",
                    selected && "bg-slate-950 text-white hover:bg-slate-900",
                  )}
                  key={option.stock.symbol}
                  onClick={() => handleSelect(option.stock)}
                  type="button"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "font-semibold text-slate-950",
                          selected && "text-white",
                        )}
                      >
                        {option.displayName}
                      </span>
                      <span
                        className={cn(
                          "text-xs text-slate-500",
                          selected && "text-slate-300",
                        )}
                      >
                        {option.displaySymbol}
                      </span>
                      <Badge className={getMarketBadgeClass(option.filterType)}>
                        {option.marketLabel}
                      </Badge>
                    </div>
                    <p
                      className={cn(
                        "mt-1 text-xs text-slate-400",
                        selected && "text-slate-300",
                      )}
                    >
                      {option.chartSourceLabel}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-md px-2 py-1 text-xs font-bold",
                      isPositive ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600",
                    )}
                  >
                    {isPositive ? "+" : ""}
                    {option.stock.changeRate.toFixed(2)}%
                  </span>
                  {selected ? (
                    <Check className="h-4 w-4 shrink-0 text-white" aria-hidden="true" />
                  ) : null}
                </button>
              );
            })}

            {filteredOptions.length === 0 ? (
              <div className="px-3 py-8 text-center text-sm text-slate-500">
                Không có kết quả phù hợp.
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
