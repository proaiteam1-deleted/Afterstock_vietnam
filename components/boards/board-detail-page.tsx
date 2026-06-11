import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";

import { BeastHeartBoard } from "@/components/boards/beast-heart-board";
import { CaptureTradingBoard } from "@/components/boards/capture-trading-board";
import { FastReactionBoard } from "@/components/boards/fast-reaction-board";
import { StockOpinionBoard } from "@/components/boards/stock-opinion-board";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { BoardSection } from "@/lib/mock/market-community";

type BoardDetailPageProps = {
  board: BoardSection;
};

export function BoardDetailPage({ board }: BoardDetailPageProps) {
  if (board.id === "capture-trading") {
    return <CaptureTradingBoard board={board} />;
  }

  if (board.id === "stock-chat") {
    return <StockOpinionBoard board={board} />;
  }

  if (board.id === "fast-reactions") {
    return <FastReactionBoard board={board} />;
  }

  if (board.id === "beast-heart") {
    return <BeastHeartBoard board={board} />;
  }

  return (
    <div className="mx-auto max-w-[1180px] space-y-6">
      <Button
        asChild
        className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
        size="sm"
        variant="outline"
      >
        <Link href="/boards">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          게시판 목록
        </Link>
      </Button>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="border-red-200 bg-red-50 text-red-600">
            오늘 글 {board.todayPostCount.toLocaleString("ko-KR")}개
          </Badge>
          {board.tags.map((tag) => (
            <Badge key={tag} className="border-slate-200 bg-slate-50 text-slate-600">
              #{tag}
            </Badge>
          ))}
        </div>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          {board.title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          {board.description}
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-500">{board.concept}</p>
      </section>

      <section className="space-y-3">
        {board.representativePosts.map((post) => (
          <article
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            key={post.id}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="line-clamp-1 text-lg font-bold text-slate-950">
                  {post.title}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {post.author} · {post.timeLabel}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5 text-sm text-slate-500">
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                {post.comments}
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              이 게시판은 자유롭게 글을 쓰고 댓글을 다는 흐름을 먼저 보여주는 MVP
              화면입니다. 작성/댓글 저장 기능은 각 전용 게시판부터 순차적으로 연결합니다.
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
