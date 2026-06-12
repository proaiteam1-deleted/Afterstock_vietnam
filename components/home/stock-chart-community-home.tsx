"use client";

import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUp, Clock, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  AssetSelector,
  createHomeAssetOptions,
  HOME_SELECTED_STOCK_KEY,
  HOME_STOCK_SELECT_EVENT,
} from "@/components/home/asset-selector";
import { UpbitStyleChartLayout } from "@/components/stocks/upbit-style-chart-layout";
import { useStockQuote } from "@/components/stocks/use-stock-quote";
import { Button } from "@/components/ui/button";
import {
  getMarketPredictionPercent,
  type MarketPredictionStorage,
} from "@/lib/domain/market-predictions";
import type {
  MarketDirection,
  MarketPredictionCounts,
} from "@/lib/mock/market-community";
import {
  getOrSeedMarketPredictionStorage,
  setMarketPredictionStorage,
} from "@/lib/storage";
import { getStockHref, stockAssets } from "@/lib/stocks/mockStocks";
import { getOrSeedStockOpinionsBySymbol } from "@/lib/stocks/stockStorage";
import { cn } from "@/lib/utils/cn";
import type { StockAsset, StockOpinion } from "@/types/stock";

const popularTradingViewSymbols = [
  "KRX:005930",
  "KRX:000660",
  "KRX:035420",
  "KRX:035720",
  "NASDAQ:TSLA",
  "NASDAQ:NVDA",
];

const marketSnapshotGroups = [
  {
    description: "Tập trung nhóm vốn hóa lớn Hàn Quốc",
    symbols: ["삼성전자", "SK하이닉스", "현대차", "LG에너지솔루션"],
    title: "Mã chính KOSPI",
  },
  {
    description: "Cổ phiếu tăng trưởng Hàn Quốc và chỉ số",
    symbols: ["KOSDAQ", "네이버", "카카오", "한화에어로스페이스"],
    title: "KOSDAQ · Mã Hàn Quốc đáng chú ý",
  },
  {
    description: "Tập trung nhóm công nghệ Mỹ",
    symbols: ["엔비디아", "애플", "테슬라", "NASDAQ"],
    title: "Mã chính NASDAQ",
  },
  {
    description: "Tài sản biến động 24 giờ",
    symbols: ["BTCUSDT", "ETHUSDT", "금", "S&P500"],
    title: "Crypto · Hàng hóa",
  },
] as const;

type ProfileRanking = {
  id: string;
  rank: number;
  name: string;
  profileImage?: string;
  totalPredictions: number;
  correctPredictions: number;
  accuracy: number;
  title: string;
  latestDirection: "상승" | "하락";
  latestOpinion: string;
  consecutiveCorrectCount: number;
};

const HOT_STREAK_THRESHOLD = 5;

const profileImages = {
  cafe:
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=160&h=160&q=80",
  cat:
    "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=160&h=160&q=80",
  dog:
    "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=160&h=160&q=80",
  food:
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=160&h=160&q=80",
  personBlue:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&h=160&q=80",
  personMood:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&h=160&q=80",
  sports:
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=160&h=160&q=80",
  travel:
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=160&h=160&q=80",
} as const;

const profileRankingsByAsset: Record<string, ProfileRanking[]> = {
  삼성전자: [
    { id: "samsung-1", rank: 1, name: "MeoChartVN", profileImage: profileImages.cat, totalPredictions: 56, correctPredictions: 51, accuracy: 91, title: "Nhà giao dịch cao thủ", latestDirection: "상승", latestOpinion: "Xu hướng đang bám khá chắc, mình giữ góc nhìn tăng ngắn hạn.", consecutiveCorrectCount: 7 },
    { id: "samsung-2", rank: 2, name: "DongTien777", profileImage: profileImages.personMood, totalPredictions: 41, correctPredictions: 32, accuracy: 78, title: "Người đọc xu hướng", latestDirection: "상승", latestOpinion: "Nhiều ý kiến đang nghiêng về một phía, mình xem đây như dữ liệu tham khảo.", consecutiveCorrectCount: 3 },
    { id: "samsung-3", rank: 3, name: "ShortHunter", profileImage: profileImages.cafe, totalPredictions: 33, correctPredictions: 25, accuracy: 76, title: "Người đọc xu hướng", latestDirection: "하락", latestOpinion: "Sau nhịp nóng ngắn hạn, khả năng có nhịp nghỉ nên mình tiếp cận thận trọng.", consecutiveCorrectCount: 5 },
    { id: "samsung-4", rank: 4, name: "KiemTraQuaNong", profileImage: profileImages.dog, totalPredictions: 28, correctPredictions: 18, accuracy: 64, title: "Người bắt biến động", latestDirection: "하락", latestOpinion: "Nến tăng vẫn có lực, nhưng vào lệnh khi chưa có điểm cắt lỗ thì khá khó chịu.", consecutiveCorrectCount: 2 },
  ],
  SK하이닉스: [
    { id: "sk-1", rank: 1, name: "MatDaiBangChip", profileImage: profileImages.travel, totalPredictions: 48, correctPredictions: 42, accuracy: 88, title: "Dự báo viên top", latestDirection: "상승", latestOpinion: "Kỳ vọng ngành bộ nhớ vẫn còn, mình nghiêng về nhịp mạnh ngắn hạn.", consecutiveCorrectCount: 5 },
    { id: "sk-2", rank: 2, name: "DRAMTracker", profileImage: profileImages.personBlue, totalPredictions: 39, correctPredictions: 29, accuracy: 74, title: "Người đọc xu hướng", latestDirection: "하락", latestOpinion: "Sau nhịp tăng nhanh, cần để ý khả năng chốt lời một phần.", consecutiveCorrectCount: 2 },
    { id: "sk-3", rank: 3, name: "HBMWatcher", profileImage: profileImages.food, totalPredictions: 31, correctPredictions: 25, accuracy: 81, title: "Dự báo viên top", latestDirection: "상승", latestOpinion: "Nếu khối ngoại còn đẩy dòng tiền, vùng đỉnh cũ có thể được thử lại.", consecutiveCorrectCount: 4 },
    { id: "sk-4", rank: 4, name: "NhipDieuBanDan", profileImage: profileImages.sports, totalPredictions: 44, correctPredictions: 27, accuracy: 61, title: "Người bắt biến động", latestDirection: "하락", latestOpinion: "Nếu cuối phiên có hàng bán ra, mình sẽ chờ nhịp nghỉ trước.", consecutiveCorrectCount: 1 },
  ],
  네이버: [
    { id: "naver-1", rank: 1, name: "PlatformReader", profileImage: profileImages.cat, totalPredictions: 44, correctPredictions: 36, accuracy: 82, title: "Dự báo viên top", latestDirection: "상승", latestOpinion: "Dòng tiền nhóm nền tảng có dấu hiệu quay lại, mình giữ góc nhìn tích cực.", consecutiveCorrectCount: 4 },
    { id: "naver-2", rank: 2, name: "SearchAntVN", profileImage: profileImages.personMood, totalPredictions: 31, correctPredictions: 21, accuracy: 68, title: "Người bắt biến động", latestDirection: "하락", latestOpinion: "Có hồi ngắn hạn rồi, nhưng vẫn cần xác nhận vùng kháng cự.", consecutiveCorrectCount: 1 },
    { id: "naver-3", rank: 3, name: "WebtoonFlow", profileImage: profileImages.cafe, totalPredictions: 29, correctPredictions: 23, accuracy: 79, title: "Người đọc xu hướng", latestDirection: "상승", latestOpinion: "Nếu kỳ vọng mảng nội dung quay lại, vùng trên của hộp giá có thể bị phá.", consecutiveCorrectCount: 5 },
    { id: "naver-4", rank: 4, name: "PortalWatcher", profileImage: profileImages.dog, totalPredictions: 26, correctPredictions: 16, accuracy: 62, title: "Người bắt biến động", latestDirection: "하락", latestOpinion: "Trước khi giá trị giao dịch tăng thêm, mình vẫn nhìn khá phòng thủ.", consecutiveCorrectCount: 2 },
  ],
  카카오: [
    { id: "kakao-1", rank: 1, name: "TalkChartist", profileImage: profileImages.travel, totalPredictions: 37, correctPredictions: 30, accuracy: 81, title: "Dự báo viên top", latestDirection: "상승", latestOpinion: "Sau nhịp giảm sâu, lực hồi đang có vẻ sống lại.", consecutiveCorrectCount: 4 },
    { id: "kakao-2", rank: 2, name: "GrowthDetective", profileImage: profileImages.personBlue, totalPredictions: 29, correctPredictions: 19, accuracy: 66, title: "Người bắt biến động", latestDirection: "하락", latestOpinion: "Mình vẫn xem khả năng đi ngang cao hơn là đảo chiều xu hướng rõ ràng.", consecutiveCorrectCount: 2 },
    { id: "kakao-3", rank: 3, name: "MobilityFlow", profileImage: profileImages.food, totalPredictions: 33, correctPredictions: 24, accuracy: 73, title: "Người đọc xu hướng", latestDirection: "상승", latestOpinion: "Nếu đáy được xác nhận và khối lượng tăng, nhịp hồi ngắn hạn vẫn có cửa.", consecutiveCorrectCount: 5 },
    { id: "kakao-4", rank: 4, name: "PlatformWaiter", profileImage: profileImages.sports, totalPredictions: 22, correctPredictions: 13, accuracy: 59, title: "Người quan sát thị trường", latestDirection: "하락", latestOpinion: "Tâm lý còn yếu nên mình chờ lực mua rõ hơn rồi mới tính.", consecutiveCorrectCount: 1 },
  ],
  현대차: [
    { id: "hyundai-1", rank: 1, name: "MobilityHunter", profileImage: profileImages.cat, totalPredictions: 52, correctPredictions: 43, accuracy: 83, title: "Dự báo viên top", latestDirection: "상승", latestOpinion: "Dòng tiền ở nhóm xe hoàn chỉnh đang giữ khá ổn định.", consecutiveCorrectCount: 6 },
    { id: "hyundai-2", rank: 2, name: "KhoiDongChart", profileImage: profileImages.personMood, totalPredictions: 34, correctPredictions: 23, accuracy: 67, title: "Người bắt biến động", latestDirection: "하락", latestOpinion: "Sau nhịp tăng ngắn hạn có chút mỏi, mình kiểm tra khả năng pullback.", consecutiveCorrectCount: 1 },
    { id: "hyundai-3", rank: 3, name: "EVRadar", profileImage: profileImages.cafe, totalPredictions: 47, correctPredictions: 35, accuracy: 74, title: "Người đọc xu hướng", latestDirection: "상승", latestOpinion: "Nếu tỷ giá và kỳ vọng lợi nhuận cùng hỗ trợ, dư địa tăng vẫn còn.", consecutiveCorrectCount: 3 },
    { id: "hyundai-4", rank: 4, name: "AutoWatcher", profileImage: profileImages.dog, totalPredictions: 25, correctPredictions: 15, accuracy: 60, title: "Người bắt biến động", latestDirection: "하락", latestOpinion: "Sau nến tăng mạnh, giá có thể cần thời gian hấp thụ lượng hàng ngắn hạn.", consecutiveCorrectCount: 2 },
  ],
  LG에너지솔루션: [
    { id: "lgensol-1", rank: 1, name: "PinWatcher", profileImage: profileImages.travel, totalPredictions: 46, correctPredictions: 38, accuracy: 83, title: "Dự báo viên top", latestDirection: "상승", latestOpinion: "Nhóm pin đang có vài dấu hiệu hồi phục, mình theo hướng tăng thận trọng.", consecutiveCorrectCount: 5 },
    { id: "lgensol-2", rank: 2, name: "ElectrolyteSniper", profileImage: profileImages.personBlue, totalPredictions: 27, correctPredictions: 17, accuracy: 63, title: "Người bắt biến động", latestDirection: "하락", latestOpinion: "Dòng tiền còn mỏng nên mình tránh mua đuổi ở vùng này.", consecutiveCorrectCount: 2 },
    { id: "lgensol-3", rank: 3, name: "CellTracker", profileImage: profileImages.food, totalPredictions: 36, correctPredictions: 27, accuracy: 75, title: "Người đọc xu hướng", latestDirection: "상승", latestOpinion: "Dòng tiền có vẻ vào cổ phiếu pin vốn hóa lớn trước nhóm vật liệu.", consecutiveCorrectCount: 4 },
    { id: "lgensol-4", rank: 4, name: "CathodeCheck", profileImage: profileImages.sports, totalPredictions: 30, correctPredictions: 18, accuracy: 60, title: "Người bắt biến động", latestDirection: "하락", latestOpinion: "Nếu toàn ngành yếu lại, mã này cũng có thể rung theo.", consecutiveCorrectCount: 1 },
  ],
  KOSDAQ: [
    { id: "kosdaq-1", rank: 1, name: "SmallcapScanner", profileImage: profileImages.cat, totalPredictions: 61, correctPredictions: 49, accuracy: 80, title: "Dự báo viên top", latestDirection: "상승", latestOpinion: "Dòng tiền xoay vòng ở cổ phiếu riêng lẻ đang mạnh hơn.", consecutiveCorrectCount: 4 },
    { id: "kosdaq-2", rank: 2, name: "VolatilityGuard", profileImage: profileImages.personMood, totalPredictions: 42, correctPredictions: 28, accuracy: 67, title: "Người bắt biến động", latestDirection: "하락", latestOpinion: "Một số chủ đề ngắn hạn đang nóng, cần quản trị rủi ro kỹ hơn.", consecutiveCorrectCount: 1 },
    { id: "kosdaq-3", rank: 3, name: "ThemeRotation", profileImage: profileImages.cafe, totalPredictions: 54, correctPredictions: 41, accuracy: 76, title: "Người đọc xu hướng", latestDirection: "상승", latestOpinion: "Mình theo dõi liệu dòng tiền có tiếp tục xoay sang nhóm giá trị giao dịch cao không.", consecutiveCorrectCount: 5 },
    { id: "kosdaq-4", rank: 4, name: "MicrocapWatcher", profileImage: profileImages.dog, totalPredictions: 35, correctPredictions: 21, accuracy: 60, title: "Người bắt biến động", latestDirection: "하락", latestOpinion: "Biến động từng mã lớn hơn chỉ số, chia nhỏ vị thế vẫn hợp lý hơn.", consecutiveCorrectCount: 2 },
  ],
  금: [
    { id: "gold-1", rank: 1, name: "GoldReader", profileImage: profileImages.travel, totalPredictions: 35, correctPredictions: 29, accuracy: 83, title: "Dự báo viên top", latestDirection: "상승", latestOpinion: "Nhu cầu trú ẩn vẫn duy trì nên mình nhìn vàng mạnh ngắn hạn.", consecutiveCorrectCount: 5 },
    { id: "gold-2", rank: 2, name: "CommodityWatcher", profileImage: profileImages.personBlue, totalPredictions: 24, correctPredictions: 15, accuracy: 62, title: "Người bắt biến động", latestDirection: "하락", latestOpinion: "Diễn biến USD có thể kéo theo nhịp điều chỉnh ngắn hạn.", consecutiveCorrectCount: 2 },
    { id: "gold-3", rank: 3, name: "DollarTracker", profileImage: profileImages.food, totalPredictions: 32, correctPredictions: 24, accuracy: 75, title: "Người đọc xu hướng", latestDirection: "상승", latestOpinion: "Nếu kỳ vọng lãi suất hạ nhiệt, vàng sẽ có thêm hỗ trợ.", consecutiveCorrectCount: 4 },
    { id: "gold-4", rank: 4, name: "GoldFuturesCheck", profileImage: profileImages.sports, totalPredictions: 21, correctPredictions: 12, accuracy: 57, title: "Người quan sát thị trường", latestDirection: "하락", latestOpinion: "Vùng tăng nhanh có thể xuất hiện chốt lời một phần.", consecutiveCorrectCount: 1 },
  ],
};

const supplementalProfileRankings: Omit<ProfileRanking, "id" | "rank">[] = [
  {
    name: "ReboundCheck",
    profileImage: profileImages.personBlue,
    totalPredictions: 54,
    correctPredictions: 34,
    accuracy: 63,
    title: "Người quan sát thị trường",
    latestDirection: "상승",
    latestOpinion: "Mình vẫn để mở khả năng hồi ngắn hạn.",
    consecutiveCorrectCount: 2,
  },
  {
    name: "CloseHunter",
    profileImage: profileImages.cafe,
    totalPredictions: 47,
    correctPredictions: 29,
    accuracy: 62,
    title: "Người quan sát thị trường",
    latestDirection: "상승",
    latestOpinion: "Xét theo giá đóng cửa, dòng chảy vẫn chưa quá xấu.",
    consecutiveCorrectCount: 3,
  },
  {
    name: "ScalpObserver",
    profileImage: profileImages.sports,
    totalPredictions: 42,
    correctPredictions: 25,
    accuracy: 60,
    title: "Người quan sát thị trường",
    latestDirection: "하락",
    latestOpinion: "Vùng ngắn hạn hơi nóng nên mình chờ thêm một nhịp.",
    consecutiveCorrectCount: 1,
  },
  {
    name: "PullbackWatch",
    profileImage: profileImages.travel,
    totalPredictions: 38,
    correctPredictions: 22,
    accuracy: 58,
    title: "Người quan sát thị trường",
    latestDirection: "상승",
    latestOpinion: "Mình theo dõi xem sau nhịp nghỉ có khối lượng quay lại không.",
    consecutiveCorrectCount: 2,
  },
  {
    name: "OrderBookMan",
    profileImage: profileImages.dog,
    totalPredictions: 31,
    correctPredictions: 17,
    accuracy: 55,
    title: "Người quan sát thị trường",
    latestDirection: "하락",
    latestOpinion: "Sổ lệnh còn mỏng nên ưu tiên nhìn biến động trước.",
    consecutiveCorrectCount: 1,
  },
  {
    name: "VolumeMemo",
    profileImage: profileImages.food,
    totalPredictions: 28,
    correctPredictions: 15,
    accuracy: 54,
    title: "Đang luyện tập",
    latestDirection: "상승",
    latestOpinion: "Mình ghi lại liệu khối lượng có hồi phục hay không.",
    consecutiveCorrectCount: 1,
  },
];

const DEFAULT_HOME_STOCK_SYMBOL = "삼성전자";
const MOBILE_SUMMARY_WIDTH = 768;
const REWARD_BANNER_IMAGE = "/images/rewards/reward-banner-vi.png";
const SHOW_BACKLOG_SECTIONS = false;

function getProfileAccuracy(profile: ProfileRanking) {
  if (profile.totalPredictions <= 0) {
    return profile.accuracy;
  }

  return Math.round((profile.correctPredictions / profile.totalPredictions) * 100);
}

function getProfileTitle(accuracy: number) {
  if (accuracy >= 90) return "Nhà giao dịch cao thủ";
  if (accuracy >= 80) return "Dự báo viên top";
  if (accuracy >= 70) return "Người đọc xu hướng";
  if (accuracy >= 60) return "Người bắt biến động";
  if (accuracy >= 50) return "Người quan sát thị trường";
  return "Đang luyện tập";
}

function isProfileHotStreak(profile: ProfileRanking) {
  return profile.consecutiveCorrectCount >= HOT_STREAK_THRESHOLD;
}

function getSortedProfileRankings(rankings: ProfileRanking[]) {
  return [...rankings].sort((first, second) => {
    const accuracyDiff = getProfileAccuracy(second) - getProfileAccuracy(first);

    if (accuracyDiff !== 0) {
      return accuracyDiff;
    }

    return second.totalPredictions - first.totalPredictions;
  });
}

function getProfileRankingsForStock(stock: StockAsset) {
  const baseRankings =
    profileRankingsByAsset[stock.symbol] ??
    profileRankingsByAsset[stock.displayName] ??
    profileRankingsByAsset[DEFAULT_HOME_STOCK_SYMBOL] ??
    [];
  const supplementalRankings = supplementalProfileRankings.map((profile, index) => ({
    ...profile,
    id: `${stock.symbol}-supplemental-${index + 1}`,
    latestOpinion: `${stock.displayName}: ${profile.latestOpinion}`,
    rank: baseRankings.length + index + 1,
  }));

  return [...baseRankings, ...supplementalRankings];
}

function getPredictionTargetId(stock: StockAsset) {
  if (stock.symbol === "BTCUSDT") {
    return "bitcoin";
  }

  if (stock.symbol === "ETHUSDT") {
    return "ethereum";
  }

  if (stock.symbol === "KOSPI") {
    return "kospi";
  }

  if (stock.symbol === "KOSDAQ") {
    return "kosdaq";
  }

  if (stock.symbol === "NASDAQ") {
    return "nasdaq";
  }

  if (stock.symbol === "S&P500") {
    return "sp500";
  }

  return `stock:${stock.tradingViewSymbol || stock.symbol}`;
}

function getInitialPredictionCounts(stock: StockAsset): MarketPredictionCounts {
  const total = Math.max(stock.opinionCount, 100);
  const up = Math.max(1, Math.round(total * (stock.bullishPercent / 100)));
  const down = Math.max(1, total - up);

  return { down, up };
}

type ProfileOpinionFeedItem = {
  id: string;
  nickname: string;
  body: string;
  createdAt: string;
  stance: "bearish" | "bullish" | "neutral";
};

type AutoCommunityProfile = {
  nickname: string;
  stance: ProfileOpinionFeedItem["stance"];
  tone: "blue" | "gray" | "green" | "orange" | "purple" | "red";
};

const autoCommunityProfiles: AutoCommunityProfile[] = [
  { nickname: "MinhDCA", stance: "bullish", tone: "red" },
  { nickname: "HuyQuanSat", stance: "neutral", tone: "gray" },
  { nickname: "LinhScalp", stance: "bullish", tone: "orange" },
  { nickname: "NamCatLoNhanh", stance: "bearish", tone: "blue" },
  { nickname: "YenDocChart", stance: "neutral", tone: "purple" },
  { nickname: "TanSauGio", stance: "bullish", tone: "green" },
  { nickname: "VolumeHunter", stance: "bullish", tone: "orange" },
  { nickname: "KienDangOmHang", stance: "bearish", tone: "blue" },
  { nickname: "ChoPullback", stance: "neutral", tone: "gray" },
  { nickname: "CheckDongCua", stance: "neutral", tone: "purple" },
  { nickname: "SoLenhMoi", stance: "bullish", tone: "red" },
  { nickname: "ChotLoiKhiNao", stance: "bearish", tone: "blue" },
  { nickname: "GiaSwing", stance: "bullish", tone: "green" },
  { nickname: "JunDocNen", stance: "neutral", tone: "orange" },
  { nickname: "MoCuaFan", stance: "bullish", tone: "red" },
  { nickname: "RiskFirst", stance: "bearish", tone: "gray" },
  { nickname: "HaGiaVon", stance: "neutral", tone: "purple" },
  { nickname: "BetDongCua", stance: "bullish", tone: "green" },
  { nickname: "SeoYenBinhTinh", stance: "neutral", tone: "gray" },
  { nickname: "ChoRebound", stance: "bullish", tone: "orange" },
  { nickname: "QuaNongCheck", stance: "bearish", tone: "blue" },
  { nickname: "ChartHonTin", stance: "neutral", tone: "purple" },
  { nickname: "TapTrungChieu", stance: "bullish", tone: "red" },
  { nickname: "GiuTienMat", stance: "bearish", tone: "gray" },
];

function getDisplayTime(value: string) {
  if (/^\d{2}:\d{2}$/.test(value)) {
    return value;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
  }).format(date);
}

function getVoteState(storage: MarketPredictionStorage | null, stock: StockAsset) {
  const predictionTargetId = getPredictionTargetId(stock);
  const counts: MarketPredictionCounts =
    storage?.counts[predictionTargetId] ?? getInitialPredictionCounts(stock);
  const total = counts.up + counts.down;

  return {
    downPercent: getMarketPredictionPercent(counts.down, total),
    myVote: storage?.votes[predictionTargetId],
    total,
    upPercent: getMarketPredictionPercent(counts.up, total),
    votes: counts,
  };
}

function getMarketCloseCountdown() {
  const now = new Date();
  const marketClose = new Date(now);

  marketClose.setHours(15, 30, 0, 0);

  if (now.getTime() > marketClose.getTime()) {
    return "Đã đóng";
  }

  const remainingSeconds = Math.max(
    0,
    Math.floor((marketClose.getTime() - now.getTime()) / 1000),
  );
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

function getTimeLabelByMinuteOffset(minutesAgo: number) {
  const date = new Date(Date.now() - minutesAgo * 60 * 1000);

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
  }).format(date);
}

function getStableIndex(seed: string, length: number) {
  const total = seed.split("").reduce((sum, character) => {
    return sum + character.charCodeAt(0);
  }, 0);

  return total % length;
}

function getProfileOpinionCount(stock: StockAsset) {
  return 24 + getStableIndex(`${stock.symbol}:${stock.opinionCount}`, 19);
}

function getStockTrendLabel(stock: StockAsset) {
  if (stock.changeRate > 0.6) {
    return "lực nến tăng đang nhỉnh hơn một chút";
  }

  if (stock.changeRate < -0.6) {
    return "áp lực bán vẫn xuất hiện trước";
  }

  return "xu hướng vẫn cần thêm xác nhận";
}

function getAutomatedMessagePool(
  stock: StockAsset,
  stance: ProfileOpinionFeedItem["stance"],
) {
  const displayName = stock.displayName;
  const trendLabel = getStockTrendLabel(stock);

  if (stance === "bullish") {
    return [
      displayName + " nếu chỉ nhúng nhẹ thì vẫn đáng nhìn lên thêm một nhịp.",
      "Khối lượng như này thì biểu đồ chưa hẳn đã chết đâu.",
      "Mình thấy " + displayName + " có thể chia nhỏ vị thế, nhưng không nên all-in một lần.",
      "Hướng chung thì ý kiến Long dễ hiểu hơn. Mình chờ phản ứng gần đỉnh cũ.",
      trendLabel + ". Nhưng cảm giác lực mua chưa rút đi hẳn.",
      "Nếu vượt được vùng thiếu lệnh, giá có thể thử đi lên thêm lần nữa.",
      "Nến hiện tại giống vùng cần xác nhận hơn là vùng hoảng sợ bán ra.",
    ];
  }

  if (stance === "bearish") {
    return [
      displayName + " đuổi theo ngay tại đây có thể dễ bị kẹt hàng.",
      "Cần xem khối lượng có theo kịp mức tăng hay không.",
      "Mình hiểu cả ý kiến Short lúc này. Mua đuổi hơi áp lực.",
      "Nếu xuất hiện bóng nến trên, hàng chốt lời ngắn hạn có thể ra khá nhiều.",
      trendLabel + ". Vào lệnh mà không có điểm cắt lỗ thì khá khó.",
      "Vùng này nên xem giá giữ được không trước, đoán trước dễ mệt.",
      "Ở mức giá này, quản trị rủi ro quan trọng hơn kỳ vọng.",
    ];
  }

  return [
    displayName + " nên đặt đường chuẩn trước khi chọn hướng.",
    "Lúc này xem nến 5 phút đóng thế nào sẽ hợp lý hơn nến 1 phút.",
    "Long/Short đều có lý, nhưng nên theo phía có khối lượng xác nhận.",
    "Mình vẫn quan sát. Chỉ xem có thủng hỗ trợ hay bật lại không.",
    trendLabel + ". Trước tín hiệu rõ, đi vị thế nhỏ sẽ ổn hơn.",
    "Biểu đồ này phản ứng sổ lệnh và giá trị giao dịch còn quan trọng hơn tin tức.",
    "Hướng ngắn hạn có thể chia phe, nhưng điểm mấu chốt là có mất giá chuẩn không.",
  ];
}

function getProfileOpinionFeedItems(stock: StockAsset, opinions: StockOpinion[]) {
  const seededMessages: ProfileOpinionFeedItem[] = opinions.slice(0, 4).map((opinion) => ({
    id: `seed-${opinion.id}`,
    nickname: opinion.nickname,
    body: opinion.body,
    createdAt: getDisplayTime(opinion.createdAt),
    stance:
      opinion.direction === "bullish"
        ? "bullish"
        : opinion.direction === "bearish"
          ? "bearish"
          : "neutral",
  }));

  const automatedSeedCount = 14;
  const automatedSeeds = Array.from({ length: automatedSeedCount }).map((_, index) => {
    const profile =
      autoCommunityProfiles[
        getStableIndex(`${stock.symbol}:seed-profile:${index}`, autoCommunityProfiles.length)
      ];
    const pool = getAutomatedMessagePool(stock, profile.stance);

    return {
      id: `auto-seed-${stock.symbol}-${index}`,
      nickname: profile.nickname,
      body: pool[getStableIndex(`${stock.symbol}:seed-body:${index}`, pool.length)],
      createdAt: getTimeLabelByMinuteOffset(index * 3 + 1),
      stance: profile.stance,
    };
  });

  return [...seededMessages, ...automatedSeeds].slice(0, 24);
}

function PixelAvatar({
  className,
  tone,
}: {
  className?: string;
  tone: "blue" | "gray" | "green" | "orange" | "purple" | "red";
}) {
  const toneClasses = {
    blue: "bg-blue-500 before:bg-slate-600 after:bg-blue-100",
    gray: "bg-slate-600 before:bg-slate-800 after:bg-amber-200",
    green: "bg-emerald-500 before:bg-slate-700 after:bg-amber-200",
    orange: "bg-amber-500 before:bg-slate-800 after:bg-orange-100",
    purple: "bg-violet-500 before:bg-violet-200 after:bg-rose-200",
    red: "bg-red-500 before:bg-slate-800 after:bg-orange-100",
  };

  return (
    <span
      className={cn(
        "relative inline-flex h-10 w-8 shrink-0 items-end justify-center overflow-hidden rounded-t-sm",
        "before:absolute before:bottom-0 before:h-3 before:w-full before:content-['']",
        "after:absolute after:top-2 after:h-5 after:w-6 after:rounded-[2px] after:content-['']",
        toneClasses[tone],
        className,
      )}
      aria-hidden="true"
    >
      <span className="absolute left-2 top-4 z-10 h-1.5 w-1.5 bg-slate-950" />
      <span className="absolute right-2 top-4 z-10 h-1.5 w-1.5 bg-slate-950" />
    </span>
  );
}

function ChartCommunityPanel({
  opinions,
  stock,
}: {
  opinions: StockOpinion[];
  stock: StockAsset;
}) {
  const [storage, setStorage] = useState<MarketPredictionStorage | null>(null);
  const [aiOpinionStatus, setAiOpinionStatus] = useState<
    "idle" | "loading" | "ready"
  >("idle");
  const [mobileOpinionsExpanded, setMobileOpinionsExpanded] = useState(false);
  const opinionItems = useMemo(
    () => getProfileOpinionFeedItems(stock, opinions),
    [opinions, stock],
  );
  const predictionTargetId = getPredictionTargetId(stock);
  const voteState = getVoteState(storage, stock);
  const longIsMajority = voteState.upPercent >= voteState.downPercent;
  const avatarTones = ["red", "blue", "purple", "orange", "gray", "green"] as const;
  const profileOpinionCount = getProfileOpinionCount(stock);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setStorage(getOrSeedMarketPredictionStorage() as MarketPredictionStorage);
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [predictionTargetId]);

  function handleVote(direction: MarketDirection) {
    const current = (storage ??
      getOrSeedMarketPredictionStorage()) as MarketPredictionStorage;

    if (current.votes[predictionTargetId]) {
      return;
    }

    const currentCounts: MarketPredictionCounts =
      current.counts[predictionTargetId] ?? getInitialPredictionCounts(stock);
    const nextStorage: MarketPredictionStorage = {
      counts: {
        ...current.counts,
        [predictionTargetId]: {
          ...currentCounts,
          [direction]: currentCounts[direction] + 1,
        },
      },
      votes: {
        ...current.votes,
        [predictionTargetId]: direction,
      },
    };

    setMarketPredictionStorage(nextStorage);
    setStorage(nextStorage);
  }

  async function handleAskAi() {
    setAiOpinionStatus("loading");

    window.setTimeout(() => {
      setAiOpinionStatus("ready");
    }, 700);
  }

  return (
    <aside className="premium-card overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid grid-cols-2 border-b border-slate-200">
        <div className="flex items-center gap-3 border-r border-slate-200 p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
            <ArrowDown className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold text-slate-500">Short · Giảm</p>
            <p className="mt-1 text-2xl font-black text-blue-500">
              {voteState.downPercent}%
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-500">
            <ArrowUp className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold text-slate-500">Long · Tăng</p>
            <p className="mt-1 text-2xl font-black text-red-500">
              {voteState.upPercent}%
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-500">Xu hướng cộng đồng hiện tại</p>
          <p
            className={cn(
              "mt-3 text-4xl font-black tracking-normal",
              longIsMajority ? "text-red-500" : "text-blue-500",
            )}
          >
            {longIsMajority ? "Long" : "Short"}{" "}
            {longIsMajority ? voteState.upPercent : voteState.downPercent}%
          </p>
          <p className="mt-2 text-sm font-medium text-slate-700">
            Tổng {voteState.total.toLocaleString("vi-VN")} phiếu · đã thu thập ý kiến về biểu đồ
          </p>
        </div>

        <div className="mt-7">
          <div className="flex h-2 overflow-hidden rounded-full bg-blue-100">
            <div
              className="bg-red-500 transition-all duration-500"
              style={{ width: `${voteState.upPercent}%` }}
            />
            <div
              className="bg-blue-500 transition-all duration-500"
              style={{ width: `${voteState.downPercent}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs font-black">
            <span className="text-red-500">Long {voteState.upPercent}%</span>
            <span className="text-blue-500">Short {voteState.downPercent}%</span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button
            className="h-10 rounded-lg border-red-100 bg-red-50 text-sm font-bold text-red-500 hover:bg-red-100 disabled:bg-red-50 disabled:text-red-300"
            disabled={Boolean(voteState.myVote)}
            onClick={() => handleVote("up")}
            type="button"
          >
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
            Tăng
          </Button>
          <Button
            className="h-10 rounded-lg border-blue-100 bg-blue-50 text-sm font-bold text-blue-500 hover:bg-blue-100 disabled:bg-blue-50 disabled:text-blue-300"
            disabled={Boolean(voteState.myVote)}
            onClick={() => handleVote("down")}
            type="button"
          >
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
            Giảm
          </Button>
        </div>

        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <Button
            className="h-10 w-full justify-center gap-2 rounded-lg bg-slate-950 text-sm font-bold text-white hover:bg-slate-800"
            disabled={aiOpinionStatus === "loading"}
            onClick={handleAskAi}
            type="button"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {aiOpinionStatus === "loading" ? "Đang chuẩn bị ý kiến AI" : "Yêu cầu ý kiến AI"}
          </Button>
        </div>

        <div className="mt-7 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <p className="text-center text-xs font-semibold text-slate-500">
              Ý kiến giao dịch theo hồ sơ
            </p>
            <p className="mt-1 flex items-center justify-center gap-2 text-center text-sm font-black text-slate-950">
              Đã thu thập ý kiến từ {profileOpinionCount} hồ sơ
            </p>
          </div>

          <div className="relative border-b border-slate-100 px-4 pb-4 pt-8">
            <div className="absolute left-4 top-4 flex w-[calc(100%-2rem)] justify-around">
              {["Nghiêng Tăng", "Cẩn thận quá nóng", "Quan sát"].map((label) => (
                <span
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600 shadow-sm"
                  key={label}
                >
                  {label}
                </span>
              ))}
            </div>
            <div className="flex min-h-14 items-end justify-between gap-1 overflow-hidden">
              {Array.from({ length: Math.min(Math.max(profileOpinionCount, 6), 8) }).map(
                (_, index) => (
                  <PixelAvatar
                    key={`speaker-${index}`}
                    tone={avatarTones[index % avatarTones.length]}
                  />
                ),
              )}
            </div>
          </div>

          <div
            className={cn(
              "profileOpinionList max-h-44 space-y-2 overflow-y-auto bg-slate-50/70 p-3",
              mobileOpinionsExpanded && "isExpanded",
            )}
          >
            {opinionItems.slice(0, 7).map((item, index) => (
              <div
                className={cn(
                  "rounded-lg border bg-white px-3 py-2 transition",
                  item.stance === "bullish" && "border-red-100",
                  item.stance === "bearish" && "border-blue-100",
                  item.stance === "neutral" && "border-slate-100",
                  index >= 2 && "mobileOpinionExtra",
                )}
                key={item.id}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-xs font-black text-slate-800">
                      {item.nickname}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-black",
                        item.stance === "bullish" && "bg-red-50 text-red-500",
                        item.stance === "bearish" && "bg-blue-50 text-blue-500",
                        item.stance === "neutral" && "bg-slate-100 text-slate-500",
                      )}
                    >
                      {item.stance === "bullish"
                        ? "Tăng"
                        : item.stance === "bearish"
                          ? "Giảm"
                          : "Quan sát"}
                    </span>
                  </div>
                  <span className="shrink-0 text-[11px] font-medium text-slate-400">
                    {item.createdAt}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">
                  {item.body}
                </p>
              </div>
            ))}
            {opinionItems.length > 2 ? (
              <Button
                className="mobileOpinionToggle mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50"
                onClick={() => setMobileOpinionsExpanded((current) => !current)}
                type="button"
                variant="ghost"
              >
                {mobileOpinionsExpanded ? "Thu gọn" : "Xem thêm"}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </aside>
  );
}

function MobileSelectedStockSummary({ stock }: { stock: StockAsset }) {
  const quote = useStockQuote(stock);
  const isPositive = quote.changeRate >= 0;

  return (
    <div className="mobileAssetSummary rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:hidden">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-lg font-black text-slate-950">
            {stock.displayName}
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-400">
            {quote.displayPair} · {stock.market}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xl font-black tabular-nums text-slate-950">
            {quote.currentPrice}
          </p>
          <p
            className={cn(
              "mt-1 text-sm font-black tabular-nums",
              isPositive ? "text-red-500" : "text-blue-500",
            )}
          >
            {isPositive ? "+" : ""}
            {quote.changeRate.toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  );
}

function MobileMiniChart({
  changeRate,
  currentPrice,
  stock,
}: {
  changeRate: number;
  currentPrice: string;
  stock: StockAsset;
}) {
  const points = stock.chartPoints.length > 1 ? stock.chartPoints : [48, 50, 49, 52];
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = Math.max(max - min, 1);
  const width = 320;
  const height = 176;
  const padding = 16;
  const linePoints = points.map((point, index) => {
    const x = padding + (index / Math.max(points.length - 1, 1)) * (width - padding * 2);
    const y = padding + ((max - point) / range) * (height - padding * 2);

    return { x, y };
  });
  const linePath = linePoints
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ");
  const firstPoint = linePoints[0];
  const lastPoint = linePoints[linePoints.length - 1];
  const areaPath = `${linePath} L ${lastPoint.x.toFixed(2)} ${height - padding} L ${firstPoint.x.toFixed(2)} ${height - padding} Z`;
  const isPositive = changeRate >= 0;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-slate-400">Biểu đồ nhanh</p>
          <h2 className="mt-1 text-base font-black text-slate-950">{stock.displayName}</h2>
        </div>
        <div className="text-right">
          <p className="text-sm font-black tabular-nums text-slate-950">{currentPrice}</p>
          <p
            className={cn(
              "mt-1 text-xs font-black tabular-nums",
              isPositive ? "text-red-500" : "text-blue-500",
            )}
          >
            {isPositive ? "+" : ""}
            {changeRate.toFixed(2)}%
          </p>
        </div>
      </div>
      <svg
        aria-label={`Biểu đồ tóm tắt ${stock.displayName} trên di động`}
        className="h-[176px] w-full overflow-visible"
        role="img"
        viewBox={`0 0 ${width} ${height}`}
      >
        <defs>
          <linearGradient id="mobile-chart-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={isPositive ? "#ef4444" : "#2563eb"} stopOpacity="0.24" />
            <stop offset="100%" stopColor={isPositive ? "#ef4444" : "#2563eb"} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((tick) => {
          const y = padding + tick * ((height - padding * 2) / 3);

          return (
            <line
              key={tick}
              stroke="#e2e8f0"
              strokeDasharray="4 6"
              strokeWidth="1"
              x1={padding}
              x2={width - padding}
              y1={y}
              y2={y}
            />
          );
        })}
        <path d={areaPath} fill="url(#mobile-chart-fill)" />
        <path
          d={linePath}
          fill="none"
          stroke={isPositive ? "#ef4444" : "#2563eb"}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        />
      </svg>
    </section>
  );
}

function MobileSummaryPage({
  assetOptions,
  onStockSelect,
  opinions,
  selectedStock,
}: {
  assetOptions: ReturnType<typeof createHomeAssetOptions>;
  onStockSelect: (stock: StockAsset) => void;
  opinions: StockOpinion[];
  selectedStock: StockAsset;
}) {
  const quote = useStockQuote(selectedStock);
  const [storage, setStorage] = useState<MarketPredictionStorage | null>(null);
  const [aiOpinionStatus, setAiOpinionStatus] = useState<"idle" | "loading" | "ready">(
    "idle",
  );
  const predictionTargetId = getPredictionTargetId(selectedStock);
  const voteState = getVoteState(storage, selectedStock);
  const longIsMajority = voteState.upPercent >= voteState.downPercent;
  const opinionItems = useMemo(
    () => getProfileOpinionFeedItems(selectedStock, opinions).slice(0, 3),
    [opinions, selectedStock],
  );
  const profileOpinionCount = getProfileOpinionCount(selectedStock);
  const rankings = getSortedProfileRankings(getProfileRankingsForStock(selectedStock)).slice(
    0,
    4,
  );
  const topProfile = rankings[0];
  const otherProfiles = rankings.slice(1);
  const isPositive = quote.changeRate >= 0;

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setStorage(getOrSeedMarketPredictionStorage() as MarketPredictionStorage);
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [predictionTargetId]);

  function handleVote(direction: MarketDirection) {
    const current = (storage ??
      getOrSeedMarketPredictionStorage()) as MarketPredictionStorage;

    if (current.votes[predictionTargetId]) {
      return;
    }

    const currentCounts: MarketPredictionCounts =
      current.counts[predictionTargetId] ?? getInitialPredictionCounts(selectedStock);
    const nextStorage: MarketPredictionStorage = {
      counts: {
        ...current.counts,
        [predictionTargetId]: {
          ...currentCounts,
          [direction]: currentCounts[direction] + 1,
        },
      },
      votes: {
        ...current.votes,
        [predictionTargetId]: direction,
      },
    };

    setMarketPredictionStorage(nextStorage);
    setStorage(nextStorage);
  }

  async function handleAskAi() {
    setAiOpinionStatus("loading");

    window.setTimeout(() => {
      setAiOpinionStatus("ready");
    }, 700);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-6 pt-4">
      <div className="mx-auto flex max-w-md flex-col gap-3">
        <header className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-black tracking-normal text-slate-950">AfterStock</h1>
              <p className="mt-1 text-xs font-bold text-slate-500">Tóm tắt di động</p>
            </div>
            <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-black text-white">
              {selectedStock.market}
            </span>
          </div>
          <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1">
            {assetOptions.map((option) => {
              const isSelected = option.stock.symbol === selectedStock.symbol;

              return (
                <button
                  className={cn(
                    "shrink-0 rounded-full border px-3 py-2 text-xs font-black transition",
                    isSelected
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-white text-slate-600",
                  )}
                  key={option.stock.symbol}
                  onClick={() => onStockSelect(option.stock)}
                  type="button"
                >
                  {option.displayName}
                </button>
              );
            })}
          </div>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-2xl font-black text-slate-950">
                {selectedStock.displayName}
              </p>
              <p className="mt-1 text-xs font-bold text-slate-400">
                {quote.displayPair} · {selectedStock.market}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xl font-black tabular-nums text-slate-950">
                {quote.currentPrice}
              </p>
              <p
                className={cn(
                  "mt-1 text-sm font-black tabular-nums",
                  isPositive ? "text-red-500" : "text-blue-500",
                )}
              >
                {isPositive ? "+" : ""}
                {quote.changeRate.toFixed(2)}%
              </p>
            </div>
          </div>
        </section>

        <MobileMiniChart
          changeRate={quote.changeRate}
          currentPrice={quote.currentPrice}
          stock={selectedStock}
        />

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-slate-200">
            <div className="border-r border-slate-200 bg-blue-50/60 p-3">
              <p className="text-xs font-bold text-slate-500">Short · Giảm</p>
              <p className="mt-1 text-2xl font-black text-blue-500">
                {voteState.downPercent}%
              </p>
            </div>
            <div className="bg-red-50/60 p-3">
              <p className="text-xs font-bold text-slate-500">Long · Tăng</p>
              <p className="mt-1 text-2xl font-black text-red-500">
                {voteState.upPercent}%
              </p>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs font-bold text-slate-500">Xu hướng cộng đồng hiện tại</p>
            <p
              className={cn(
                "mt-1 text-3xl font-black tracking-normal",
                longIsMajority ? "text-red-500" : "text-blue-500",
              )}
            >
              {longIsMajority ? "Long" : "Short"}{" "}
              {longIsMajority ? voteState.upPercent : voteState.downPercent}%
            </p>
            <p className="mt-1 text-xs font-bold text-slate-500">
              Tổng {voteState.total.toLocaleString("vi-VN")} phiếu · đã thu thập ý kiến về biểu đồ
            </p>
          </div>

          <div className="mt-4">
            <div className="flex h-2 overflow-hidden rounded-full bg-blue-100">
              <div className="bg-red-500" style={{ width: `${voteState.upPercent}%` }} />
              <div className="bg-blue-500" style={{ width: `${voteState.downPercent}%` }} />
            </div>
            <div className="mt-2 flex justify-between text-xs font-black">
              <span className="text-red-500">Long {voteState.upPercent}%</span>
              <span className="text-blue-500">Short {voteState.downPercent}%</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button
              className="h-11 rounded-xl border-red-100 bg-red-50 text-sm font-black text-red-500 hover:bg-red-100 disabled:bg-red-50 disabled:text-red-300"
              disabled={Boolean(voteState.myVote)}
              onClick={() => handleVote("up")}
              type="button"
            >
              <ArrowUp className="h-4 w-4" aria-hidden="true" />
              Tăng
            </Button>
            <Button
              className="h-11 rounded-xl border-blue-100 bg-blue-50 text-sm font-black text-blue-500 hover:bg-blue-100 disabled:bg-blue-50 disabled:text-blue-300"
              disabled={Boolean(voteState.myVote)}
              onClick={() => handleVote("down")}
              type="button"
            >
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
              Giảm
            </Button>
          </div>

          <Button
            className="mt-3 h-11 w-full justify-center gap-2 rounded-xl bg-slate-950 text-sm font-black text-white hover:bg-slate-800"
            disabled={aiOpinionStatus === "loading"}
            onClick={handleAskAi}
            type="button"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {aiOpinionStatus === "loading" ? "Đang chuẩn bị ý kiến AI" : "Yêu cầu ý kiến AI"}
          </Button>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-slate-950">Tóm tắt ý kiến hồ sơ</h2>
              <p className="mt-1 text-xs font-bold text-slate-500">
                Đã thu thập ý kiến từ {profileOpinionCount} hồ sơ
              </p>
            </div>
            <span className="text-xs font-black text-slate-400">Tối đa 3</span>
          </div>
          <div className="mt-3 space-y-2">
            {opinionItems.length > 0 ? (
              opinionItems.map((item) => (
                <article
                  className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5"
                  key={item.id}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="truncate text-xs font-black text-slate-800">
                        {item.nickname}
                      </span>
                      <span
                        className={cn(
                          "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-black",
                          item.stance === "bullish" && "bg-red-50 text-red-500",
                          item.stance === "bearish" && "bg-blue-50 text-blue-500",
                          item.stance === "neutral" && "bg-slate-100 text-slate-500",
                        )}
                      >
                        {item.stance === "bullish"
                          ? "Tăng"
                          : item.stance === "bearish"
                            ? "Giảm"
                            : "Quan sát"}
                      </span>
                    </div>
                    <span className="shrink-0 text-[11px] font-bold text-slate-400">
                      {item.createdAt}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">
                    {item.body}
                  </p>
                </article>
              ))
            ) : (
              <p className="rounded-xl bg-slate-50 px-3 py-4 text-center text-xs font-bold text-slate-500">
                Chưa có ý kiến để hiển thị.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div>
            <h2 className="text-base font-black text-slate-950">Tóm tắt độ chính xác hồ sơ</h2>
            <p className="mt-1 text-xs font-bold text-slate-500">
              Chỉ xem nhanh các hồ sơ dẫn đầu theo {selectedStock.displayName}.
            </p>
          </div>
          {topProfile ? (
            <article className="rankingCard topWinner mt-3 rounded-2xl border border-amber-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <ProfileRankingAvatar isTopRank profile={topProfile} />
                <div className="min-w-0 flex-1">
                  <p className="rankLabel winnerLabel w-fit">🏆 Vua dự đoán hôm nay</p>
                  <h3 className="mt-1 truncate text-base font-black text-slate-950">
                    {topProfile.name}
                  </h3>
                  <p className="mt-1 text-xs font-bold text-amber-600">
                    Độ chính xác {getProfileAccuracy(topProfile)}% · đúng liên tiếp{" "}
                    {topProfile.consecutiveCorrectCount} lần
                  </p>
                </div>
              </div>
              <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-600">
                {topProfile.latestOpinion}
              </p>
            </article>
          ) : null}
          <div className="mt-3 space-y-2">
            {otherProfiles.map((profile, index) => {
              const accuracy = getProfileAccuracy(profile);
              const isBullish = profile.latestDirection === "상승";

              return (
                <article
                  className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5"
                  key={profile.id}
                >
                  <span className="text-xs font-black text-blue-500">
                    Hạng {index + 2}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-900">
                      {profile.name}
                    </p>
                    <p className="mt-0.5 text-[11px] font-bold text-slate-500">
                      {profile.totalPredictions} dự đoán / {profile.correctPredictions} đúng
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded px-2 py-1 text-xs font-black",
                      isBullish ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500",
                    )}
                  >
                    {accuracy}%
                  </span>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

function getStoredHomeStock(options: ReturnType<typeof createHomeAssetOptions>) {
  if (typeof window === "undefined") {
    return null;
  }

  const storedSymbol = window.localStorage.getItem(HOME_SELECTED_STOCK_KEY);

  if (!storedSymbol) {
    return null;
  }

  return (
    options.find(
      (option) =>
        option.stock.symbol === storedSymbol ||
        option.stock.tradingViewSymbol === storedSymbol,
    )?.stock ?? null
  );
}

function resolveHomeStock(
  options: ReturnType<typeof createHomeAssetOptions>,
  symbol: string | null | undefined,
) {
  if (!symbol) {
    return null;
  }

  const decodedSymbol = decodeURIComponent(symbol).toLowerCase();

  return (
    options.find((option) => {
      const stock = option.stock;

      return (
        stock.symbol.toLowerCase() === decodedSymbol ||
        stock.displayName.toLowerCase() === decodedSymbol ||
        stock.tradingViewSymbol.toLowerCase() === decodedSymbol ||
        option.displayName.toLowerCase() === decodedSymbol ||
        option.displaySymbol.toLowerCase() === decodedSymbol
      );
    })?.stock ?? null
  );
}

function setStoredHomeStock(stock: StockAsset) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(HOME_SELECTED_STOCK_KEY, stock.symbol);
  window.dispatchEvent(
    new CustomEvent(HOME_STOCK_SELECT_EVENT, {
      detail: { symbol: stock.symbol },
    }),
  );
}

function PopularStockLink({ stock }: { stock: StockAsset }) {
  const quote = useStockQuote(stock);
  const isPositive = quote.changeRate >= 0;

  return (
    <Link
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg"
      href={getStockHref(stock.symbol)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-950">{stock.displayName}</p>
          <p className="mt-1 text-xs text-slate-500">{stock.market}</p>
        </div>
        <span
          className={cn(
            "rounded-md px-2 py-1 text-xs font-semibold",
            isPositive ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600",
          )}
        >
          {isPositive ? "+" : ""}
          {quote.changeRate.toFixed(2)}%
        </span>
      </div>
      <p className="mt-3 text-sm font-bold text-slate-800">{quote.currentPrice}</p>
      <p className="mt-1 text-[11px] font-medium text-slate-400">
        {quote.isLive ? quote.sourceLabel : "Dữ liệu MVP"}
      </p>
      <div className="mt-3">
        <div className="mb-1 flex justify-between text-[11px] font-semibold text-slate-400">
          <span>Tăng {stock.bullishPercent}%</span>
          <span>Giảm {stock.bearishPercent}%</span>
        </div>
        <div className="flex h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div className="bg-red-400" style={{ width: `${stock.bullishPercent}%` }} />
          <div className="bg-blue-400" style={{ width: `${stock.bearishPercent}%` }} />
        </div>
      </div>
    </Link>
  );
}

function getStocksBySymbols(symbols: readonly string[]) {
  return symbols
    .map((symbol) =>
      stockAssets.find((stock) => stock.symbol === symbol || stock.displayName === symbol),
    )
    .filter((stock): stock is StockAsset => Boolean(stock));
}

function MarketSnapshotItem({
  isSelected,
  onSelect,
  stock,
}: {
  isSelected: boolean;
  onSelect: (stock: StockAsset) => void;
  stock: StockAsset;
}) {
  const quote = useStockQuote(stock);
  const isPositive = quote.changeRate >= 0;

  return (
    <button
      className={cn(
        "grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-3 py-2.5 text-left transition",
        isSelected
          ? "bg-slate-950 text-white shadow-sm"
          : "bg-white hover:bg-slate-50",
      )}
      onClick={() => onSelect(stock)}
      type="button"
    >
      <span className="min-w-0">
        <span
          className={cn(
            "block truncate text-sm font-black",
            isSelected ? "text-white" : "text-slate-950",
          )}
        >
          {stock.displayName}
        </span>
        <span
          className={cn(
            "mt-0.5 block truncate text-[11px] font-semibold",
            isSelected ? "text-slate-300" : "text-slate-400",
          )}
        >
          {stock.market} · {quote.isLive ? quote.sourceLabel : "Giá MVP"}
        </span>
      </span>
      <span className="text-right">
        <span
          className={cn(
            "block text-sm font-black tabular-nums",
            isSelected ? "text-white" : "text-slate-950",
          )}
        >
          {quote.currentPrice}
        </span>
        <span
          className={cn(
            "mt-0.5 inline-flex rounded px-1.5 py-0.5 text-[11px] font-black tabular-nums",
            isPositive
              ? isSelected
                ? "bg-red-500/15 text-red-200"
                : "bg-red-50 text-red-500"
              : isSelected
                ? "bg-blue-500/15 text-blue-200"
                : "bg-blue-50 text-blue-500",
          )}
        >
          {isPositive ? "+" : ""}
          {quote.changeRate.toFixed(2)}%
        </span>
      </span>
    </button>
  );
}

function MarketSnapshotSection({
  onSelect,
  selectedStock,
}: {
  onSelect: (stock: StockAsset) => void;
  selectedStock: StockAsset;
}) {
  const [mobileMarketOpen, setMobileMarketOpen] = useState(false);

  return (
    <section className="marketSnapshotSection space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-black tracking-normal text-slate-950">
            Các mã chính theo thị trường
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Lướt nhanh các mã được xem nhiều sau giờ đóng cửa rồi chuyển ngay sang phòng biểu đồ.
          </p>
        </div>
        <p className="text-xs font-bold text-slate-400">
          Giá hiện tại · Xu hướng cộng đồng · Chuyển nhanh
        </p>
      </div>

      <Button
        className="mobileMarketToggle h-10 w-full justify-center rounded-xl border border-slate-200 bg-white text-sm font-black text-slate-700 hover:bg-slate-50"
        onClick={() => setMobileMarketOpen((current) => !current)}
        type="button"
        variant="ghost"
      >
        {mobileMarketOpen
          ? "Thu gọn các mã chính"
          : "Xem các mã chính theo thị trường"}
      </Button>

      <div
        className={cn(
          "marketSnapshotGrid grid gap-3 md:grid-cols-2 xl:grid-cols-4",
          mobileMarketOpen && "isExpanded",
        )}
      >
        {marketSnapshotGroups.map((group) => {
          const stocks = getStocksBySymbols(group.symbols);

          return (
            <div
              className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
              key={group.title}
            >
              <div className="mb-2 px-1">
                <h3 className="text-sm font-black text-slate-950">{group.title}</h3>
                <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                  {group.description}
                </p>
              </div>
              <div className="space-y-1.5">
                {stocks.map((stock) => (
                  <MarketSnapshotItem
                    isSelected={stock.symbol === selectedStock.symbol}
                    key={stock.symbol}
                    onSelect={onSelect}
                    stock={stock}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ProfileRankingAvatar({
  isTopRank,
  profile,
}: {
  isTopRank: boolean;
  profile: ProfileRanking;
}) {
  const initial = profile.name.slice(0, 1);
  const isHotStreak = isProfileHotStreak(profile);

  return (
    <div
      className={cn(
        "profileAvatarWrap relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 shadow-sm",
        isHotStreak && "hotStreak ring-2 ring-amber-200",
        isTopRank && "topRankFireAura",
      )}
    >
      {profile.profileImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={`${profile.name} hồ sơ`}
          className="relative z-10 h-full w-full rounded-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
          src={profile.profileImage}
        />
      ) : null}
      <span className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-900 text-sm font-black text-white">
        {initial}
      </span>
    </div>
  );
}

function ProfileRankingMiniAvatar({ profile }: { profile: ProfileRanking }) {
  const initial = profile.name.slice(0, 1);

  return (
    <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-900 text-xs font-black text-white">
      {profile.profileImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={`${profile.name} hồ sơ`}
          className="relative z-10 h-full w-full rounded-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
          src={profile.profileImage}
        />
      ) : null}
      <span className="absolute inset-0 flex items-center justify-center">{initial}</span>
    </div>
  );
}

function ProfileRankingCard({
  displayRank,
  isTopWinner,
  profile,
}: {
  displayRank: number;
  isTopWinner: boolean;
  profile: ProfileRanking;
}) {
  const accuracy = getProfileAccuracy(profile);
  const title = getProfileTitle(accuracy);
  const isBullish = profile.latestDirection === "상승";
  const rankLabel = isTopWinner ? "🏆 Vua dự đoán hôm nay" : `Hạng ${displayRank}`;

  return (
    <article
      className={cn(
        "profileRankingCard rankingCard overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm",
        isTopWinner && "topWinner",
      )}
    >
      <div className="border-b border-slate-100 p-4">
        <div className="flex min-w-0 items-center gap-3">
          <ProfileRankingAvatar isTopRank={isTopWinner} profile={profile} />
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "rankLabel w-fit",
                isTopWinner ? "winnerLabel" : "normalRank",
              )}
            >
              {rankLabel}
            </p>
            <h3 className="mt-1 truncate text-base font-black text-slate-950">
              {profile.name}
            </h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span
                className={cn(
                  "inline-flex max-w-full rounded-full px-2.5 py-1 text-xs font-black",
                  accuracy >= 80
                    ? "bg-amber-50 text-amber-600"
                    : "bg-slate-100 text-slate-600",
                )}
              >
                {title}
              </span>
              {isProfileHotStreak(profile) ? (
                <span className="inline-flex max-w-full rounded-full bg-red-50 px-2.5 py-1 text-xs font-black text-red-500">
                  Đúng liên tiếp {profile.consecutiveCorrectCount} lần
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-slate-400">Độ chính xác</p>
            <p className="mt-1 text-3xl font-black tabular-nums text-slate-950">
              {accuracy}%
            </p>
          </div>
          <p className="text-right text-xs font-bold leading-5 text-slate-500">
            {profile.totalPredictions} dự đoán
            <br />
            {profile.correctPredictions} đúng
          </p>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className={cn(
              "h-full rounded-full",
              accuracy >= 80 ? "bg-amber-400" : "bg-slate-400",
            )}
            style={{ width: `${accuracy}%` }}
          />
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-400">Xu hướng gần nhất</span>
          <span
            className={cn(
              "rounded px-2 py-1 text-xs font-black",
              isBullish ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500",
            )}
          >
            {isBullish ? "Tăng" : "Giảm"}
          </span>
        </div>
        <p className="mt-3 line-clamp-2 text-sm font-medium leading-6 text-slate-600">
          {profile.latestOpinion}
        </p>
      </div>
    </article>
  );
}

function ProfileRankingSideList({
  profiles,
  startRank,
}: {
  profiles: ProfileRanking[];
  startRank: number;
}) {
  return (
    <aside className="rankingSideList rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-black text-slate-950">Xếp hạng từ hạng 4</h3>
        <span className="text-xs font-bold text-slate-400">Theo độ chính xác</span>
      </div>
      <div className="max-h-[336px] space-y-1 overflow-y-auto pr-1">
        {profiles.map((profile, index) => {
          const accuracy = getProfileAccuracy(profile);
          const title = getProfileTitle(accuracy);
          const isBullish = profile.latestDirection === "상승";
          const displayRank = startRank + index;

          return (
            <article
              className="grid grid-cols-[48px_32px_minmax(0,1fr)_auto] items-center gap-2 border-b border-slate-100 py-2.5 last:border-b-0"
              key={profile.id}
            >
              <span className="text-xs font-black text-blue-500">Hạng {displayRank}</span>
              <ProfileRankingMiniAvatar profile={profile} />
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-slate-900">{profile.name}</p>
                <p className="mt-0.5 truncate text-[11px] font-bold text-slate-500">
                  {title}
                </p>
              </div>
              <div className="flex min-w-[58px] flex-col items-end gap-1">
                <span className="text-base font-black tabular-nums text-slate-950">
                  {accuracy}%
                </span>
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[10px] font-black",
                    isBullish ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500",
                  )}
                >
                  {isBullish ? "Tăng" : "Giảm"}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </aside>
  );
}

function ProfileRankingSection({ selectedStock }: { selectedStock: StockAsset }) {
  const rankings = getSortedProfileRankings(getProfileRankingsForStock(selectedStock));
  const topThreeRankings = rankings.slice(0, 3);
  const sideRankings = rankings.slice(3);

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-black tracking-normal text-slate-950">
            Bảng xếp hạng độ chính xác của hồ sơ
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            {selectedStock.displayName}: xem các hồ sơ thường dự đoán đúng hướng Tăng/Giảm theo độ chính xác.
          </p>
        </div>
        <p className="text-xs font-bold text-slate-400">
          Sắp theo độ chính xác · cùng tỷ lệ ưu tiên số dự đoán
        </p>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt="Banner phần thưởng vua dự đoán 1 chỉ vàng"
        className="rewardImageBanner"
        src={REWARD_BANNER_IMAGE}
      />

      <div className="profileRankingGrid grid gap-3 xl:grid-cols-[minmax(0,3fr)_minmax(300px,1fr)]">
        <div className="grid gap-3 md:grid-cols-3">
          {topThreeRankings.map((profile, index) => (
            <ProfileRankingCard
              displayRank={index + 1}
              isTopWinner={index === 0}
              key={profile.id}
              profile={profile}
            />
          ))}
        </div>

        <ProfileRankingSideList profiles={sideRankings} startRank={4} />
      </div>
    </section>
  );
}

export function StockChartCommunityHome() {
  const assetOptions = useMemo(() => createHomeAssetOptions(stockAssets), []);
  const defaultStock =
    resolveHomeStock(assetOptions, DEFAULT_HOME_STOCK_SYMBOL) ??
    assetOptions[0]?.stock ??
    stockAssets[0];
  const [selectedStock, setSelectedStock] = useState<StockAsset>(defaultStock);
  const [opinions, setOpinions] = useState<StockOpinion[]>([]);
  const [marketCloseCountdown, setMarketCloseCountdown] = useState("00:00:00");
  const [isMobileSummary, setIsMobileSummary] = useState(false);
  const popularStocks = useMemo(
    () =>
      popularTradingViewSymbols
        .map((tradingViewSymbol) =>
          stockAssets.find((stock) => stock.tradingViewSymbol === tradingViewSymbol),
        )
        .filter((stock): stock is StockAsset => Boolean(stock))
        .slice(0, 6),
    [],
  );

  useEffect(() => {
    const checkWidth = () => {
      setIsMobileSummary(window.innerWidth <= MOBILE_SUMMARY_WIDTH);
    };

    checkWidth();
    window.addEventListener("resize", checkWidth);

    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      const storedStock = getStoredHomeStock(assetOptions);

      if (storedStock) {
        setSelectedStock(storedStock);
      }
    }, 0);

    function handleHomeStockSelect(event: Event) {
      const symbol = (event as CustomEvent<{ symbol?: string }>).detail?.symbol;
      const stock = resolveHomeStock(assetOptions, symbol);

      if (stock) {
        setSelectedStock(stock);
      }
    }

    window.addEventListener(HOME_STOCK_SELECT_EVENT, handleHomeStockSelect);

    return () => {
      window.clearTimeout(timerId);
      window.removeEventListener(HOME_STOCK_SELECT_EVENT, handleHomeStockSelect);
    };
  }, [assetOptions]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setMarketCloseCountdown(getMarketCloseCountdown());
    }, 0);

    const intervalId = window.setInterval(() => {
      setMarketCloseCountdown(getMarketCloseCountdown());
    }, 1000);

    return () => {
      window.clearTimeout(timerId);
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setOpinions(getOrSeedStockOpinionsBySymbol(selectedStock.symbol));
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [selectedStock.symbol]);

  function handleStockSelect(stock: StockAsset) {
    setSelectedStock(stock);
    setStoredHomeStock(stock);
  }

  if (isMobileSummary) {
    return (
      <MobileSummaryPage
        assetOptions={assetOptions}
        onStockSelect={handleStockSelect}
        opinions={opinions}
        selectedStock={selectedStock}
      />
    );
  }

  return (
    <div className="homePageShell mx-auto w-full max-w-[1180px] space-y-4 px-4 py-0 sm:px-6 lg:px-8">
      <section className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center sm:justify-between sm:text-left">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:justify-start">
          <h1 className="text-2xl font-black tracking-normal text-slate-950 sm:text-3xl">
          AfterStock
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Sau giờ đóng cửa, xem hướng đi của nhà đầu tư cá nhân.
          </p>
        </div>
        <p className="inline-flex items-center gap-2 text-sm font-bold text-blue-500">
          <Clock className="h-4 w-4" aria-hidden="true" />
          Đến lúc đóng cửa
          <span className="font-black tabular-nums text-slate-950">
            {marketCloseCountdown}
          </span>
        </p>
      </section>

      <MobileSelectedStockSummary stock={selectedStock} />

      <section
        className="heroFeatureGrid grid scroll-mt-20 items-start gap-4 lg:grid-cols-[minmax(0,70%)_minmax(300px,30%)]"
        id="today-sentiment"
      >
        <div className="chartPanelSlot order-2 lg:order-1">
          <UpbitStyleChartLayout
            compact
            headerSlot={
              <AssetSelector
                onSelect={handleStockSelect}
                options={assetOptions}
                selectedStock={selectedStock}
              />
            }
            stock={selectedStock}
          />
        </div>
        <div className="communityPanelSlot order-1 lg:order-2">
          <ChartCommunityPanel opinions={opinions} stock={selectedStock} />
        </div>
      </section>

      <ProfileRankingSection selectedStock={selectedStock} />

      <MarketSnapshotSection onSelect={handleStockSelect} selectedStock={selectedStock} />

      {SHOW_BACKLOG_SECTIONS ? (
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-slate-950">Mã được quan tâm</h2>
            <Button asChild className="h-8 px-2.5 text-xs text-slate-600" variant="ghost">
              <Link href="/stocks">
                Xem thêm mã
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {popularStocks.map((stock) => (
              <PopularStockLink key={stock.symbol} stock={stock} />
            ))}
          </div>
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-950">Tính năng phụ</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Bảng tin và tâm lý thị trường là không gian hỗ trợ ý kiến biểu đồ.
          </p>
          <div className="mt-4 grid gap-2">
            <Button
              asChild
              className="justify-between bg-slate-950 text-white hover:bg-slate-800"
            >
              <Link href="/boards">
                Xem bảng tin
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              className="justify-between border-slate-200 text-slate-700"
              variant="outline"
            >
              <Link href="/sentiment">
                Xem tâm lý thị trường
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </aside>
        </section>
      ) : null}

      <p className="pb-3 text-center text-xs leading-5 text-slate-400">
        Dịch vụ này chỉ cung cấp thông tin dựa trên tham gia cộng đồng và không phải tư vấn đầu tư.
      </p>
    </div>
  );
}
