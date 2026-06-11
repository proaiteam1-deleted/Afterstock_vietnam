"use client";

import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";

import { BoardCard } from "@/components/boards/board-card";
import { MarketDirectionPredictions } from "@/components/home/market-direction-predictions";
import { RetailChatRoom } from "@/components/home/retail-chat-room";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  boardSections,
  marketTargets,
  type MarketTarget,
} from "@/lib/mock/market-community";
import { getStockHref, stockAssets } from "@/lib/stocks/mockStocks";

const marketTargetLabels: Record<string, { description: string; name: string }> = {
  bitcoin: {
    description: "코인 시장 대표 심리",
    name: "비트코인",
  },
  kosdaq: {
    description: "성장주와 테마주 체감 온도",
    name: "코스닥",
  },
  kospi: {
    description: "국내 대형주 시장 분위기",
    name: "코스피",
  },
  nasdaq: {
    description: "미국 기술주 시장 심리",
    name: "나스닥",
  },
  sp500: {
    description: "미국 전체 시장 분위기",
    name: "S&P500",
  },
};

function MarketTargetCard({ target }: { target: MarketTarget }) {
  const label = marketTargetLabels[target.id] ?? {
    description: target.description,
    name: target.name,
  };

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-semibold text-white">{label.name}</div>
          <div className="mt-1 text-sm text-slate-400">{label.description}</div>
        </div>
        <TrendingUp className="h-5 w-5 text-cyan-200" aria-hidden="true" />
      </div>
    </div>
  );
}

const popularStockSymbols = [
  "삼성전자",
  "SK하이닉스",
  "네이버",
  "카카오",
  "테슬라",
  "엔비디아",
];

function PopularStocksSection() {
  const popularStocks = popularStockSymbols
    .map((symbol) => stockAssets.find((stock) => stock.symbol === symbol))
    .filter((stock) => Boolean(stock));

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">인기 종목 의견방</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            시장 방향을 봤다면, 이제 종목별 의견을 확인해보세요. 차트와 투자자 의견을 한
            화면에서 확인할 수 있습니다.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/stocks">전체 종목 보기</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {popularStocks.map((stock) =>
          stock ? (
            <Link
              key={stock.symbol}
              href={getStockHref(stock.symbol)}
              className="rounded-lg border border-white/10 bg-white/[0.045] p-4 transition hover:border-cyan-300/25 hover:bg-cyan-300/8"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-semibold text-white">
                    {stock.displayName}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">{stock.market}</div>
                </div>
                <Badge variant={stock.changeRate >= 0 ? "success" : "danger"}>
                  {stock.changeRate >= 0 ? "+" : ""}
                  {stock.changeRate.toFixed(2)}%
                </Badge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md border border-white/10 bg-black/18 p-3">
                  <p className="text-xs text-slate-500">현재가 mock</p>
                  <p className="mt-1 font-semibold text-white">{stock.price}</p>
                </div>
                <div className="rounded-md border border-white/10 bg-black/18 p-3">
                  <p className="text-xs text-slate-500">의견 수</p>
                  <p className="mt-1 font-semibold text-white">
                    {stock.opinionCount.toLocaleString("ko-KR")}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-rose-400/20">
                <div
                  className="bg-emerald-300"
                  style={{ width: `${stock.bullishPercent}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-xs">
                <span className="text-emerald-200">좋게 봄 {stock.bullishPercent}%</span>
                <span className="text-rose-200">안 좋게 봄 {stock.bearishPercent}%</span>
              </div>
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-cyan-100">
                상세에서 차트와 의견 보기
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </div>
            </Link>
          ) : null,
        )}
      </div>
    </section>
  );
}

export function MarketCommunityHub() {
  return (
    <div className="space-y-10">
      <section className="grid gap-8 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:py-12">
        <div className="space-y-6">
          <Badge variant="accent">로그인 없는 시장심리 MVP</Badge>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
              오늘 투자자들은 상승을 볼까, 하락을 볼까?
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              로그인 없이 클릭 한 번으로 오늘의 시장심리에 참여해보세요. 애프터스톡은 실제
              투자나 거래가 아닌 커뮤니티 예측과 의견 공유 서비스입니다.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {marketTargets.map((target) => (
            <MarketTargetCard key={target.id} target={target} />
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <MarketDirectionPredictions />
        <RetailChatRoom />
      </div>

      <PopularStocksSection />

      <section id="boards" className="space-y-5">
        <div>
          <h2 className="text-2xl font-semibold text-white">게시판</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            예측 투표 아래에서 커뮤니티별 이야기를 이어갈 수 있게 구성했습니다.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {boardSections.map((board) => (
            <BoardCard key={board.id} board={board} />
          ))}
        </div>
      </section>
    </div>
  );
}
