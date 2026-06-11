import type { CrowdingLevel, SentimentSnapshot, VoteDirection } from "@/lib/types";

export const crowdingLabels: Record<CrowdingLevel, string> = {
  neutral: "Neutral",
  bullish_crowding: "Bullish crowding",
  bearish_crowding: "Bearish crowding",
  extreme_crowding: "Extreme crowding",
};

export function getCrowdingLevelFromPercents(
  bullishPercent: number,
  bearishPercent: number,
): CrowdingLevel {
  const dominant = Math.max(bullishPercent, bearishPercent);

  if (dominant >= 82) {
    return "extreme_crowding";
  }

  if (bullishPercent >= 64) {
    return "bullish_crowding";
  }

  if (bearishPercent >= 64) {
    return "bearish_crowding";
  }

  return "neutral";
}

export function getContrarianHint(crowdingLevel: CrowdingLevel) {
  if (crowdingLevel === "bullish_crowding" || crowdingLevel === "extreme_crowding") {
    return "의견이 매수 쪽으로 과하게 쏠렸습니다.";
  }

  if (crowdingLevel === "bearish_crowding") {
    return "하락 의견이 우세합니다.";
  }

  return "아직 뚜렷한 쏠림은 없습니다.";
}

export function applyLocalVote(
  snapshot: SentimentSnapshot,
  direction: VoteDirection,
): SentimentSnapshot {
  const bullishVotes = Math.round((snapshot.totalVotes * snapshot.bullishPercent) / 100);
  const bearishVotes = snapshot.totalVotes - bullishVotes;
  const nextBullishVotes = bullishVotes + (direction === "up" ? 1 : 0);
  const nextBearishVotes = bearishVotes + (direction === "down" ? 1 : 0);
  const nextTotalVotes = nextBullishVotes + nextBearishVotes;
  const bullishPercent = Math.round((nextBullishVotes / nextTotalVotes) * 100);
  const bearishPercent = 100 - bullishPercent;
  const crowdingLevel = getCrowdingLevelFromPercents(bullishPercent, bearishPercent);

  return {
    ...snapshot,
    bullishPercent,
    bearishPercent,
    totalVotes: nextTotalVotes,
    crowdingLevel,
    contrarianSignal: getContrarianHint(crowdingLevel),
  };
}
