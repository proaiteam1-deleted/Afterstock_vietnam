import type { SentimentHistoryPoint, SentimentSnapshot } from "@/lib/types";

export const sentimentSnapshots: SentimentSnapshot[] = [
  {
    stockSymbol: "005930",
    bullishPercent: 68,
    bearishPercent: 32,
    totalVotes: 14826,
    crowdingLevel: "bullish_crowding",
    contrarianSignal: "의견이 매수 쪽으로 과하게 쏠렸습니다.",
    createdAt: "2026-05-29T20:45:00+09:00",
  },
  {
    stockSymbol: "000660",
    bullishPercent: 47,
    bearishPercent: 53,
    totalVotes: 9824,
    crowdingLevel: "neutral",
    contrarianSignal: "아직 뚜렷한 쏠림은 없습니다.",
    createdAt: "2026-05-29T20:45:00+09:00",
  },
];

export const sentimentHistory: SentimentHistoryPoint[] = [
  {
    stockSymbol: "005930",
    timeLabel: "20:00",
    bullishPercent: 58,
    bearishPercent: 42,
  },
  {
    stockSymbol: "005930",
    timeLabel: "21:00",
    bullishPercent: 62,
    bearishPercent: 38,
  },
  {
    stockSymbol: "005930",
    timeLabel: "22:00",
    bullishPercent: 66,
    bearishPercent: 34,
  },
  {
    stockSymbol: "005930",
    timeLabel: "23:00",
    bullishPercent: 68,
    bearishPercent: 32,
  },
  {
    stockSymbol: "005930",
    timeLabel: "00:00",
    bullishPercent: 65,
    bearishPercent: 35,
  },
  {
    stockSymbol: "005930",
    timeLabel: "01:00",
    bullishPercent: 68,
    bearishPercent: 32,
  },
  {
    stockSymbol: "000660",
    timeLabel: "20:00",
    bullishPercent: 52,
    bearishPercent: 48,
  },
  {
    stockSymbol: "000660",
    timeLabel: "21:00",
    bullishPercent: 49,
    bearishPercent: 51,
  },
  {
    stockSymbol: "000660",
    timeLabel: "22:00",
    bullishPercent: 45,
    bearishPercent: 55,
  },
  {
    stockSymbol: "000660",
    timeLabel: "23:00",
    bullishPercent: 46,
    bearishPercent: 54,
  },
  {
    stockSymbol: "000660",
    timeLabel: "00:00",
    bullishPercent: 48,
    bearishPercent: 52,
  },
  {
    stockSymbol: "000660",
    timeLabel: "01:00",
    bullishPercent: 47,
    bearishPercent: 53,
  },
];
