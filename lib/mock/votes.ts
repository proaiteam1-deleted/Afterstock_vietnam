import type { Vote } from "@/lib/types";

export const votes: Vote[] = [
  {
    id: "vote-1",
    stockSymbol: "005930",
    direction: "up",
    userId: "user-1",
    createdAt: "2026-05-29T20:07:00+09:00",
    sessionDate: "2026-05-29",
  },
  {
    id: "vote-2",
    stockSymbol: "000660",
    direction: "down",
    userId: "user-2",
    createdAt: "2026-05-29T20:16:00+09:00",
    sessionDate: "2026-05-29",
  },
];
