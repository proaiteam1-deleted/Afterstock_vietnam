import type { Metadata } from "next";

import { AppShell } from "@/components/layout/app-shell";
import { StockListPage } from "@/components/stocks/stock-list-page";

export const metadata: Metadata = {
  title: "종목별 의견방",
};

export default function StocksPage() {
  return (
    <AppShell>
      <StockListPage />
    </AppShell>
  );
}
