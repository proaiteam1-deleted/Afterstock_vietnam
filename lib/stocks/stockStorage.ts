import { mockStockBoardPosts, mockStockOpinions } from "@/lib/stocks/mockStocks";
import type { StockBoardPost, StockOpinion } from "@/types/stock";

export const STOCK_STORAGE_KEYS = {
  opinionsBySymbol: "afterstock:stock-profile-opinions:v1",
  boardPostsBySymbol: "afterstock:stock-board-posts:v1",
} as const;

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function normalizeSymbol(symbol: string) {
  return decodeURIComponent(symbol).trim();
}

function getSymbolStorageKey(prefix: string, symbol: string) {
  return `${prefix}:${encodeURIComponent(normalizeSymbol(symbol))}`;
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) {
    return fallback;
  }

  try {
    const rawValue = window.localStorage.getItem(key);

    if (!rawValue) {
      return fallback;
    }

    const parsedValue = JSON.parse(rawValue);

    return Array.isArray(fallback) && !Array.isArray(parsedValue)
      ? fallback
      : (parsedValue as T);
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function normalizeStockOpinion(value: unknown, symbol: string) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Partial<StockOpinion> & {
    period?: StockOpinion["timeHorizon"];
    profile?: {
      avatarType?: StockOpinion["avatarType"];
      investorType?: StockOpinion["investorType"];
      nickname?: string;
    };
    stance?: StockOpinion["direction"];
    tag?: string;
  };
  const body = typeof record.body === "string" ? record.body : "";
  const title = typeof record.title === "string" ? record.title : body.slice(0, 34);

  if (!body || !title) {
    return null;
  }

  return {
    id: typeof record.id === "string" ? record.id : `stock-opinion-${Date.now()}`,
    symbol: typeof record.symbol === "string" ? record.symbol : normalizeSymbol(symbol),
    userId:
      typeof record.userId === "string"
        ? record.userId
        : `legacy-user-${typeof record.nickname === "string" ? record.nickname : "unknown"}`,
    nickname:
      typeof record.nickname === "string"
        ? record.nickname
        : (record.profile?.nickname ?? "Nhà đầu tư ẩn danh"),
    avatarType: record.avatarType ?? record.profile?.avatarType ?? "seed",
    investorType: record.investorType ?? record.profile?.investorType ?? "Nhà đầu tư cá nhân",
    direction: record.direction ?? record.stance ?? "neutral",
    title,
    body,
    tags: Array.isArray(record.tags)
      ? record.tags.filter((tag): tag is string => typeof tag === "string")
      : typeof record.tag === "string" && record.tag
        ? [record.tag]
        : [],
    timeHorizon: record.timeHorizon ?? record.period ?? "Hôm nay",
    reasons: Array.isArray(record.reasons)
      ? record.reasons.filter(
          (reason): reason is StockOpinion["reasons"][number] =>
            typeof reason === "string",
        )
      : ["커뮤니티 분위기"],
    likes: typeof record.likes === "number" ? record.likes : 0,
    dislikes: typeof record.dislikes === "number" ? record.dislikes : 0,
    createdAt:
      typeof record.createdAt === "string" ? record.createdAt : new Date().toISOString(),
    commentCount: typeof record.commentCount === "number" ? record.commentCount : 0,
  } satisfies StockOpinion;
}

function normalizeStockOpinions(values: unknown[], symbol: string) {
  return values
    .map((value) => normalizeStockOpinion(value, symbol))
    .filter((opinion): opinion is StockOpinion => Boolean(opinion));
}

function normalizeStockBoardPost(value: unknown, symbol: string) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Partial<StockBoardPost> & {
    head?: StockBoardPost["category"];
  };

  if (typeof record.title !== "string" || typeof record.body !== "string") {
    return null;
  }

  const postId = typeof record.id === "string" ? record.id : `stock-board-${Date.now()}`;
  const comments = Array.isArray(record.comments)
    ? record.comments
        .map((comment) => {
          if (!comment || typeof comment !== "object") {
            return null;
          }

          const commentRecord = comment as Partial<StockBoardPost["comments"][number]>;

          if (typeof commentRecord.body !== "string") {
            return null;
          }

          return {
            id:
              typeof commentRecord.id === "string"
                ? commentRecord.id
                : `stock-comment-${postId}-${Date.now()}`,
            postId:
              typeof commentRecord.postId === "string" ? commentRecord.postId : postId,
            nickname:
              typeof commentRecord.nickname === "string"
                ? commentRecord.nickname
                : "Nhà đầu tư ẩn danh",
            body: commentRecord.body,
            likes: typeof commentRecord.likes === "number" ? commentRecord.likes : 0,
            dislikes:
              typeof commentRecord.dislikes === "number" ? commentRecord.dislikes : 0,
            createdAt:
              typeof commentRecord.createdAt === "string"
                ? commentRecord.createdAt
                : new Date().toISOString(),
          };
        })
        .filter((comment): comment is StockBoardPost["comments"][number] =>
          Boolean(comment),
        )
    : [];

  return {
    id: postId,
    symbol: typeof record.symbol === "string" ? record.symbol : normalizeSymbol(symbol),
    category: record.category ?? record.head ?? "Chung",
    title: record.title,
    body: record.body,
    nickname: typeof record.nickname === "string" ? record.nickname : "Nhà đầu tư ẩn danh",
    comments,
    views: typeof record.views === "number" ? record.views : 0,
    likes: typeof record.likes === "number" ? record.likes : 0,
    dislikes: typeof record.dislikes === "number" ? record.dislikes : 0,
    createdAt:
      typeof record.createdAt === "string" ? record.createdAt : new Date().toISOString(),
  } satisfies StockBoardPost;
}

function normalizeStockBoardPosts(values: unknown[], symbol: string) {
  return values
    .map((value) => normalizeStockBoardPost(value, symbol))
    .filter((post): post is StockBoardPost => Boolean(post));
}

export function getStockOpinionsKey(symbol: string) {
  return getSymbolStorageKey(STOCK_STORAGE_KEYS.opinionsBySymbol, symbol);
}

export function getStockBoardPostsKey(symbol: string) {
  return getSymbolStorageKey(STOCK_STORAGE_KEYS.boardPostsBySymbol, symbol);
}

export function getMockStockOpinionsBySymbol(symbol: string) {
  const normalizedSymbol = normalizeSymbol(symbol).toLowerCase();

  return mockStockOpinions.filter(
    (opinion) => opinion.symbol.toLowerCase() === normalizedSymbol,
  );
}

export function getMockStockBoardPostsBySymbol(symbol: string) {
  const normalizedSymbol = normalizeSymbol(symbol).toLowerCase();

  return mockStockBoardPosts.filter(
    (post) => post.symbol.toLowerCase() === normalizedSymbol,
  );
}

export function getOrSeedStockOpinionsBySymbol(symbol: string) {
  const key = getStockOpinionsKey(symbol);
  const savedOpinions = normalizeStockOpinions(readJson<unknown[]>(key, []), symbol);

  if (savedOpinions.length > 0) {
    writeJson(key, savedOpinions);
    return savedOpinions;
  }

  const seededOpinions = getMockStockOpinionsBySymbol(symbol);
  writeJson(key, seededOpinions);

  return seededOpinions;
}

export function setStockOpinionsBySymbol(symbol: string, opinions: StockOpinion[]) {
  writeJson(getStockOpinionsKey(symbol), opinions);
}

export function updateStockOpinionsBySymbol(
  symbol: string,
  updater: (current: StockOpinion[]) => StockOpinion[],
) {
  const nextOpinions = updater(getOrSeedStockOpinionsBySymbol(symbol));
  setStockOpinionsBySymbol(symbol, nextOpinions);

  return nextOpinions;
}

export function getOrSeedStockBoardPostsBySymbol(symbol: string) {
  const key = getStockBoardPostsKey(symbol);
  const savedPosts = normalizeStockBoardPosts(readJson<unknown[]>(key, []), symbol);

  if (savedPosts.length > 0) {
    writeJson(key, savedPosts);
    return savedPosts;
  }

  const seededPosts = getMockStockBoardPostsBySymbol(symbol);
  writeJson(key, seededPosts);

  return seededPosts;
}

export function setStockBoardPostsBySymbol(symbol: string, posts: StockBoardPost[]) {
  writeJson(getStockBoardPostsKey(symbol), posts);
}

export function updateStockBoardPostsBySymbol(
  symbol: string,
  updater: (current: StockBoardPost[]) => StockBoardPost[],
) {
  const nextPosts = updater(getOrSeedStockBoardPostsBySymbol(symbol));
  setStockBoardPostsBySymbol(symbol, nextPosts);

  return nextPosts;
}
