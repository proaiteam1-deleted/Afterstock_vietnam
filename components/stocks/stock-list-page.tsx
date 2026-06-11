"use client";

import Link from "next/link";
import { BarChart3, MessageCircle, Search, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStockQuote } from "@/components/stocks/use-stock-quote";
import { getStockHref, stockAssets } from "@/lib/stocks/mockStocks";
import { getOrSeedStockOpinionsBySymbol } from "@/lib/stocks/stockStorage";
import { cn } from "@/lib/utils/cn";
import type { StockAsset, StockAssetType, StockOpinion } from "@/types/stock";

const categoryTabs: { id: "all" | StockAssetType; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "domestic", label: "국내" },
  { id: "global", label: "해외" },
  { id: "coin", label: "코인" },
  { id: "index", label: "지수" },
];

const featuredSymbols = [
  "UPBIT:BTCKRW",
  "NASDAQ:NVDA",
  "TVC:NDX",
  "KRX:005930",
  "NASDAQ:TSLA",
];

function getOpinionStats(stock: StockAsset, opinions: StockOpinion[]) {
  const stockOpinions = opinions.filter((opinion) => opinion.symbol === stock.symbol);

  if (stockOpinions.length === 0) {
    return {
      bearishPercent: stock.bearishPercent,
      bullishPercent: stock.bullishPercent,
      opinionCount: stock.opinionCount,
    };
  }

  const bullish = stockOpinions.filter(
    (opinion) => opinion.direction === "bullish",
  ).length;
  const bearish = stockOpinions.filter(
    (opinion) => opinion.direction === "bearish",
  ).length;
  const totalDirectional = Math.max(bullish + bearish, 1);
  const bullishPercent = Math.round((bullish / totalDirectional) * 100);

  return {
    bearishPercent: 100 - bullishPercent,
    bullishPercent,
    opinionCount: stock.opinionCount + stockOpinions.length,
  };
}

function FeaturedStockLink({ stock }: { stock: StockAsset }) {
  return (
    <Link
      className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition hover:border-slate-300 hover:shadow-md"
      href={getStockHref(stock.symbol)}
    >
      <span className="font-semibold text-slate-900">{stock.displayName}</span>
      <span className="text-xs text-slate-500">{stock.opinionCount} 의견</span>
    </Link>
  );
}

function StockListCard({
  opinions,
  stock,
}: {
  opinions: StockOpinion[];
  stock: StockAsset;
}) {
  const stats = getOpinionStats(stock, opinions);
  const quote = useStockQuote(stock);
  const isPositive = quote.changeRate >= 0;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-lg font-bold text-slate-950">
              {stock.displayName}
            </h2>
            <Badge className="border-slate-200 bg-slate-50 text-slate-600">
              {stock.market}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500">{stock.tradingViewSymbol}</p>
        </div>
        <span
          className={cn(
            "rounded-md px-2 py-1 text-xs font-bold",
            isPositive ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600",
          )}
        >
          {isPositive ? "+" : ""}
          {quote.changeRate.toFixed(2)}%
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="text-xs text-slate-500">
            {quote.isLive ? quote.sourceLabel : "현재가 예시"}
          </p>
          <p className="mt-1 truncate text-lg font-bold text-slate-950">
            {quote.currentPrice}
          </p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="text-xs text-slate-500">의견 수</p>
          <p className="mt-1 text-lg font-bold text-slate-950">
            {stats.opinionCount.toLocaleString("ko-KR")}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-red-500">좋게 봄 {stats.bullishPercent}%</span>
          <span className="text-blue-500">안 좋게 봄 {stats.bearishPercent}%</span>
        </div>
        <div className="flex h-3 overflow-hidden rounded-full bg-blue-100">
          <div className="bg-red-500" style={{ width: `${stats.bullishPercent}%` }} />
          <div className="bg-blue-500" style={{ width: `${stats.bearishPercent}%` }} />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <Button asChild className="bg-slate-950 text-white hover:bg-slate-800" size="sm">
          <Link href={getStockHref(stock.symbol)}>
            <BarChart3 className="h-4 w-4" aria-hidden="true" />
            차트 보기
          </Link>
        </Button>
        <Button
          asChild
          className="border-slate-200 text-slate-700"
          size="sm"
          variant="outline"
        >
          <Link href={`${getStockHref(stock.symbol)}#stock-opinion-expanded`}>
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            의견 보기
          </Link>
        </Button>
      </div>
    </article>
  );
}

export function StockListPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | StockAssetType>("all");
  const [opinions, setOpinions] = useState<StockOpinion[]>([]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setOpinions(
        stockAssets.flatMap((stock) => getOrSeedStockOpinionsBySymbol(stock.symbol)),
      );
    }, 0);

    return () => window.clearTimeout(timerId);
  }, []);

  const filteredStocks = useMemo(
    () =>
      stockAssets.filter((stock) => {
        const keyword = query.trim().toLowerCase();
        const matchesQuery = keyword
          ? `${stock.displayName} ${stock.symbol} ${stock.market} ${stock.tradingViewSymbol}`
              .toLowerCase()
              .includes(keyword)
          : true;
        const matchesCategory =
          activeCategory === "all" ? true : stock.assetType === activeCategory;

        return matchesQuery && matchesCategory;
      }),
    [activeCategory, query],
  );

  const featuredStocks = featuredSymbols
    .map((symbol) => stockAssets.find((stock) => stock.tradingViewSymbol === symbol))
    .filter((stock): stock is StockAsset => Boolean(stock));

  return (
    <div className="mx-auto max-w-[1180px] space-y-6">
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <Badge className="border-slate-200 bg-slate-50 text-slate-600">
            종목별 차트 커뮤니티
          </Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            종목별 투자자 의견
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            지수, 국내주식, 해외주식, 코인별 mock 차트와 사용자 의견을 한곳에서 확인하는
            커뮤니티 종목 페이지입니다.
          </p>
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500" aria-hidden="true" />
            <h2 className="font-bold text-slate-950">인기 종목</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">오늘 의견이 많이 쌓인 종목</p>
          <div className="mt-4 grid gap-2">
            {featuredStocks.map((stock) => (
              <FeaturedStockLink key={stock.symbol} stock={stock} />
            ))}
          </div>
        </aside>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <label className="relative block">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
              value={query}
              placeholder="종목명, 심볼, 시장 구분 검색"
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>

          <div className="flex flex-wrap gap-2">
            {categoryTabs.map((category) => (
              <Button
                key={category.id}
                type="button"
                size="sm"
                className={cn(
                  "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100",
                  activeCategory === category.id &&
                    "bg-slate-950 text-white hover:bg-slate-800",
                )}
                variant="ghost"
                onClick={() => setActiveCategory(category.id)}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredStocks.map((stock) => (
          <StockListCard key={stock.symbol} stock={stock} opinions={opinions} />
        ))}
      </section>

      {filteredStocks.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          검색 조건에 맞는 종목이 없습니다.
        </div>
      ) : null}

      <p className="text-xs leading-5 text-slate-400">
        표시된 가격과 비율은 MVP 구성을 위한 mock 데이터이며, 사용자 의견 기반 참고
        정보입니다.
      </p>
    </div>
  );
}
