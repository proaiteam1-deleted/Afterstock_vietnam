import {
  buildInitialMarketPredictionCounts,
  normalizeMarketPredictionStorage,
  type MarketPredictionStorage,
} from "@/lib/domain/market-predictions";
import {
  beastHeartPosts,
  fastReactionIssues,
  initialChatMessages,
  stockOpinionPosts,
  type BeastHeartPost,
  type CaptureTradingPost,
  type ChatMessageSeed,
  type FastReactionIssue,
  type StockOpinionPost,
} from "@/lib/mock/market-community";
import {
  getUserProfile as getProfileFromStorage,
  setUserProfile as setProfileInStorage,
} from "@/lib/profile/profileStorage";
import {
  stockDiscussionComments,
  type StockDiscussionComment,
} from "@/lib/mock/stock-details";
import { mockStockOpinions } from "@/lib/stocks/mockStocks";
import {
  getOrSeedStockBoardPostsBySymbol as getBoardPostsBySymbolFromStorage,
  getOrSeedStockOpinionsBySymbol as getOpinionsBySymbolFromStorage,
  setStockBoardPostsBySymbol as setBoardPostsBySymbolInStorage,
  setStockOpinionsBySymbol as setOpinionsBySymbolInStorage,
} from "@/lib/stocks/stockStorage";
import type { StockBoardPost, StockOpinion, UserProfile } from "@/types/stock";

type StockProfileOpinion = StockOpinion;
type StockUserProfile = UserProfile;

export const STORAGE_KEYS = {
  marketPredictions: "afterstock:market-direction-predictions:v1",
  chatMessages: "afterstock:retail-chat:messages:v1",
  chatNickname: "afterstock:retail-chat:nickname:v1",
  captureTradingPosts: "afterstock:capture-trading-posts:v1",
  stockOpinions: "afterstock:stock-opinion-posts:v1",
  fastReactionIssues: "afterstock:fast-reaction-issues:v1",
  beastHeartPosts: "afterstock:beast-heart-posts:v1",
  stockProfileOpinions: "afterstock:stock-profile-opinions:v1",
  stockDiscussionComments: "afterstock:stock-discussion-comments:v1",
  stockUserProfile: "afterstock:stock-user-profile:v1",
} as const;

export const STOCK_STORAGE_KEY_PREFIXES = {
  boardPostsBySymbol: "afterstock:stock-board-posts:v1",
  profileOpinionsBySymbol: "afterstock:stock-profile-opinions:v1",
} as const;

const MAX_STORED_CHAT_MESSAGES = 100;

type StorageKey = string;

function getLocalStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function readJson<T>(key: StorageKey, normalize: (value: unknown) => T | null) {
  const storage = getLocalStorage();

  if (!storage) {
    return null;
  }

  try {
    const rawValue = storage.getItem(key);

    if (!rawValue) {
      return null;
    }

    return normalize(JSON.parse(rawValue));
  } catch {
    return null;
  }
}

function writeJson<T>(key: StorageKey, value: T) {
  const storage = getLocalStorage();

  if (!storage) {
    return;
  }

  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage can fail in private browsing, quota limits, or blocked contexts.
  }
}

function readText(key: StorageKey) {
  const storage = getLocalStorage();

  if (!storage) {
    return null;
  }

  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function writeText(key: StorageKey, value: string) {
  const storage = getLocalStorage();

  if (!storage) {
    return;
  }

  try {
    storage.setItem(key, value);
  } catch {
    // localStorage can fail in private browsing, quota limits, or blocked contexts.
  }
}

function normalizeArray<T>(value: unknown) {
  if (!Array.isArray(value)) {
    return null;
  }

  return value as T[];
}

export function getMarketPredictionStorage() {
  return readJson(STORAGE_KEYS.marketPredictions, normalizeMarketPredictionStorage);
}

export function getOrSeedMarketPredictionStorage() {
  const predictions = getMarketPredictionStorage();

  if (predictions) {
    return predictions;
  }

  const initialPredictions = {
    counts: buildInitialMarketPredictionCounts(),
    votes: {},
  };

  setMarketPredictionStorage(initialPredictions);

  return initialPredictions;
}

export function setMarketPredictionStorage(storage: MarketPredictionStorage) {
  writeJson(STORAGE_KEYS.marketPredictions, storage);
}

export function updateMarketPredictionStorage(
  updater: (current: MarketPredictionStorage) => MarketPredictionStorage,
) {
  const current = getOrSeedMarketPredictionStorage();
  const next = updater(current);

  setMarketPredictionStorage(next);

  return next;
}

export function getOrSeedChatMessages() {
  const messages = readJson<ChatMessageSeed[]>(
    STORAGE_KEYS.chatMessages,
    normalizeArray<ChatMessageSeed>,
  );

  if (messages) {
    return messages.slice(0, MAX_STORED_CHAT_MESSAGES);
  }

  setChatMessages(initialChatMessages);

  return initialChatMessages;
}

export function setChatMessages(messages: ChatMessageSeed[]) {
  writeJson(STORAGE_KEYS.chatMessages, messages.slice(0, MAX_STORED_CHAT_MESSAGES));
}

export function updateChatMessages(
  updater: (current: ChatMessageSeed[]) => ChatMessageSeed[],
) {
  const next = updater(getOrSeedChatMessages()).slice(0, MAX_STORED_CHAT_MESSAGES);

  setChatMessages(next);

  return next;
}

export function getChatNickname() {
  return readText(STORAGE_KEYS.chatNickname);
}

export function setChatNickname(nickname: string) {
  writeText(STORAGE_KEYS.chatNickname, nickname);
}

function normalizeStockUserProfile(value: unknown) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const profile = value as StockUserProfile;

  if (
    typeof profile.nickname !== "string" ||
    typeof profile.avatarType !== "string" ||
    typeof profile.investorType !== "string" ||
    typeof profile.createdAt !== "string"
  ) {
    return null;
  }

  return profile;
}

export function getStockUserProfile() {
  return (
    getProfileFromStorage() ??
    readJson(STORAGE_KEYS.stockUserProfile, normalizeStockUserProfile)
  );
}

export function setStockUserProfile(profile: StockUserProfile) {
  setProfileInStorage(profile);
}

export function getCaptureTradingPosts() {
  return (
    readJson<CaptureTradingPost[]>(
      STORAGE_KEYS.captureTradingPosts,
      normalizeArray<CaptureTradingPost>,
    ) ?? []
  );
}

export function getOrSeedCaptureTradingPosts() {
  const posts = getCaptureTradingPosts();

  setCaptureTradingPosts(posts);

  return posts;
}

export function setCaptureTradingPosts(posts: CaptureTradingPost[]) {
  writeJson(STORAGE_KEYS.captureTradingPosts, posts);
}

export function updateCaptureTradingPosts(
  updater: (current: CaptureTradingPost[]) => CaptureTradingPost[],
) {
  const next = updater(getCaptureTradingPosts());

  setCaptureTradingPosts(next);

  return next;
}

export function getOrSeedStockOpinions() {
  const opinions = readJson<StockOpinionPost[]>(
    STORAGE_KEYS.stockOpinions,
    normalizeArray<StockOpinionPost>,
  );

  if (opinions) {
    return opinions;
  }

  setStockOpinions(stockOpinionPosts);

  return stockOpinionPosts;
}

export function setStockOpinions(posts: StockOpinionPost[]) {
  writeJson(STORAGE_KEYS.stockOpinions, posts);
}

export function updateStockOpinions(
  updater: (current: StockOpinionPost[]) => StockOpinionPost[],
) {
  const next = updater(getOrSeedStockOpinions());

  setStockOpinions(next);

  return next;
}

export function getOrSeedFastReactionIssues() {
  const issues = readJson<FastReactionIssue[]>(
    STORAGE_KEYS.fastReactionIssues,
    normalizeArray<FastReactionIssue>,
  );

  if (issues) {
    return issues;
  }

  setFastReactionIssues(fastReactionIssues);

  return fastReactionIssues;
}

export function setFastReactionIssues(issues: FastReactionIssue[]) {
  writeJson(STORAGE_KEYS.fastReactionIssues, issues);
}

export function updateFastReactionIssues(
  updater: (current: FastReactionIssue[]) => FastReactionIssue[],
) {
  const next = updater(getOrSeedFastReactionIssues());

  setFastReactionIssues(next);

  return next;
}

export function getOrSeedBeastHeartPosts() {
  const posts = readJson<BeastHeartPost[]>(
    STORAGE_KEYS.beastHeartPosts,
    normalizeArray<BeastHeartPost>,
  );

  if (posts) {
    return posts;
  }

  setBeastHeartPosts(beastHeartPosts);

  return beastHeartPosts;
}

export function setBeastHeartPosts(posts: BeastHeartPost[]) {
  writeJson(STORAGE_KEYS.beastHeartPosts, posts);
}

export function updateBeastHeartPosts(
  updater: (current: BeastHeartPost[]) => BeastHeartPost[],
) {
  const next = updater(getOrSeedBeastHeartPosts());

  setBeastHeartPosts(next);

  return next;
}

export function getOrSeedStockProfileOpinions() {
  const opinions = readJson<StockProfileOpinion[]>(
    STORAGE_KEYS.stockProfileOpinions,
    normalizeArray<StockProfileOpinion>,
  );

  if (opinions) {
    return opinions;
  }

  setStockProfileOpinions(mockStockOpinions);

  return mockStockOpinions;
}

export function setStockProfileOpinions(opinions: StockProfileOpinion[]) {
  writeJson(STORAGE_KEYS.stockProfileOpinions, opinions);
}

export function updateStockProfileOpinions(
  updater: (current: StockProfileOpinion[]) => StockProfileOpinion[],
) {
  const next = updater(getOrSeedStockProfileOpinions());

  setStockProfileOpinions(next);

  return next;
}

export function getOrSeedStockProfileOpinionsBySymbol(symbol: string) {
  return getOpinionsBySymbolFromStorage(symbol);
}

export function setStockProfileOpinionsBySymbol(
  symbol: string,
  opinions: StockProfileOpinion[],
) {
  setOpinionsBySymbolInStorage(symbol, opinions);
}

export function updateStockProfileOpinionsBySymbol(
  symbol: string,
  updater: (current: StockProfileOpinion[]) => StockProfileOpinion[],
) {
  const next = updater(getOrSeedStockProfileOpinionsBySymbol(symbol));

  setStockProfileOpinionsBySymbol(symbol, next);

  return next;
}

export function getOrSeedStockDiscussionComments() {
  const comments = readJson<StockDiscussionComment[]>(
    STORAGE_KEYS.stockDiscussionComments,
    normalizeArray<StockDiscussionComment>,
  );

  if (comments) {
    return comments;
  }

  setStockDiscussionComments(stockDiscussionComments);

  return stockDiscussionComments;
}

export function setStockDiscussionComments(comments: StockDiscussionComment[]) {
  writeJson(STORAGE_KEYS.stockDiscussionComments, comments);
}

export function updateStockDiscussionComments(
  updater: (current: StockDiscussionComment[]) => StockDiscussionComment[],
) {
  const next = updater(getOrSeedStockDiscussionComments());

  setStockDiscussionComments(next);

  return next;
}

export function getOrSeedStockBoardPostsBySymbol(symbol: string) {
  return getBoardPostsBySymbolFromStorage(symbol);
}

export function setStockBoardPostsBySymbol(symbol: string, posts: StockBoardPost[]) {
  setBoardPostsBySymbolInStorage(symbol, posts);
}

export function updateStockBoardPostsBySymbol(
  symbol: string,
  updater: (current: StockBoardPost[]) => StockBoardPost[],
) {
  const next = updater(getOrSeedStockBoardPostsBySymbol(symbol));

  setStockBoardPostsBySymbol(symbol, next);

  return next;
}
