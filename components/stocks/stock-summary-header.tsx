import { Badge } from "@/components/ui/badge";
import type { Stock } from "@/lib/types";
import { formatCurrencyKRW, formatNumber } from "@/lib/utils/format";

type StockSummaryHeaderProps = {
  stock: Stock;
};

export function StockSummaryHeader({ stock }: StockSummaryHeaderProps) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.045] p-5">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="accent">{stock.market}</Badge>
            <Badge>{stock.symbol}</Badge>
          </div>
          <h1 className="mt-4 text-4xl font-semibold text-white">{stock.nameKo}</h1>
          <p className="mt-2 text-slate-400">{stock.nameEn}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:min-w-[360px]">
          <div className="rounded-md border border-white/10 bg-black/18 p-3">
            <p className="text-xs text-slate-500">Mock price</p>
            <p className="mt-1 text-2xl font-semibold text-white">
              {formatCurrencyKRW(stock.price)}
            </p>
          </div>
          <div className="rounded-md border border-white/10 bg-black/18 p-3">
            <p className="text-xs text-slate-500">Volume</p>
            <p className="mt-1 text-2xl font-semibold text-white">
              {formatNumber(stock.volume)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
