import { AppShell } from "@/components/layout/app-shell";
import { DashboardHeading } from "@/components/stocks/dashboard-heading";
import { MarketStatusCard } from "@/components/stocks/market-status-card";
import { StockSentimentCard } from "@/components/stocks/stock-sentiment-card";
import { getStockDashboards } from "@/server/services/afterstock-service";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const dashboards = await getStockDashboards();

  return (
    <AppShell>
      <div className="space-y-6">
        <DashboardHeading />
        <MarketStatusCard />

        <div className="grid gap-5 lg:grid-cols-2">
          {dashboards.map((dashboard) => (
            <StockSentimentCard key={dashboard.stock.symbol} dashboard={dashboard} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
