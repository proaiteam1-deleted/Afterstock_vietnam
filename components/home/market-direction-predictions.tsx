"use client";

import Link from "next/link";
import { ArrowDown, ArrowUp, BarChart3, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  buildInitialMarketPredictionCounts,
  getMarketPredictionPercent,
} from "@/lib/domain/market-predictions";
import {
  marketTargets,
  type MarketDirection,
  type MarketPredictionCounts,
  type MarketTarget,
} from "@/lib/mock/market-community";
import {
  getOrSeedMarketPredictionStorage,
  setMarketPredictionStorage,
} from "@/lib/storage";
import { cn } from "@/lib/utils/cn";

const marketTargetMeta: Record<
  string,
  {
    description: string;
    href: string;
    name: string;
  }
> = {
  bitcoin: {
    description: "코인 시장 대표 심리",
    href: "/stocks/BTCUSDT",
    name: "비트코인",
  },
  kosdaq: {
    description: "성장주와 테마주 체감 온도",
    href: "/stocks/KOSDAQ",
    name: "코스닥",
  },
  kospi: {
    description: "국내 대형주 시장 분위기",
    href: "/stocks/KOSPI",
    name: "코스피",
  },
  nasdaq: {
    description: "미국 기술주 시장 심리",
    href: "/stocks/NASDAQ",
    name: "나스닥",
  },
  sp500: {
    description: "미국 전체 시장 분위기",
    href: `/stocks/${encodeURIComponent("S&P500")}`,
    name: "S&P500",
  },
};

function getTargetMeta(target: MarketTarget) {
  return (
    marketTargetMeta[target.id] ?? {
      description: target.description,
      href: "/stocks",
      name: target.name,
    }
  );
}

function PredictionBar({
  upPercent,
  downPercent,
}: {
  downPercent: number;
  upPercent: number;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-black/24">
      <div className="flex h-4 bg-white/10">
        <div
          className="bg-emerald-400 transition-all"
          style={{ width: `${upPercent}%` }}
        />
        <div
          className="bg-rose-400 transition-all"
          style={{ width: `${downPercent}%` }}
        />
      </div>
      <div className="grid grid-cols-2 text-xs">
        <div className="border-r border-white/10 px-3 py-2 text-emerald-100">
          상승파 {upPercent}%
        </div>
        <div className="px-3 py-2 text-right text-rose-100">하락파 {downPercent}%</div>
      </div>
    </div>
  );
}

function DirectionPredictionCard({
  counts,
  onSelect,
  selectedDirection,
  target,
}: {
  counts: MarketPredictionCounts;
  onSelect: (targetId: string, direction: MarketDirection) => void;
  selectedDirection?: MarketDirection;
  target: MarketTarget;
}) {
  const total = counts.up + counts.down;
  const upPercent = getMarketPredictionPercent(counts.up, total);
  const downPercent = 100 - upPercent;
  const meta = getTargetMeta(target);

  return (
    <Card id={target.id === "kosdaq" ? "market-sentiment" : undefined}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{meta.name} 오늘 방향</CardTitle>
            <CardDescription>
              오늘 참여한 투자자 {total.toLocaleString("ko-KR")}명 · {meta.description}
            </CardDescription>
          </div>
          {selectedDirection ? (
            <Badge variant={selectedDirection === "up" ? "success" : "danger"}>
              내 선택: {selectedDirection === "up" ? "상승 본다" : "하락 본다"}
            </Badge>
          ) : (
            <Badge variant="accent">참여 가능</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="bullish"
            className={cn(
              "h-12",
              selectedDirection === "up" && "ring-2 ring-emerald-200/70",
            )}
            disabled={Boolean(selectedDirection)}
            onClick={() => onSelect(target.id, "up")}
          >
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
            상승 본다
          </Button>
          <Button
            type="button"
            variant="bearish"
            className={cn(
              "h-12",
              selectedDirection === "down" && "ring-2 ring-rose-200/70",
            )}
            disabled={Boolean(selectedDirection)}
            onClick={() => onSelect(target.id, "down")}
          >
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
            하락 본다
          </Button>
        </div>

        <PredictionBar upPercent={upPercent} downPercent={downPercent} />

        <div className="grid grid-cols-2 gap-3 text-xs text-slate-400">
          <div>상승파 {counts.up.toLocaleString("ko-KR")}명</div>
          <div className="text-right">하락파 {counts.down.toLocaleString("ko-KR")}명</div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Button asChild variant="outline" className="w-full">
            <Link href={meta.href}>
              <BarChart3 className="h-4 w-4" aria-hidden="true" />
              차트 보기
            </Link>
          </Button>
          <Button asChild variant="secondary" className="w-full">
            <Link href={meta.href}>
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              의견 보기
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function MarketDirectionPredictions() {
  const [counts, setCounts] = useState<Record<string, MarketPredictionCounts>>(
    buildInitialMarketPredictionCounts,
  );
  const [votes, setVotes] = useState<Record<string, MarketDirection>>({});

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      const storedPredictions = getOrSeedMarketPredictionStorage();

      setCounts(storedPredictions.counts);
      setVotes(storedPredictions.votes);
    }, 0);

    return () => window.clearTimeout(timerId);
  }, []);

  function handleSelect(targetId: string, direction: MarketDirection) {
    if (votes[targetId]) {
      return;
    }

    const nextCounts = {
      ...counts,
      [targetId]: {
        ...counts[targetId],
        [direction]: counts[targetId][direction] + 1,
      },
    };
    const nextVotes = {
      ...votes,
      [targetId]: direction,
    };

    setCounts(nextCounts);
    setVotes(nextVotes);
    setMarketPredictionStorage({
      counts: nextCounts,
      votes: nextVotes,
    });
  }

  return (
    <section id="predictions" className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">오늘의 시장 방향 예측</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            시장 방향을 봤다면, 이제 종목별 의견을 확인해보세요. 차트와 투자자 의견을 한
            화면에서 확인할 수 있습니다.
          </p>
        </div>
        <Badge variant="warning">금전 거래 없음</Badge>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {marketTargets.map((target) => (
          <DirectionPredictionCard
            key={target.id}
            counts={counts[target.id]}
            selectedDirection={votes[target.id]}
            target={target}
            onSelect={handleSelect}
          />
        ))}
      </div>

      <p className="text-xs leading-5 text-slate-500">
        투자 조언 아님: 본 결과는 애프터스톡 커뮤니티 참여자의 시장심리 투표이며, 실제
        매수·매도 판단이나 수익을 보장하지 않습니다.
      </p>
    </section>
  );
}
