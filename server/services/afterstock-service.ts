import {
  communityPosts,
  sentimentHistory,
  sentimentSnapshots,
  stocks,
  users,
} from "@/lib/mock";
import { applyLocalVote } from "@/lib/domain/sentiment";
import type {
  CommunityPost,
  SentimentHistoryPoint,
  SentimentSnapshot,
  Stock,
  StockDashboard,
  User,
  Vote,
  VoteDirection,
  VoteSubmissionResult,
} from "@/lib/types";

function cloneStock(stock: Stock): Stock {
  return { ...stock };
}

function cloneSnapshot(snapshot: SentimentSnapshot): SentimentSnapshot {
  return { ...snapshot };
}

function cloneHistoryPoint(point: SentimentHistoryPoint): SentimentHistoryPoint {
  return { ...point };
}

function clonePost(post: CommunityPost): CommunityPost {
  return { ...post };
}

function cloneUser(user: User): User {
  return { ...user };
}

/**
 * Lists supported stocks for the current product scope.
 *
 * Today this returns local mock data. When Supabase is connected, replace the
 * internals with a read from the `stocks` table while preserving the return type.
 */
export async function getStocks(): Promise<Stock[]> {
  return stocks.map(cloneStock);
}

/**
 * Fetches one supported stock by Korean market symbol.
 *
 * Use this as the route-facing lookup boundary so pages do not import mock data
 * directly. The future Supabase version should query `stocks.symbol`.
 */
export async function getStockBySymbol(symbol: string): Promise<Stock | undefined> {
  const stock = stocks.find((item) => item.symbol === symbol);
  return stock ? cloneStock(stock) : undefined;
}

/**
 * Fetches the latest sentiment snapshot for a stock symbol.
 *
 * This function is intentionally narrow because it maps directly to the future
 * `sentiment_snapshots` read path.
 */
export async function getSentimentBySymbol(
  symbol: string,
): Promise<SentimentSnapshot | undefined> {
  const snapshot = sentimentSnapshots.find((item) => item.stockSymbol === symbol);
  return snapshot ? cloneSnapshot(snapshot) : undefined;
}

/**
 * Submits an up/down vote for the active after-market session.
 *
 * Mock mode returns an optimistic vote plus a recalculated snapshot, but does not
 * persist anything. Replace the body with a Supabase insert/server action once
 * auth and one-vote-per-session constraints are in place.
 */
export async function submitVote(
  stockSymbol: string,
  direction: VoteDirection,
): Promise<VoteSubmissionResult> {
  const snapshot = await getSentimentBySymbol(stockSymbol);

  if (!snapshot) {
    throw new Error(`Cannot submit vote for unknown stock: ${stockSymbol}`);
  }

  const now = new Date();
  const vote: Vote = {
    id: `mock-vote-${stockSymbol}-${now.getTime()}`,
    stockSymbol,
    direction,
    userId: "mock-user",
    createdAt: now.toISOString(),
    sessionDate: now.toISOString().slice(0, 10),
  };

  return {
    vote,
    nextSnapshot: applyLocalVote(snapshot, direction),
    persisted: false,
  };
}

/**
 * Lists community posts, optionally filtered to one stock symbol.
 *
 * Keep callers behind this service so a future Supabase implementation can add
 * joins, pagination, moderation filters, and storage URLs without page rewrites.
 */
export async function getCommunityPosts(stockSymbol?: string): Promise<CommunityPost[]> {
  const posts = stockSymbol
    ? communityPosts.filter((post) => post.stockSymbol === stockSymbol)
    : communityPosts;

  return posts.map(clonePost);
}

/**
 * Lists top predictors for the leaderboard preview.
 *
 * The optional stock symbol is accepted now so the call site will not change
 * when per-stock prediction accuracy is introduced later.
 */
export async function getTopPredictors(stockSymbol?: string): Promise<User[]> {
  // TODO: Use stockSymbol once prediction_results supports per-stock accuracy.
  void stockSymbol;

  return [...users]
    .sort((a, b) => b.accuracyRate - a.accuracyRate)
    .slice(0, 3)
    .map(cloneUser);
}

export async function getUserProfiles(): Promise<User[]> {
  return users.map(cloneUser);
}

export async function getUserById(userId: string): Promise<User | undefined> {
  const user = users.find((item) => item.id === userId);
  return user ? cloneUser(user) : undefined;
}

export async function getSentimentHistoryBySymbol(
  symbol: string,
): Promise<SentimentHistoryPoint[]> {
  return sentimentHistory
    .filter((item) => item.stockSymbol === symbol)
    .map(cloneHistoryPoint);
}

export async function getStockDashboard(
  symbol: string,
): Promise<StockDashboard | undefined> {
  const [stock, snapshot, history] = await Promise.all([
    getStockBySymbol(symbol),
    getSentimentBySymbol(symbol),
    getSentimentHistoryBySymbol(symbol),
  ]);

  if (!stock || !snapshot) {
    return undefined;
  }

  return { stock, snapshot, history };
}

export async function getStockDashboards(): Promise<StockDashboard[]> {
  const supportedStocks = await getStocks();

  return Promise.all(
    supportedStocks.map(async (stock) => {
      const dashboard = await getStockDashboard(stock.symbol);

      if (!dashboard) {
        throw new Error(`Missing stock dashboard data for ${stock.symbol}`);
      }

      return dashboard;
    }),
  );
}
