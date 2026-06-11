"use client";

import { useState } from "react";

import { SentimentGauge } from "@/components/sentiment/sentiment-gauge";
import { SentimentHistoryChart } from "@/components/sentiment/sentiment-history-chart";
import { StockCardHeader } from "@/components/stocks/stock-card-header";
import { StockCardMarketStats } from "@/components/stocks/stock-card-market-stats";
import { StockCardSentimentSummary } from "@/components/stocks/stock-card-sentiment-summary";
import { Card, CardContent } from "@/components/ui/card";
import { VotePanel } from "@/components/vote/vote-panel";
import { applyLocalVote, crowdingLabels } from "@/lib/domain/sentiment";
import type { SentimentSnapshot, StockDashboard } from "@/lib/types";

type StockSentimentCardProps = {
  dashboard: StockDashboard;
};

export function StockSentimentCard({ dashboard }: StockSentimentCardProps) {
  const [snapshot, setSnapshot] = useState<SentimentSnapshot>(dashboard.snapshot);
  const { stock, history } = dashboard;

  return (
    <Card className="overflow-hidden">
      <StockCardHeader stock={stock} />

      <CardContent className="space-y-5 pt-5">
        <StockCardMarketStats stock={stock} />

        <SentimentGauge
          bullishPercent={snapshot.bullishPercent}
          bearishPercent={snapshot.bearishPercent}
          crowdingLevel={snapshot.crowdingLevel}
          compact
        />

        <StockCardSentimentSummary snapshot={snapshot} />

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-white">Sentiment history</p>
            <span className="text-xs text-slate-500">
              {crowdingLabels[snapshot.crowdingLevel]}
            </span>
          </div>
          <SentimentHistoryChart data={history} height={150} />
        </div>

        <VotePanel
          stockSymbol={stock.symbol}
          compact
          onVote={(direction) =>
            setSnapshot((current) => applyLocalVote(current, direction))
          }
        />
      </CardContent>
    </Card>
  );
}
