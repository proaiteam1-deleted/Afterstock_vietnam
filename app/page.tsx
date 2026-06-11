import { StockChartCommunityHome } from "@/components/home/stock-chart-community-home";
import { AppShell } from "@/components/layout/app-shell";

export default function Home() {
  return (
    <AppShell showDisclaimer={false}>
      <StockChartCommunityHome />
    </AppShell>
  );
}
