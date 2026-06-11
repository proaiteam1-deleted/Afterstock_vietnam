import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import type { Stock } from "@/lib/types";

type StockCardHeaderProps = {
  stock: Stock;
};

export function StockCardHeader({ stock }: StockCardHeaderProps) {
  return (
    <CardHeader className="border-b border-white/10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>{stock.nameKo}</CardTitle>
            <Badge>{stock.symbol}</Badge>
            <Badge variant="accent">{stock.market}</Badge>
          </div>
          <p className="mt-1 text-sm text-slate-400">{stock.nameEn}</p>
        </div>
        <Button asChild variant="ghost" size="icon" aria-label={`${stock.nameKo} 상세`}>
          <Link href={`/stocks/${stock.symbol}`}>
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </CardHeader>
  );
}
