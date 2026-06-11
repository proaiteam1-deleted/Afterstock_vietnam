import { MessageCircle, PencilLine } from "lucide-react";

import { BoardCard } from "@/components/boards/board-card";
import { Badge } from "@/components/ui/badge";
import { activeBoardSections } from "@/lib/mock/market-community";

export function BoardListPage() {
  const totalTodayPosts = activeBoardSections.reduce(
    (total, board) => total + board.todayPostCount,
    0,
  );
  const totalComments = activeBoardSections.reduce(
    (total, board) =>
      total +
      board.representativePosts.reduce((postTotal, post) => postTotal + post.comments, 0),
    0,
  );

  return (
    <div className="mx-auto max-w-[1180px] space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <Badge className="border-slate-200 bg-slate-50 text-slate-600">
          커뮤니티 게시판
        </Badge>
        <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              투자자 게시판
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              실제 DB 연결 전까지 더미 데이터로 게시판 구조와 글/댓글 흐름을 먼저
              확인합니다.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <PencilLine className="h-3.5 w-3.5" aria-hidden="true" />
                오늘 글
              </div>
              <p className="mt-1 text-2xl font-bold text-slate-950">
                {totalTodayPosts.toLocaleString("ko-KR")}
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                대표 댓글
              </div>
              <p className="mt-1 text-2xl font-bold text-slate-950">
                {totalComments.toLocaleString("ko-KR")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {activeBoardSections.map((board) => (
          <BoardCard key={board.id} board={board} />
        ))}
      </section>

      <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm leading-6 text-slate-500">
        <strong className="text-slate-800">향후 백로그:</strong> 고위험 매매 인증/관전형
        게시판은 실시간 가격 데이터와 안전 문구 구조를 더 검토한 뒤 별도 기능으로
        다룹니다. 현재 MVP 화면에는 노출하지 않습니다.
      </section>
    </div>
  );
}
