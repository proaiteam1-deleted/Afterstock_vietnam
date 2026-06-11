import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import type { Stock } from "@/lib/types";
import { formatCurrencyKRW, formatPercent } from "@/lib/utils/format";

type StockCardMarketStatsProps = {
  stock: Stock;
};

export function StockCardMarketStats({ stock }: StockCardMarketStatsProps) {
  const isUp = stock.changePercent >= 0;

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-md border border-white/10 bg-black/18 p-3">
        <p className="text-xs text-slate-500">Mock price</p>
        <p className="mt-1 text-2xl font-semibold text-white">
          {formatCurrencyKRW(stock.price)}
        </p>
      </div>
      <div className="rounded-md border border-white/10 bg-black/18 p-3">
        <p className="text-xs text-slate-500">Daily change</p>
        <p
          className={`mt-1 flex items-center gap-1 text-2xl font-semibold ${
            isUp ? "text-emerald-200" : "text-rose-200"
          }`}
        >
          {isUp ? (
            <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
          ) : (
            <ArrowDownRight className="h-5 w-5" aria-hidden="true" />
          )}
          {formatPercent(stock.changePercent, { signed: true })}
        </p>
      </div>
    </div>
  );
}
