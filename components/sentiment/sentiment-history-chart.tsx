"use client";

import dynamic from "next/dynamic";

import type { SentimentHistoryPoint } from "@/lib/types";

const SentimentHistoryChartRenderer = dynamic(
  () =>
    import("@/components/sentiment/sentiment-history-chart-renderer").then(
      (module) => module.SentimentHistoryChartRenderer,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full rounded-md border border-white/10 bg-black/18" />
    ),
  },
);

type SentimentHistoryChartProps = {
  data: SentimentHistoryPoint[];
  height?: number;
};

export function SentimentHistoryChart({
  data,
  height = 180,
}: SentimentHistoryChartProps) {
  return (
    <div className="w-full" style={{ height }}>
      <SentimentHistoryChartRenderer data={data} />
    </div>
  );
}
