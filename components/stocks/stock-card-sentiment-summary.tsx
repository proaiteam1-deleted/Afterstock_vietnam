import type { SentimentSnapshot } from "@/lib/types";
import { formatNumber } from "@/lib/utils/format";

type StockCardSentimentSummaryProps = {
  snapshot: SentimentSnapshot;
};

export function StockCardSentimentSummary({ snapshot }: StockCardSentimentSummaryProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-md border border-white/10 bg-black/18 p-3">
        <p className="text-xs text-slate-500">Total votes</p>
        <p className="mt-1 text-xl font-semibold text-white">
          {formatNumber(snapshot.totalVotes)}
        </p>
      </div>
      <div className="rounded-md border border-white/10 bg-black/18 p-3 sm:col-span-2">
        <p className="text-xs text-slate-500">Contrarian hint</p>
        <p className="mt-1 text-sm font-medium text-slate-100">
          {snapshot.contrarianSignal}
        </p>
      </div>
    </div>
  );
}
