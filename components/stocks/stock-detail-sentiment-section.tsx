import { BarChart3 } from "lucide-react";

import { AIInsightCard } from "@/components/sentiment/ai-insight-card";
import { SentimentGauge } from "@/components/sentiment/sentiment-gauge";
import { SentimentHistoryChart } from "@/components/sentiment/sentiment-history-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VotePanel } from "@/components/vote/vote-panel";
import type { SentimentHistoryPoint, SentimentSnapshot, Stock } from "@/lib/types";
import { formatPercent } from "@/lib/utils/format";

type StockDetailSentimentSectionProps = {
  stock: Stock;
  snapshot: SentimentSnapshot;
  history: SentimentHistoryPoint[];
};

export function StockDetailSentimentSection({
  stock,
  snapshot,
  history,
}: StockDetailSentimentSectionProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.4fr_0.9fr]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-cyan-200" aria-hidden="true" />
            Long/short sentiment split
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <SentimentGauge
            bullishPercent={snapshot.bullishPercent}
            bearishPercent={snapshot.bearishPercent}
            crowdingLevel={snapshot.crowdingLevel}
            compact
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-white/10 bg-black/18 p-3">
              <p className="text-xs text-slate-500">Bullish</p>
              <p className="mt-1 text-2xl font-semibold text-emerald-200">
                {snapshot.bullishPercent}%
              </p>
            </div>
            <div className="rounded-md border border-white/10 bg-black/18 p-3">
              <p className="text-xs text-slate-500">Bearish</p>
              <p className="mt-1 text-2xl font-semibold text-rose-200">
                {snapshot.bearishPercent}%
              </p>
            </div>
            <div className="rounded-md border border-white/10 bg-black/18 p-3">
              <p className="text-xs text-slate-500">Daily change</p>
              <p className="mt-1 text-2xl font-semibold text-white">
                {formatPercent(stock.changePercent, { signed: true })}
              </p>
            </div>
          </div>
          <SentimentHistoryChart data={history} height={260} />
        </CardContent>
      </Card>

      <div className="space-y-5">
        <VotePanel stockSymbol={stock.symbol} />
        <AIInsightCard stock={stock} snapshot={snapshot} />
      </div>
    </div>
  );
}
