import { NextResponse } from "next/server";

import { fetchLiveStockQuote } from "@/lib/stocks/liveStockQuotes";
import { getMockStockQuote } from "@/lib/stocks/mockStockQuotes";
import { getStockAssetBySymbol } from "@/lib/stocks/mockStocks";

type StockQuoteRouteProps = {
  params: Promise<{
    symbol: string;
  }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_request: Request, { params }: StockQuoteRouteProps) {
  const { symbol } = await params;
  const stock = getStockAssetBySymbol(symbol);

  if (!stock) {
    return NextResponse.json({ error: "Stock not found" }, { status: 404 });
  }

  try {
    const liveQuote = await fetchLiveStockQuote(stock);

    if (liveQuote) {
      return NextResponse.json({ quote: liveQuote });
    }
  } catch (error) {
    console.error("Failed to fetch live stock quote", error);
  }

  return NextResponse.json({
    quote: {
      ...getMockStockQuote(stock),
      isLive: false,
      sourceLabel: "Dữ liệu MVP",
      updatedAt: new Date().toISOString(),
    },
  });
}
