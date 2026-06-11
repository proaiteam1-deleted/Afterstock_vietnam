import { AppShell } from "@/components/layout/app-shell";
import { MarketSentimentDashboard } from "@/components/market-sentiment/market-sentiment-dashboard";

export const metadata = {
  title: "시장심리",
};

export default function MarketSentimentPage() {
  return (
    <AppShell>
      <MarketSentimentDashboard />
    </AppShell>
  );
}
