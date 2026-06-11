import { FallbackChart } from "@/components/stocks/fallback-chart";
import type { StockAsset } from "@/types/stock";

type StockChartPlaceholderProps = {
  stock: StockAsset;
};

export function StockChartPlaceholder({ stock }: StockChartPlaceholderProps) {
  return <FallbackChart stock={stock} />;
}
