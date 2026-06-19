"use client";

import { useEffect, useMemo, useState } from "react";

import type { LiveStockQuote } from "@/lib/stocks/liveStockQuotes";
import type { MockStockQuote } from "@/lib/stocks/mockStockQuotes";
import { getMockStockQuote } from "@/lib/stocks/mockStockQuotes";
import type { StockAsset } from "@/types/stock";

export type DisplayStockQuote = MockStockQuote &
  Partial<Pick<LiveStockQuote, "isLive" | "sourceLabel" | "updatedAt">>;

function getRequestPrefix() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.location.pathname.startsWith("/vn") ? "/vn" : "";
}

export function useStockQuote(stock: StockAsset): DisplayStockQuote {
  const fallbackQuote = useMemo(() => getMockStockQuote(stock), [stock]);
  const [quoteState, setQuoteState] = useState<{
    quote: DisplayStockQuote;
    symbol: string;
  } | null>(null);

  useEffect(() => {
    let ignore = false;
    let abortController: AbortController | null = null;

    async function loadQuote() {
      abortController?.abort();
      abortController = new AbortController();

      try {
        const response = await fetch(
          `${getRequestPrefix()}/api/stock-quotes/${encodeURIComponent(stock.symbol)}`,
          {
            cache: "no-store",
            signal: abortController.signal,
          },
        );

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { quote?: DisplayStockQuote };

        if (!ignore && data.quote) {
          setQuoteState({ quote: data.quote, symbol: stock.symbol });
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.warn("Failed to load live stock quote", error);
        }
      }
    }

    void loadQuote();
    const timerId = window.setInterval(() => void loadQuote(), 30_000);

    return () => {
      ignore = true;
      abortController?.abort();
      window.clearInterval(timerId);
    };
  }, [stock.symbol]);

  if (quoteState?.symbol === stock.symbol) {
    return quoteState.quote;
  }

  return fallbackQuote;
}
