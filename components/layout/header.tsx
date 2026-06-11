"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import {
  HOME_SELECTED_STOCK_KEY,
  HOME_STOCK_SELECT_EVENT,
} from "@/components/home/asset-selector";
import { Button } from "@/components/ui/button";
import { stockAssets } from "@/lib/stocks/mockStocks";
import { cn } from "@/lib/utils/cn";

const DEFAULT_HOME_STOCK_SYMBOL = "삼성전자";

const stockTabs = [
  { label: "Samsung Electronics", symbol: "삼성전자" },
  { label: "SK hynix", symbol: "SK하이닉스" },
  { label: "NAVER", symbol: "네이버" },
  { label: "Kakao", symbol: "카카오" },
  { label: "Hyundai Motor", symbol: "현대차" },
  { label: "LG Energy Solution", symbol: "LG에너지솔루션" },
  { label: "KOSDAQ", symbol: "KOSDAQ" },
  { label: "Vàng", symbol: "금" },
];

function findStockByKeyword(keyword: string) {
  const normalizedKeyword = keyword.trim().toLowerCase();

  if (!normalizedKeyword) {
    return null;
  }

  return (
    stockAssets.find((stock) => {
      const searchableText = [
        stock.symbol,
        stock.displayName,
        stock.market,
        stock.tradingViewSymbol,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedKeyword);
    }) ?? null
  );
}

function readActiveStockSymbol() {
  if (typeof window === "undefined") {
    return DEFAULT_HOME_STOCK_SYMBOL;
  }

  return window.localStorage.getItem(HOME_SELECTED_STOCK_KEY) ?? DEFAULT_HOME_STOCK_SYMBOL;
}

function writeActiveStockSymbol(symbol: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(HOME_SELECTED_STOCK_KEY, symbol);
  window.dispatchEvent(
    new CustomEvent(HOME_STOCK_SELECT_EVENT, {
      detail: { symbol },
    }),
  );
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeSymbol, setActiveSymbol] = useState(DEFAULT_HOME_STOCK_SYMBOL);
  const [query, setQuery] = useState("");
  const availableTabs = useMemo(
    () =>
      stockTabs.filter((tab) =>
        stockAssets.some((stock) => stock.symbol === tab.symbol || stock.displayName === tab.symbol),
      ),
    [],
  );

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setActiveSymbol(readActiveStockSymbol());
    }, 0);

    function handleStockSelect(event: Event) {
      const symbol = (event as CustomEvent<{ symbol?: string }>).detail?.symbol;

      if (symbol) {
        setActiveSymbol(symbol);
      }
    }

    window.addEventListener(HOME_STOCK_SELECT_EVENT, handleStockSelect);

    return () => {
      window.clearTimeout(timerId);
      window.removeEventListener(HOME_STOCK_SELECT_EVENT, handleStockSelect);
    };
  }, []);

  function selectStock(symbol: string) {
    writeActiveStockSymbol(symbol);
    setActiveSymbol(symbol);

    if (pathname !== "/") {
      router.push("/");
    }
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const stock = findStockByKeyword(query);

    if (!stock) {
      return;
    }

    selectStock(stock.symbol);
    setQuery("");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex min-h-14 w-full max-w-[1216px] flex-col gap-2 px-4 py-2 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:py-0">
        <div className="flex min-w-0 items-center gap-5">
          <button
            className="shrink-0 text-xl font-black tracking-normal text-slate-950"
            onClick={() => router.push("/")}
            type="button"
          >
            AfterStock
          </button>

          <nav
            aria-label="Tab mã trên một trang"
            className="hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto lg:flex"
          >
            {availableTabs.map((tab) => {
              const isActive = activeSymbol === tab.symbol;

              return (
                <button
                  aria-pressed={isActive}
                  className={cn(
                    "h-10 shrink-0 px-2.5 text-sm font-bold text-slate-500 transition hover:text-slate-950",
                    isActive && "text-slate-950",
                  )}
                  key={tab.symbol}
                  onClick={() => selectStock(tab.symbol)}
                  type="button"
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex min-w-0 items-center gap-2">
          <nav
            aria-label="Tab mã cho di động"
            className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto lg:hidden"
          >
            {availableTabs.map((tab) => {
              const isActive = activeSymbol === tab.symbol;

              return (
                <button
                  aria-pressed={isActive}
                  className={cn(
                    "h-9 shrink-0 rounded-lg px-2.5 text-sm font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-950",
                    isActive && "bg-slate-950 text-white hover:bg-slate-950 hover:text-white",
                  )}
                  key={tab.symbol}
                  onClick={() => selectStock(tab.symbol)}
                  type="button"
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <form className="hidden w-[260px] shrink-0 sm:block" onSubmit={handleSearchSubmit}>
            <label className="relative block">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm kiếm mã cổ phiếu"
                value={query}
              />
            </label>
          </form>

          <Button
            className="h-10 shrink-0 rounded-lg bg-blue-500 px-4 text-sm font-bold text-white hover:bg-blue-600"
            onClick={() => router.push("/#today-sentiment")}
            type="button"
          >
            Tâm lý hôm nay
          </Button>
        </div>
      </div>
    </header>
  );
}
