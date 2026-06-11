import Link from "next/link";
import { ArrowRight, MessageSquareText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { BoardSection } from "@/lib/mock/market-community";

type BoardCardProps = {
  board: BoardSection;
};

export function BoardCard({ board }: BoardCardProps) {
  const commentCount = board.representativePosts.reduce(
    (total, post) => total + post.comments,
    0,
  );

  return (
    <article
      id={board.id}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-slate-950">{board.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{board.description}</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
          <MessageSquareText className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      <p className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm leading-6 text-slate-600">
        {board.concept}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge className="border-red-200 bg-red-50 text-red-600">
          오늘 글 {board.todayPostCount.toLocaleString("ko-KR")}개
        </Badge>
        <Badge className="border-slate-200 bg-slate-50 text-slate-600">
          댓글 {commentCount.toLocaleString("ko-KR")}
        </Badge>
        {board.tags.slice(0, 3).map((tag) => (
          <Badge key={tag} className="border-slate-200 bg-white text-slate-600">
            #{tag}
          </Badge>
        ))}
      </div>

      <div className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-100">
        {board.representativePosts.slice(0, 3).map((post) => (
          <div key={post.id} className="px-3 py-2.5">
            <div className="line-clamp-1 text-sm font-semibold text-slate-900">
              {post.title}
            </div>
            <div className="mt-1 flex items-center justify-between gap-3 text-xs text-slate-500">
              <span>{post.author}</span>
              <span>댓글 {post.comments}</span>
            </div>
          </div>
        ))}
      </div>

      <Button
        asChild
        className="mt-5 w-full justify-between bg-slate-950 text-white hover:bg-slate-800"
      >
        <Link href={`/boards/${board.slug}`}>
          입장하기
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </Button>
    </article>
  );
}
