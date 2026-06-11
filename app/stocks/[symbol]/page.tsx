import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { StockDetailPage } from "@/components/stocks/stock-detail-page";
import { getStockAssetBySymbol, stockAssets } from "@/lib/stocks/mockStocks";

type StockPageProps = {
  params: Promise<{
    symbol: string;
  }>;
};

export function generateStaticParams() {
  return stockAssets.map((stock) => ({ symbol: stock.symbol }));
}

export async function generateMetadata({ params }: StockPageProps): Promise<Metadata> {
  const { symbol } = await params;
  const stock = getStockAssetBySymbol(symbol);

  return {
    title: stock ? `${stock.displayName} 의견방` : "종목 의견방",
  };
}

export default async function StockSymbolPage({ params }: StockPageProps) {
  const { symbol } = await params;
  const stock = getStockAssetBySymbol(symbol);

  if (!stock) {
    notFound();
  }

  return (
    <AppShell>
      <StockDetailPage symbol={symbol} />
    </AppShell>
  );
}
