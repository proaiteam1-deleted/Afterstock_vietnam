"use client";

import Link from "next/link";
import { ArrowLeft, ImagePlus, MessageCircle, PenLine } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  captureTradingPosts,
  type BoardSection,
  type CaptureTradingPost,
} from "@/lib/mock/market-community";
import { getOrSeedCaptureTradingPosts, setCaptureTradingPosts } from "@/lib/storage";

type CaptureTradingBoardProps = {
  board: BoardSection;
};

type CaptureFormState = {
  title: string;
  stockName: string;
  profitRate: string;
  note: string;
};

const initialFormState: CaptureFormState = {
  title: "",
  stockName: "",
  profitRate: "",
  note: "",
};

function getCurrentTimeLabel() {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

function getAlertBadge(profitRate: number) {
  if (profitRate >= 50) {
    return <Badge variant="warning">레전드 캡쳐</Badge>;
  }

  if (profitRate >= 20) {
    return <Badge variant="danger">고점 경보</Badge>;
  }

  return null;
}

function CapturePostCard({ post }: { post: CaptureTradingPost }) {
  const alertBadge = getAlertBadge(post.profitRate);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>{post.title}</CardTitle>
              {alertBadge}
            </div>
            <CardDescription>
              {post.author} · {post.createdAt}
            </CardDescription>
          </div>
          <div className="rounded-lg border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-sm font-semibold text-emerald-100">
            +{post.profitRate.toLocaleString("ko-KR", { maximumFractionDigits: 1 })}%
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="accent">{post.stockName}</Badge>
          <div className="flex items-center gap-1.5 text-sm text-slate-400">
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            댓글 {post.comments}
          </div>
        </div>
        <p className="text-sm leading-6 text-slate-300">{post.note}</p>
      </CardContent>
    </Card>
  );
}

export function CaptureTradingBoard({ board }: CaptureTradingBoardProps) {
  const [isWriting, setIsWriting] = useState(false);
  const [form, setForm] = useState<CaptureFormState>(initialFormState);
  const [myPosts, setMyPosts] = useState<CaptureTradingPost[]>([]);
  const posts = useMemo(() => [...myPosts, ...captureTradingPosts], [myPosts]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setMyPosts(getOrSeedCaptureTradingPosts());
    }, 0);

    return () => window.clearTimeout(timerId);
  }, []);

  function updateForm(field: keyof CaptureFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const profitRate = Number(form.profitRate);

    if (!form.title.trim() || !form.stockName.trim() || !form.note.trim()) {
      return;
    }

    if (!Number.isFinite(profitRate)) {
      return;
    }

    const nextPost: CaptureTradingPost = {
      id: `capture-local-${Date.now()}`,
      title: form.title.trim(),
      stockName: form.stockName.trim(),
      profitRate,
      note: form.note.trim(),
      createdAt: getCurrentTimeLabel(),
      comments: Math.floor(Math.random() * 8),
      author: "나의 캡쳐",
    };
    const nextPosts = [nextPost, ...myPosts];

    setMyPosts(nextPosts);
    setCaptureTradingPosts(nextPosts);
    setForm(initialFormState);
    setIsWriting(false);
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/boards">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          게시판 목록
        </Link>
      </Button>

      <section className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="accent">캡쳐매매</Badge>
            <Badge>수익 캡쳐</Badge>
            <Badge>고점 경고 밈</Badge>
          </div>
          <div className="max-w-3xl space-y-3">
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">
              {board.title}
            </h1>
            <p className="text-base leading-7 text-slate-300">
              누구한테 자랑하고 싶을 때가 가장 많이 올랐을 때다.
            </p>
            <p className="text-sm leading-6 text-slate-500">
              수익 캡쳐를 올리고 싶을 때, 한 번쯤 매도 타이밍도 같이 생각해보자는 커뮤니티
              놀이형 기록 게시판입니다. 실제 투자 조언은 아닙니다.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>오늘의 분위기</CardTitle>
            <CardDescription>캡쳐했으면 한 번쯤 의심해볼 타이밍</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">오늘 글</span>
              <span className="font-semibold text-white">
                {(board.todayPostCount + myPosts.length).toLocaleString("ko-KR")}개
              </span>
            </div>
            <Button
              className="w-full"
              onClick={() => setIsWriting((current) => !current)}
            >
              <PenLine className="h-4 w-4" aria-hidden="true" />
              글쓰기
            </Button>
          </CardContent>
        </Card>
      </section>

      {isWriting ? (
        <Card>
          <CardHeader>
            <CardTitle>캡쳐매매 글쓰기</CardTitle>
            <CardDescription>
              자랑과 복기 사이, 오늘의 수익 캡쳐를 가볍게 기록해보세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">
                  제목
                  <input
                    className="w-full rounded-md border border-white/10 bg-black/24 px-3 py-2 text-white outline-none transition focus:border-cyan-300/50"
                    value={form.title}
                    placeholder="캡쳐했으면 의심해볼 타이밍"
                    onChange={(event) => updateForm("title", event.target.value)}
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  종목명
                  <input
                    className="w-full rounded-md border border-white/10 bg-black/24 px-3 py-2 text-white outline-none transition focus:border-cyan-300/50"
                    value={form.stockName}
                    placeholder="예: 삼성전자"
                    onChange={(event) => updateForm("stockName", event.target.value)}
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                <label className="space-y-2 text-sm text-slate-300">
                  수익률 %
                  <input
                    className="w-full rounded-md border border-white/10 bg-black/24 px-3 py-2 text-white outline-none transition focus:border-cyan-300/50"
                    value={form.profitRate}
                    inputMode="decimal"
                    placeholder="예: 24.5"
                    onChange={(event) => updateForm("profitRate", event.target.value)}
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  한마디
                  <input
                    className="w-full rounded-md border border-white/10 bg-black/24 px-3 py-2 text-white outline-none transition focus:border-cyan-300/50"
                    value={form.note}
                    placeholder="기분은 좋지만 원칙도 같이 봅니다"
                    onChange={(event) => updateForm("note", event.target.value)}
                  />
                </label>
              </div>

              <div className="flex min-h-28 flex-col items-center justify-center rounded-lg border border-dashed border-white/15 bg-white/[0.035] p-4 text-center">
                <ImagePlus className="h-6 w-6 text-slate-400" aria-hidden="true" />
                <div className="mt-2 text-sm font-medium text-slate-200">
                  이미지 업로드 영역
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  실제 업로드는 아직 연결하지 않고 UI만 제공합니다.
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsWriting(false)}
                >
                  취소
                </Button>
                <Button type="submit">작성 완료</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <section className="space-y-3">
        {posts.map((post) => (
          <CapturePostCard key={post.id} post={post} />
        ))}
      </section>
    </div>
  );
}
