export type StockAssetType = "domestic" | "global" | "coin" | "index";

export type StockOpinionDirection = "bullish" | "neutral" | "bearish";

export type StockAvatarType = "seed" | "chart" | "flame" | "wave" | "ai" | "moon";

export type StockInvestorType =
  | "일반투자자"
  | "단타"
  | "장투"
  | "관망"
  | "과열주의"
  | "AI분석"
  | "Nhà đầu tư cá nhân"
  | "Lướt sóng"
  | "Dài hạn"
  | "Quan sát"
  | "Cẩn thận quá nóng"
  | "Phân tích AI";

export type StockOpinionTimeHorizon = "오늘" | "이번 주" | "이번 달" | "장기" | "Hôm nay" | "Tuần này" | "Tháng này" | "Dài hạn";

export type StockOpinionReason =
  | "차트"
  | "수급"
  | "뉴스"
  | "실적"
  | "감"
  | "커뮤니티 분위기"
  | "Biểu đồ"
  | "Dòng tiền"
  | "Tin tức"
  | "Kết quả"
  | "Cảm nhận"
  | "Tâm lý cộng đồng";

export type StockBoardCategory =
  | "일반"
  | "질문"
  | "정보"
  | "뇌피셜"
  | "차트"
  | "뉴스반응"
  | "Chung"
  | "Câu hỏi"
  | "Thông tin"
  | "Góc nhìn"
  | "Biểu đồ"
  | "Phản ứng tin tức";

export type StockAsset = {
  symbol: string;
  displayName: string;
  market: string;
  tradingViewSymbol: string;
  assetType: StockAssetType;
  price: string;
  changeRate: number;
  opinionCount: number;
  bullishPercent: number;
  bearishPercent: number;
  chartPoints: number[];
};

export type UserProfile = {
  id: string;
  nickname: string;
  avatarType: StockAvatarType;
  investorType: StockInvestorType;
  createdAt: string;
};

export type StockOpinion = {
  id: string;
  symbol: string;
  userId: string;
  nickname: string;
  avatarType: StockAvatarType;
  investorType: StockInvestorType;
  direction: StockOpinionDirection;
  title: string;
  body: string;
  tags: string[];
  timeHorizon: StockOpinionTimeHorizon;
  reasons: StockOpinionReason[];
  likes: number;
  dislikes: number;
  createdAt: string;
  commentCount: number;
};

export type StockComment = {
  id: string;
  postId: string;
  nickname: string;
  body: string;
  likes: number;
  dislikes: number;
  createdAt: string;
};

export type StockBoardPost = {
  id: string;
  symbol: string;
  category: StockBoardCategory;
  title: string;
  body: string;
  nickname: string;
  comments: StockComment[];
  views: number;
  likes: number;
  dislikes: number;
  createdAt: string;
};
