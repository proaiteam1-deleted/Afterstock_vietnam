"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { SentimentHistoryPoint } from "@/lib/types";

type SentimentHistoryChartRendererProps = {
  data: SentimentHistoryPoint[];
};

export function SentimentHistoryChartRenderer({
  data,
}: SentimentHistoryChartRendererProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ left: -26, right: 4, top: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="bullishFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#5eead4" stopOpacity={0.34} />
            <stop offset="95%" stopColor="#5eead4" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="bearishFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#fb7185" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#fb7185" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
        <XAxis
          dataKey="timeLabel"
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "#0b0f19",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 8,
            color: "#e2e8f0",
          }}
          formatter={(value, name) => [
            `${Number(value ?? 0)}%`,
            name === "bullishPercent" ? "상승" : "하락",
          ]}
          labelStyle={{ color: "#cbd5e1" }}
        />
        <Area
          type="monotone"
          dataKey="bullishPercent"
          stroke="#5eead4"
          strokeWidth={2}
          fill="url(#bullishFill)"
        />
        <Area
          type="monotone"
          dataKey="bearishPercent"
          stroke="#fb7185"
          strokeWidth={2}
          fill="url(#bearishFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
