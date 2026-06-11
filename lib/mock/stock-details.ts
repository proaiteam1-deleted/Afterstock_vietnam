import {
  getStockAssetBySymbol,
  mockStockBoardPosts,
  mockStockOpinions,
  stockAssets,
  stockCategories,
} from "@/lib/stocks/mockStocks";
import type {
  StockAsset,
  StockAssetType,
  StockAvatarType,
  StockBoardCategory,
  StockBoardPost,
  StockComment,
  StockInvestorType,
  StockOpinion,
  StockOpinionDirection,
  StockOpinionReason,
  StockOpinionTimeHorizon,
  UserProfile,
} from "@/types/stock";

export type StockCategory = StockAssetType;
export type StockOpinionStance = StockOpinionDirection;
export type StockOpinionPeriod = StockOpinionTimeHorizon;
export type StockBoardHead = StockBoardCategory;
export type StockBoardComment = StockComment;
export type StockDetailItem = StockAsset;
export type StockProfileOpinion = StockOpinion;
export type StockUserProfile = UserProfile;
export type { StockAvatarType, StockBoardPost, StockInvestorType, StockOpinionReason };

export type StockDiscussionComment = {
  id: string;
  symbol: string;
  nickname: string;
  message: string;
  createdAt: string;
  likes: number;
};

export const stockDetailItems = stockAssets;
export const stockProfileOpinions = mockStockOpinions;
export const stockBoardPosts = mockStockBoardPosts;
export { stockCategories };

export const stockDiscussionComments: StockDiscussionComment[] = [
  {
    id: "stock-discussion-1",
    symbol: "삼성전자",
    nickname: "장기투자자123",
    message: "오늘은 장 막판 수급이 제일 궁금함",
    createdAt: "10:18",
    likes: 7,
  },
  {
    id: "stock-discussion-2",
    symbol: "BTCUSDT",
    nickname: "불장기원456",
    message: "변동성 큰 날은 온도부터 보게 됨",
    createdAt: "10:51",
    likes: 12,
  },
  {
    id: "stock-discussion-3",
    symbol: "엔비디아",
    nickname: "차트구경꾼042",
    message: "의견은 갈리는데 관심도는 확실히 높네요",
    createdAt: "11:34",
    likes: 9,
  },
];

export function getStockDetailBySymbol(symbol: string) {
  return getStockAssetBySymbol(symbol);
}
