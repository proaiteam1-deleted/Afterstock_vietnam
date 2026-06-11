import { BrainCircuit } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { crowdingLabels } from "@/lib/domain/sentiment";
import type { SentimentSnapshot, Stock } from "@/lib/types";

type AIInsightCardProps = {
  stock: Stock;
  snapshot: SentimentSnapshot;
};

export function AIInsightCard({ stock, snapshot }: AIInsightCardProps) {
  const isBullishDominant = snapshot.bullishPercent >= snapshot.bearishPercent;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-cyan-200" aria-hidden="true" />
            AI-style interpretation
          </CardTitle>
          <p className="mt-1 text-sm text-slate-400">
            다음 장 방향을 보장하지 않는 심리 해석입니다.
          </p>
        </div>
        <Badge variant={snapshot.crowdingLevel === "neutral" ? "default" : "warning"}>
          {crowdingLabels[snapshot.crowdingLevel]}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4 text-sm leading-7 text-slate-300">
        <p>
          {stock.nameKo}의 장 마감 후 의견은 현재{" "}
          <span className={isBullishDominant ? "text-emerald-200" : "text-rose-200"}>
            {isBullishDominant ? "상승" : "하락"} 쪽으로 더 많이 기울어져 있습니다.
          </span>{" "}
          다만 AfterStock은 이 쏠림을 확정적인 예측이 아니라 다음 장에서 확인할 군중
          심리의 압력으로 해석합니다.
        </p>
        <div className="rounded-md border border-white/10 bg-black/20 p-3 text-slate-200">
          {snapshot.contrarianSignal}
        </div>
      </CardContent>
    </Card>
  );
}
