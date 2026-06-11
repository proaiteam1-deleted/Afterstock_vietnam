import { z } from "zod";

export const voteDirectionSchema = z.enum(["up", "down"]);
export type VoteDirection = z.infer<typeof voteDirectionSchema>;

export const crowdingLevelSchema = z.enum([
  "neutral",
  "bullish_crowding",
  "bearish_crowding",
  "extreme_crowding",
]);
export type CrowdingLevel = z.infer<typeof crowdingLevelSchema>;

export const userBadgeSchema = z.enum(["지존", "고수", "평범", "똥손"]);
export type UserBadge = z.infer<typeof userBadgeSchema>;

export type Stock = {
  symbol: string;
  nameKo: string;
  nameEn: string;
  market: "KOSPI" | "KOSDAQ";
  price: number;
  changePercent: number;
  volume: number;
};

export type Vote = {
  id: string;
  stockSymbol: string;
  direction: VoteDirection;
  userId: string;
  createdAt: string;
  sessionDate: string;
};

export type SentimentSnapshot = {
  stockSymbol: string;
  bullishPercent: number;
  bearishPercent: number;
  totalVotes: number;
  crowdingLevel: CrowdingLevel;
  contrarianSignal: string;
  createdAt: string;
};

export type SentimentHistoryPoint = {
  stockSymbol: string;
  timeLabel: string;
  bullishPercent: number;
  bearishPercent: number;
};

export type User = {
  id: string;
  nickname: string;
  accuracyRate: number;
  totalPredictions: number;
  badge: UserBadge;
};

export type CommunityPost = {
  id: string;
  userId: string;
  stockSymbol: string;
  title: string;
  body: string;
  imageUrl?: string;
  createdAt: string;
  likes: number;
};

export type StockDashboard = {
  stock: Stock;
  snapshot: SentimentSnapshot;
  history: SentimentHistoryPoint[];
};

export type VoteSubmissionResult = {
  vote: Vote;
  nextSnapshot: SentimentSnapshot;
  persisted: boolean;
};

export const voteFormSchema = z.object({
  direction: voteDirectionSchema,
});

export type VoteFormInput = z.infer<typeof voteFormSchema>;
