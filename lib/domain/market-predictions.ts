import {
  marketTargets,
  type MarketDirection,
  type MarketPredictionCounts,
} from "@/lib/mock/market-community";

export type MarketPredictionStorage = {
  counts: Record<string, MarketPredictionCounts>;
  votes: Record<string, MarketDirection>;
};

export function buildInitialMarketPredictionCounts(): Record<
  string,
  MarketPredictionCounts
> {
  return marketTargets.reduce<Record<string, MarketPredictionCounts>>((state, target) => {
    state[target.id] = {
      up: target.initialUp,
      down: target.initialDown,
    };

    return state;
  }, {});
}

export function getMarketPredictionPercent(value: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

export function normalizeMarketPredictionStorage(
  value: unknown,
): MarketPredictionStorage | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<MarketPredictionStorage>;

  if (!candidate.counts || !candidate.votes) {
    return null;
  }

  return {
    counts: {
      ...buildInitialMarketPredictionCounts(),
      ...candidate.counts,
    },
    votes: candidate.votes,
  };
}
