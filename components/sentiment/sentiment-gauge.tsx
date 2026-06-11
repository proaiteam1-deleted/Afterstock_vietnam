import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { crowdingLabels } from "@/lib/domain/sentiment";
import type { CrowdingLevel } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

type SentimentGaugeProps = {
  bullishPercent: number;
  bearishPercent: number;
  crowdingLevel: CrowdingLevel;
  compact?: boolean;
};

export function SentimentGauge({
  bullishPercent,
  bearishPercent,
  crowdingLevel,
  compact,
}: SentimentGaugeProps) {
  const dominantClass =
    bullishPercent >= bearishPercent ? "text-emerald-200" : "text-rose-200";
  const degrees = bullishPercent * 3.6;

  return (
    <div className={cn("grid gap-4", compact ? "sm:grid-cols-[96px_1fr]" : "")}>
      <div
        className="relative mx-auto flex aspect-square w-24 items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(#5eead4 ${degrees}deg, #fb7185 ${degrees}deg)`,
        }}
        aria-label={`Bullish ${bullishPercent}%, bearish ${bearishPercent}%`}
      >
        <div className="flex h-[76px] w-[76px] flex-col items-center justify-center rounded-full bg-[#080b12]">
          <span className={cn("text-2xl font-semibold", dominantClass)}>
            {Math.max(bullishPercent, bearishPercent)}%
          </span>
          <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
            crowd
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <ArrowUpRight className="h-4 w-4 text-emerald-300" aria-hidden="true" />
            상승 심리
          </div>
          <span className="text-sm font-semibold text-emerald-200">
            {bullishPercent}%
          </span>
        </div>
        <Progress
          value={bullishPercent}
          indicatorClassName="bg-emerald-300"
          aria-label="Bullish sentiment"
        />

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <ArrowDownRight className="h-4 w-4 text-rose-300" aria-hidden="true" />
            하락 심리
          </div>
          <span className="text-sm font-semibold text-rose-200">{bearishPercent}%</span>
        </div>
        <Progress
          value={bearishPercent}
          indicatorClassName="bg-rose-300"
          aria-label="Bearish sentiment"
        />

        <div className="rounded-md border border-white/10 bg-black/18 px-3 py-2 text-xs text-slate-400">
          Sentiment label:{" "}
          <span className="font-medium text-slate-100">
            {crowdingLabels[crowdingLevel]}
          </span>
        </div>
      </div>
    </div>
  );
}
