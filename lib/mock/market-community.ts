export type MarketDirection = "up" | "down";

export type MarketTarget = {
  id: string;
  name: string;
  description: string;
  initialUp: number;
  initialDown: number;
};

export type MarketPredictionCounts = {
  up: number;
  down: number;
};

export type ChatMessageSeed = {
  id: string;
  nickname: string;
  message: string;
  timeLabel: string;
};

export type BoardSection = {
  id: string;
  slug: string;
  aliases?: string[];
  title: string;
  description: string;
  concept: string;
  todayPostCount: number;
  tags: string[];
  representativePosts: BoardPostPreview[];
};

export type BoardPostPreview = {
  id: string;
  title: string;
  author: string;
  timeLabel: string;
  comments: number;
};

export type CaptureTradingPost = {
  id: string;
  title: string;
  stockName: string;
  profitRate: number;
  note: string;
  createdAt: string;
  comments: number;
  author: string;
};

export type StockOpinion = "good" | "neutral" | "bad";

export type StockOpinionPost = {
  id: string;
  stockName: string;
  opinion: StockOpinion;
  note: string;
  tag: string;
  author: string;
  createdAt: string;
  likes: number;
  dislikes: number;
};

export type FastReactionMood = "positive" | "negative" | "unknown";

export type FastReactionCounts = Record<FastReactionMood, number>;

export type FastReactionComment = {
  id: string;
  nickname: string;
  message: string;
  timeLabel: string;
};

export type FastReactionIssue = {
  id: string;
  title: string;
  sector: string;
  createdAt: string;
  reactions: FastReactionCounts;
  comments: FastReactionComment[];
};

export type BeastHeartReaction = "watching" | "respect" | "concern";

export type BeastHeartAssetType = "stock" | "coin" | "index" | "etf-etn" | "other";

export type BeastHeartDirection = "long" | "short" | "spot" | "break-watch";

export type BeastHeartLeverage =
  | "none"
  | "2x"
  | "3x"
  | "5x"
  | "10x"
  | "20x"
  | "50x"
  | "100x-plus";

export type BeastHeartPost = {
  id: string;
  title: string;
  assetType: BeastHeartAssetType;
  assetName: string;
  direction: BeastHeartDirection;
  entryPrice: number;
  leverage: BeastHeartLeverage;
  currentPrice: number;
  note: string;
  author: string;
  createdAt: string;
  viewers: number;
  reactions: Record<BeastHeartReaction, number>;
};

export const marketTargets: MarketTarget[] = [
  {
    id: "kospi",
    name: "코스피",
    description: "국내 대형주 분위기",
    initialUp: 63,
    initialDown: 37,
  },
  {
    id: "kosdaq",
    name: "코스닥",
    description: "성장주와 테마주 흐름",
    initialUp: 48,
    initialDown: 52,
  },
  {
    id: "nasdaq",
    name: "나스닥",
    description: "미국 기술주 심리",
    initialUp: 56,
    initialDown: 44,
  },
  {
    id: "sp500",
    name: "S&P500",
    description: "미국 전체 시장 분위기",
    initialUp: 51,
    initialDown: 49,
  },
  {
    id: "bitcoin",
    name: "비트코인",
    description: "코인 시장 대표 심리",
    initialUp: 58,
    initialDown: 42,
  },
];

export const initialChatMessages: ChatMessageSeed[] = [
  {
    id: "seed-1",
    nickname: "장기투자자123",
    message: "코스피 오늘은 반등 좀 해라",
    timeLabel: "09:12",
  },
  {
    id: "seed-2",
    nickname: "캡쳐하면고점555",
    message: "캡쳐하고 싶으면 팔 때라는 말 ㄹㅇ",
    timeLabel: "09:18",
  },
  {
    id: "seed-3",
    nickname: "불장기원456",
    message: "나스닥 선물 분위기 애매한데",
    timeLabel: "09:25",
  },
  {
    id: "seed-4",
    nickname: "관망투자자789",
    message: "오늘 상승파 많으면 오히려 무섭다",
    timeLabel: "09:31",
  },
  {
    id: "seed-5",
    nickname: "오늘도손절321",
    message: "점심 지나고 방향 나올 듯",
    timeLabel: "09:36",
  },
];

export const randomNicknames = [
  "장기투자자",
  "불장기원",
  "관망투자자",
  "오늘도손절",
  "캡쳐하면고점",
];

export const boardSections: BoardSection[] = [
  {
    id: "capture-trading",
    slug: "capture-trade",
    aliases: ["capture-trading"],
    title: "캡쳐매매 게시판",
    description: "자랑하고 싶을 때가 고점일 수도 있습니다.",
    concept: "수익 캡쳐, 매매 인증, 고점 경고 밈",
    todayPostCount: 128,
    tags: ["수익인증", "고점주의", "매매복기"],
    representativePosts: [
      {
        id: "capture-1",
        title: "계좌 캡쳐하려다 손이 떨려서 절반만 익절함",
        author: "캡쳐하면고점555",
        timeLabel: "10:12",
        comments: 18,
      },
      {
        id: "capture-2",
        title: "이 정도면 자랑해도 되는 수익인가요",
        author: "분할매수러217",
        timeLabel: "10:28",
        comments: 9,
      },
      {
        id: "capture-3",
        title: "캡쳐 올렸으니 이제 내려갈 차례인가",
        author: "고점탐지기404",
        timeLabel: "11:03",
        comments: 24,
      },
    ],
  },
  {
    id: "stop-loss",
    slug: "stop-loss",
    title: "오늘의 손절 게시판",
    description: "아픈 손절도 기록하면 데이터가 됩니다.",
    concept: "손절 후기, 실패 복기",
    todayPostCount: 74,
    tags: ["손절후기", "실패복기", "멘탈관리"],
    representativePosts: [
      {
        id: "stop-1",
        title: "손절은 했는데 왜 마음은 더 편한지",
        author: "오늘도손절321",
        timeLabel: "09:54",
        comments: 14,
      },
      {
        id: "stop-2",
        title: "물타기 금지 원칙 어긴 결과 공유합니다",
        author: "원칙매매실패",
        timeLabel: "10:41",
        comments: 31,
      },
      {
        id: "stop-3",
        title: "차트보다 내 욕심이 문제였던 매매",
        author: "리스크관리형",
        timeLabel: "12:05",
        comments: 11,
      },
    ],
  },
  {
    id: "bull-bear",
    slug: "bull-bear",
    title: "불장/곰장 토론방",
    description: "오늘 장 분위기를 상승파와 하락파가 같이 떠드는 곳",
    concept: "시장 방향 토론",
    todayPostCount: 96,
    tags: ["상승파", "하락파", "시장토론"],
    representativePosts: [
      {
        id: "bull-bear-1",
        title: "오후장 수급 보면 아직 상승파가 살아있음",
        author: "불장기원456",
        timeLabel: "11:17",
        comments: 42,
      },
      {
        id: "bull-bear-2",
        title: "오늘 반등은 기술적 반등에 가까워 보입니다",
        author: "곰장레이더",
        timeLabel: "11:36",
        comments: 27,
      },
      {
        id: "bull-bear-3",
        title: "환율 때문에 내일도 조심해야 할 듯",
        author: "매크로눈치러",
        timeLabel: "12:22",
        comments: 16,
      },
    ],
  },
  {
    id: "stock-chat",
    slug: "stock-talk",
    aliases: ["stock-chat"],
    title: "종목 한마디",
    description: "긴 분석 말고 한 줄로 종목 의견 남기기",
    concept: "종목별 짧은 의견",
    todayPostCount: 211,
    tags: ["삼성전자", "하이닉스", "2차전지"],
    representativePosts: [
      {
        id: "stock-1",
        title: "삼전은 오늘 거래량이 말해주는 느낌",
        author: "장기투자자123",
        timeLabel: "09:47",
        comments: 36,
      },
      {
        id: "stock-2",
        title: "하이닉스는 조정 와도 관심권",
        author: "반도체관찰자",
        timeLabel: "10:19",
        comments: 22,
      },
      {
        id: "stock-3",
        title: "2차전지 오늘은 테마 힘이 약한 듯",
        author: "테마주탐색",
        timeLabel: "12:11",
        comments: 19,
      },
    ],
  },
  {
    id: "fast-reactions",
    slug: "retail-reaction",
    aliases: ["fast-reactions"],
    title: "뉴스보다 빠른 투자자 반응",
    description: "뉴스보다 먼저 나오는 체감 반응",
    concept: "이슈/뉴스/테마 반응",
    todayPostCount: 53,
    tags: ["속보반응", "테마감지", "체감수급"],
    representativePosts: [
      {
        id: "fast-1",
        title: "아직 기사 안 떴는데 관련주 먼저 움직임",
        author: "뉴스전감지",
        timeLabel: "10:03",
        comments: 29,
      },
      {
        id: "fast-2",
        title: "수급 들어오는 속도가 평소랑 다름",
        author: "호가창탐험가",
        timeLabel: "10:34",
        comments: 17,
      },
      {
        id: "fast-3",
        title: "테마명 붙기 전에 반응 온 것 같음",
        author: "테마레이더",
        timeLabel: "11:49",
        comments: 13,
      },
    ],
  },
  {
    id: "beast-heart",
    slug: "beast-heart",
    title: "야수의 심장",
    description: "고위험 매매 인증을 실시간으로 보는 참여자 관전방",
    concept: "진입은 본인 책임, 관전은 모두의 재미",
    todayPostCount: 89,
    tags: ["레버리지", "몰빵", "실시간관전", "야수인증"],
    representativePosts: [
      {
        id: "beast-1",
        title: "비트코인 120배 롱 진입 인증",
        author: "야수인증러777",
        timeLabel: "09:58",
        comments: 63,
      },
      {
        id: "beast-2",
        title: "테슬라 장전 풀매수 관전방 열림",
        author: "장전심장박동",
        timeLabel: "10:21",
        comments: 48,
      },
      {
        id: "beast-3",
        title: "엔비디아 실적 전 풀진입 기록",
        author: "손떨리는불장",
        timeLabel: "11:02",
        comments: 71,
      },
    ],
  },
];

export const captureTradingPosts: CaptureTradingPost[] = [
  {
    id: "capture-dummy-1",
    title: "수익률 캡쳐 버튼 누르기 직전입니다",
    stockName: "삼성전자",
    profitRate: 18.4,
    note: "캡쳐했으면 한 번쯤 의심해볼 타이밍이라는 말이 계속 생각납니다.",
    createdAt: "10:12",
    comments: 18,
    author: "캡쳐하면고점555",
  },
  {
    id: "capture-dummy-2",
    title: "하이닉스 덕분에 오늘 점심이 든든합니다",
    stockName: "SK하이닉스",
    profitRate: 27.8,
    note: "자랑하고 싶을 때가 가장 많이 올랐을 때라면, 오늘은 반만 덜어볼까 싶네요.",
    createdAt: "10:28",
    comments: 24,
    author: "분할매수러217",
  },
  {
    id: "capture-dummy-3",
    title: "이 정도면 레전드 캡쳐 인정인가요",
    stockName: "두산로보틱스",
    profitRate: 53.2,
    note: "기분은 좋지만 이런 날일수록 캡쳐보다 원칙을 먼저 봐야겠습니다.",
    createdAt: "11:03",
    comments: 41,
    author: "고점탐지기404",
  },
  {
    id: "capture-dummy-4",
    title: "계좌가 초록색이면 마음도 초록색",
    stockName: "NAVER",
    profitRate: 9.6,
    note: "아직 자랑하기엔 애매해서 기록만 남깁니다.",
    createdAt: "12:20",
    comments: 7,
    author: "장기투자자123",
  },
];

export const stockOpinionPosts: StockOpinionPost[] = [
  {
    id: "stock-opinion-dummy-1",
    stockName: "삼성전자",
    opinion: "neutral",
    note: "방향은 애매하지만 거래량은 계속 보게 됩니다.",
    tag: "반도체",
    author: "장기투자자123",
    createdAt: "09:47",
    likes: 24,
    dislikes: 6,
  },
  {
    id: "stock-opinion-dummy-2",
    stockName: "SK하이닉스",
    opinion: "good",
    note: "조정이 와도 관심권이라는 의견입니다.",
    tag: "AI",
    author: "반도체관찰자",
    createdAt: "10:19",
    likes: 31,
    dislikes: 8,
  },
  {
    id: "stock-opinion-dummy-3",
    stockName: "네이버",
    opinion: "neutral",
    note: "반등은 나왔는데 아직 확신까지는 어렵네요.",
    tag: "플랫폼",
    author: "차트구경꾼442",
    createdAt: "10:42",
    likes: 12,
    dislikes: 5,
  },
  {
    id: "stock-opinion-dummy-4",
    stockName: "카카오",
    opinion: "bad",
    note: "분위기는 아직 무겁다는 쪽에 가깝습니다.",
    tag: "플랫폼",
    author: "관망투자자789",
    createdAt: "11:08",
    likes: 18,
    dislikes: 11,
  },
  {
    id: "stock-opinion-dummy-5",
    stockName: "한화에어로스페이스",
    opinion: "good",
    note: "테마 힘은 살아있지만 과열감도 같이 봐야 할 듯합니다.",
    tag: "방산",
    author: "테마레이더",
    createdAt: "11:31",
    likes: 27,
    dislikes: 9,
  },
  {
    id: "stock-opinion-dummy-6",
    stockName: "두산에너빌리티",
    opinion: "neutral",
    note: "뉴스보다 수급 확인이 먼저인 구간 같습니다.",
    tag: "원전",
    author: "뉴스전감지",
    createdAt: "12:02",
    likes: 16,
    dislikes: 7,
  },
  {
    id: "stock-opinion-dummy-7",
    stockName: "에코프로",
    opinion: "bad",
    note: "오늘은 테마 힘이 약해서 조심스럽게 봅니다.",
    tag: "2차전지",
    author: "오늘도손절321",
    createdAt: "12:18",
    likes: 14,
    dislikes: 10,
  },
];

export const fastReactionIssues: FastReactionIssue[] = [
  {
    id: "fast-issue-semiconductor-supply",
    title: "반도체 수급 개선 기대감",
    sector: "반도체",
    createdAt: "09:42",
    reactions: {
      positive: 64,
      negative: 18,
      unknown: 23,
    },
    comments: [
      {
        id: "fast-comment-1-1",
        nickname: "반도체관찰자219",
        message: "호가창이 어제랑 확실히 다르게 보임",
        timeLabel: "09:45",
      },
      {
        id: "fast-comment-1-2",
        nickname: "수급체크러308",
        message: "기사보다 먼저 수급이 움직이는 느낌",
        timeLabel: "09:48",
      },
      {
        id: "fast-comment-1-3",
        nickname: "장기투자자123",
        message: "아직 확신은 아닌데 분위기는 좋아졌음",
        timeLabel: "09:53",
      },
    ],
  },
  {
    id: "fast-issue-exchange-rate",
    title: "환율 재상승 부담",
    sector: "매크로",
    createdAt: "10:06",
    reactions: {
      positive: 12,
      negative: 58,
      unknown: 31,
    },
    comments: [
      {
        id: "fast-comment-2-1",
        nickname: "매크로눈치러442",
        message: "환율 때문에 오후장 조심하는 분위기",
        timeLabel: "10:09",
      },
      {
        id: "fast-comment-2-2",
        nickname: "곰장레이더117",
        message: "지수는 버티는데 체감은 살짝 무거움",
        timeLabel: "10:18",
      },
      {
        id: "fast-comment-2-3",
        nickname: "불장기원456",
        message: "이 정도면 아직 모름 쪽에 한 표",
        timeLabel: "10:25",
      },
    ],
  },
  {
    id: "fast-issue-defense-strength",
    title: "방산주 강세 지속 여부",
    sector: "방산",
    createdAt: "10:31",
    reactions: {
      positive: 46,
      negative: 21,
      unknown: 36,
    },
    comments: [
      {
        id: "fast-comment-3-1",
        nickname: "테마레이더510",
        message: "강하긴 한데 따라가기엔 속도가 빠름",
        timeLabel: "10:34",
      },
      {
        id: "fast-comment-3-2",
        nickname: "오늘도손절321",
        message: "체감상 관심은 계속 붙는 중",
        timeLabel: "10:39",
      },
      {
        id: "fast-comment-3-3",
        nickname: "뉴스전감지204",
        message: "커뮤니티 언급량은 확실히 늘었음",
        timeLabel: "10:44",
      },
    ],
  },
  {
    id: "fast-issue-ai-overheat",
    title: "AI 관련주 단기 과열 논란",
    sector: "AI",
    createdAt: "11:02",
    reactions: {
      positive: 28,
      negative: 43,
      unknown: 34,
    },
    comments: [
      {
        id: "fast-comment-4-1",
        nickname: "차트구경꾼442",
        message: "좋은 이슈인 건 맞는데 단기 피로감도 있어 보임",
        timeLabel: "11:05",
      },
      {
        id: "fast-comment-4-2",
        nickname: "관망투자자789",
        message: "이럴 때는 댓글 온도부터 보는 게 나음",
        timeLabel: "11:12",
      },
      {
        id: "fast-comment-4-3",
        nickname: "호가창탐험가619",
        message: "종목별로 반응 차이가 꽤 큼",
        timeLabel: "11:18",
      },
    ],
  },
  {
    id: "fast-issue-battery-rebound",
    title: "2차전지 저점 반등 기대",
    sector: "2차전지",
    createdAt: "11:27",
    reactions: {
      positive: 39,
      negative: 27,
      unknown: 41,
    },
    comments: [
      {
        id: "fast-comment-5-1",
        nickname: "테마주탐색704",
        message: "저점 얘기는 나오는데 아직 거래대금은 더 봐야 함",
        timeLabel: "11:31",
      },
      {
        id: "fast-comment-5-2",
        nickname: "캡쳐하면고점555",
        message: "반등 기대감은 있는데 확신은 어려움",
        timeLabel: "11:36",
      },
      {
        id: "fast-comment-5-3",
        nickname: "수급체크러308",
        message: "오후에 한 번 더 확인하고 싶음",
        timeLabel: "11:48",
      },
    ],
  },
];

export const beastHeartPosts: BeastHeartPost[] = [
  {
    id: "beast-dummy-1",
    title: "비트코인 120배 롱 진입 인증",
    assetType: "coin",
    assetName: "BTCUSDT",
    direction: "long",
    entryPrice: 105000000,
    leverage: "100x-plus",
    currentPrice: 105820000,
    note: "손절선은 정해뒀고, 오늘은 관전 기록용으로만 올립니다.",
    author: "야수인증러777",
    createdAt: "09:58",
    viewers: 342,
    reactions: {
      watching: 128,
      respect: 91,
      concern: 74,
    },
  },
  {
    id: "beast-dummy-2",
    title: "테슬라 장전 풀매수 관전방",
    assetType: "stock",
    assetName: "테슬라",
    direction: "spot",
    entryPrice: 238.4,
    leverage: "none",
    currentPrice: 235.9,
    note: "제 선택을 남기는 기록입니다. 관전만 해주세요.",
    author: "장전심장박동",
    createdAt: "10:21",
    viewers: 218,
    reactions: {
      watching: 89,
      respect: 54,
      concern: 61,
    },
  },
  {
    id: "beast-dummy-3",
    title: "코스닥 인버스 몰빵 기록",
    assetType: "etf-etn",
    assetName: "코스닥 인버스",
    direction: "short",
    entryPrice: 4820,
    leverage: "3x",
    currentPrice: 4895,
    note: "틀리면 복기하려고 남기는 기록입니다. 따라 하라는 뜻은 아닙니다.",
    author: "인버스외길",
    createdAt: "10:44",
    viewers: 176,
    reactions: {
      watching: 73,
      respect: 36,
      concern: 88,
    },
  },
  {
    id: "beast-dummy-4",
    title: "엔비디아 실적 전 풀진입",
    assetType: "stock",
    assetName: "엔비디아",
    direction: "break-watch",
    entryPrice: 141.2,
    leverage: "5x",
    currentPrice: 144.6,
    note: "결과와 상관없이 포지션 기록용입니다. 투자 권유 아닙니다.",
    author: "손떨리는불장",
    createdAt: "11:02",
    viewers: 401,
    reactions: {
      watching: 144,
      respect: 102,
      concern: 97,
    },
  },
];

export function getBoardSectionById(id: string) {
  return boardSections.find((board) => board.id === id && board.id !== "beast-heart");
}

export function getBoardSectionBySlug(slug: string) {
  return boardSections.find(
    (board) =>
      board.id !== "beast-heart" &&
      (board.slug === slug || board.aliases?.includes(slug)),
  );
}

export function getBoardStaticSlugs() {
  return boardSections
    .filter((board) => board.id !== "beast-heart")
    .flatMap((board) => [board.slug, ...(board.aliases ?? [])]);
}

export const activeBoardSections = boardSections.filter(
  (board) => board.id !== "beast-heart",
);
