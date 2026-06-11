"use client";

import Link from "next/link";
import { ArrowRight, Flame, Gauge, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  buildInitialMarketPredictionCounts,
  getMarketPredictionPercent,
  type MarketPredictionStorage,
} from "@/lib/domain/market-predictions";
import {
  activeBoardSections,
  marketTargets,
  type MarketPredictionCounts,
} from "@/lib/mock/market-community";
import { getOrSeedMarketPredictionStorage } from "@/lib/storage";

type SentimentLabel = "상승 과열" | "공포 과열" | "눈치보기" | "방향성 형성 중";

type SentimentTarget = {
  description: string;
  id: string;
  initialDown: number;
  initialUp: number;
  name: string;
  stockSymbol: string;
};

const stockSymbolByTargetId: Record<string, string> = {
  bitcoin: "BTCUSDT",
  kosdaq: "KOSDAQ",
  kospi: "KOSPI",
  nasdaq: "NASDAQ",
  sp500: "S&P500",
};

const extraTargets: SentimentTarget[] = [
  {
    description: "코인 시장 보조 심리",
    id: "ethereum",
    initialDown: 45,
    initialUp: 55,
    name: "이더리움",
    stockSymbol: "ETHUSDT",
  },
];

function getSentimentTargets(): SentimentTarget[] {
  const baseTargets = marketTargets.map((target) => ({
    ...target,
    stockSymbol: stockSymbolByTargetId[target.id] ?? "KOSPI",
  }));
  const existingIds = new Set(baseTargets.map((target) => target.id));

  return [
    ...baseTargets,
    ...extraTargets.filter((target) => !existingIds.has(target.id)),
  ];
}

function getSentimentLabel(upPercent: number, downPercent: number): SentimentLabel {
  if (upPercent >= 70) {
    return "상승 과열";
  }

  if (downPercent >= 70) {
    return "공포 과열";
  }

  if (upPercent >= 45 && upPercent <= 55) {
    return "눈치보기";
  }

  return "방향성 형성 중";
}

function getLabelClass(label: SentimentLabel) {
  if (label === "상승 과열") {
    return "border-red-200 bg-red-50 text-red-600";
  }

  if (label === "공포 과열") {
    return "border-blue-200 bg-blue-50 text-blue-600";
  }

  if (label === "눈치보기") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-600";
}

function SentimentBar({
  downPercent,
  upPercent,
}: {
  downPercent: number;
  upPercent: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex h-4 overflow-hidden rounded-full bg-slate-100">
        <div className="bg-red-500" style={{ width: `${upPercent}%` }} />
        <div className="bg-blue-500" style={{ width: `${downPercent}%` }} />
      </div>
      <div className="flex justify-between text-xs font-semibold">
        <span className="text-red-500">상승파 {upPercent}%</span>
        <span className="text-blue-500">하락파 {downPercent}%</span>
      </div>
    </div>
  );
}

export function MarketSentimentDashboard() {
  const [counts, setCounts] = useState<Record<string, MarketPredictionCounts>>(
    buildInitialMarketPredictionCounts,
  );

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      const storage = getOrSeedMarketPredictionStorage() as MarketPredictionStorage;

      setCounts(storage.counts);
    }, 0);

    return () => window.clearTimeout(timerId);
  }, []);

  const targets = useMemo(() => getSentimentTargets(), []);
  const rows = useMemo(
    () =>
      targets.map((target) => {
        const currentCounts = counts[target.id] ?? {
          down: target.initialDown,
          up: target.initialUp,
        };
        const total = currentCounts.up + currentCounts.down;
        const upPercent = getMarketPredictionPercent(currentCounts.up, total);
        const downPercent = 100 - upPercent;
        const spread = Math.abs(upPercent - downPercent);
        const label = getSentimentLabel(upPercent, downPercent);

        return {
          counts: currentCounts,
          downPercent,
          label,
          spread,
          target,
          total,
          upPercent,
        };
      }),
    [counts, targets],
  );

  const totalUp = rows.reduce((sum, row) => sum + row.counts.up, 0);
  const totalDown = rows.reduce((sum, row) => sum + row.counts.down, 0);
  const totalParticipants = totalUp + totalDown;
  const totalUpPercent = getMarketPredictionPercent(totalUp, totalParticipants);
  const totalDownPercent = 100 - totalUpPercent;
  const mostDivided = rows.reduce((current, row) =>
    row.spread < current.spread ? row : current,
  );
  const mostSkewed = rows.reduce((current, row) =>
    row.spread > current.spread ? row : current,
  );
  const overheatedLabel = getSentimentLabel(totalUpPercent, totalDownPercent);
  const reactionKeywords = [
    "반등",
    "손절",
    "물타기",
    "불장",
    "곰장",
    "나스닥",
    "코스피",
    "비트코인",
    "테슬라",
    "엔비디아",
    ...activeBoardSections.flatMap((board) => board.tags.slice(0, 1)),
  ];

  return (
    <div className="mx-auto max-w-[1180px] space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <Badge className="border-slate-200 bg-slate-50 text-slate-600">
          위캔나스닥식 방향성 지표
        </Badge>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          시장심리 지표
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          홈에서 쌓인 상승/하락 예측을 기반으로 오늘 참여자들의 방향성 쏠림을 보여줍니다.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">전체 상승파</p>
          <p className="mt-2 text-3xl font-bold text-red-500">{totalUpPercent}%</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">전체 하락파</p>
          <p className="mt-2 text-3xl font-bold text-blue-500">{totalDownPercent}%</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Users className="h-4 w-4" aria-hidden="true" />
            전체 참여자
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {totalParticipants.toLocaleString("ko-KR")}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Gauge className="h-4 w-4" aria-hidden="true" />
            의견 쏠림
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-950">
            가장 갈림: {mostDivided.target.name}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-950">
            가장 쏠림: {mostSkewed.target.name}
          </p>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-950">지수별 심리 카드</h2>
            <p className="mt-1 text-sm text-slate-500">
              Long/Short가 아닌 커뮤니티 예측 비율입니다.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {rows.map((row) => (
              <article
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                key={row.target.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-950">
                      {row.target.name}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      참여자 {row.total.toLocaleString("ko-KR")}명
                    </p>
                  </div>
                  <Badge className={getLabelClass(row.label)}>{row.label}</Badge>
                </div>

                <div className="mt-4">
                  <SentimentBar downPercent={row.downPercent} upPercent={row.upPercent} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-500">
                  <span>상승 {row.counts.up.toLocaleString("ko-KR")}명</span>
                  <span className="text-right">
                    하락 {row.counts.down.toLocaleString("ko-KR")}명
                  </span>
                </div>

                <Button
                  asChild
                  className="mt-5 w-full justify-between border-slate-200 text-slate-700"
                  variant="outline"
                >
                  <Link href={`/stocks/${encodeURIComponent(row.target.stockSymbol)}`}>
                    차트 보기
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-slate-950">의견 쏠림 지표</h2>
                <p className="mt-1 text-xs text-slate-500">전체 심리 기준</p>
              </div>
              <Badge className={getLabelClass(overheatedLabel)}>{overheatedLabel}</Badge>
            </div>
            <div className="mt-4">
              <SentimentBar downPercent={totalDownPercent} upPercent={totalUpPercent} />
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              상승파 70% 이상은 상승 과열, 하락파 70% 이상은 공포 과열, 45~55%는
              눈치보기로 표시합니다.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-amber-500" aria-hidden="true" />
              <h2 className="font-bold text-slate-950">인기 반응 키워드</h2>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {Array.from(new Set(reactionKeywords)).map((keyword) => (
                <Badge
                  key={keyword}
                  className="border-slate-200 bg-slate-50 text-slate-600"
                >
                  #{keyword}
                </Badge>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-500 shadow-sm">
            본 지표는 사용자 참여 기반 커뮤니티 지표이며, 실제 투자 판단 근거로 사용될 수
            없습니다.
          </section>
        </aside>
      </section>
    </div>
  );
}
