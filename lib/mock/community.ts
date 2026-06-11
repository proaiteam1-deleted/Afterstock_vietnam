import type { CommunityPost } from "@/lib/types";

export const communityPosts: CommunityPost[] = [
  {
    id: "post-1",
    userId: "user-1",
    stockSymbol: "005930",
    title: "삼성전자 심리가 조금 빠르게 뜨거워지는 중",
    body: "장 마감 후 수급 뉴스보다 투표 쏠림이 먼저 움직였습니다. 오늘은 상승 의견이 빠르게 쌓여서 내일 시초 반응을 조심해서 볼 생각입니다.",
    createdAt: "2026-05-29T21:04:00+09:00",
    likes: 84,
  },
  {
    id: "post-2",
    userId: "user-2",
    stockSymbol: "000660",
    title: "하이닉스는 아직 방향보다 변동성 체크",
    body: "하락 의견이 살짝 많지만 과열로 보긴 어렵습니다. 엔비디아 흐름과 환율 반응까지 같이 봐야 할 구간 같습니다.",
    createdAt: "2026-05-29T21:22:00+09:00",
    likes: 57,
  },
  {
    id: "post-3",
    userId: "user-3",
    stockSymbol: "005930",
    title: "이미지 인증 기능 들어오면 차트 캡처 공유해보고 싶네요",
    body: "매매 인증보다 본인 관점의 근거를 남기는 쪽이면 커뮤니티가 훨씬 깔끔해질 것 같습니다.",
    createdAt: "2026-05-29T22:02:00+09:00",
    likes: 31,
  },
];
